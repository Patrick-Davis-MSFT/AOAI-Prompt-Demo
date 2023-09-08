import os
import io
import mimetypes
import time
import logging
import openai
import sys
from flask import Flask, request, jsonify, send_file, abort
from azure.identity import DefaultAzureCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from approaches.retrievethenread import RetrieveThenReadApproach
from approaches.readretrieveread import ReadRetrieveReadApproach
from approaches.readdecomposeask import ReadDecomposeAsk
from approaches.chatreadretrieveread import ChatReadRetrieveReadApproach
from approaches.summaryFullText import summaryFullText
from approaches.openBoxFullText import openBoxFullText
from approaches.textCompare import textCompare
from approaches.indexResumeFiles import indexResumeFiles
from azure.storage.blob import BlobServiceClient

# Replace these with your own values, either in environment variables or directly here
AZURE_STORAGE_ACCOUNT = os.environ.get("AZURE_STORAGE_ACCOUNT") or "mystorageaccount"
AZURE_STORAGE_CONTAINER = os.environ.get("AZURE_STORAGE_CONTAINER") or "content"
AZURE_SEARCH_SERVICE = os.environ.get("AZURE_SEARCH_SERVICE") or "gptkb"
AZURE_SEARCH_INDEX = os.environ.get("AZURE_SEARCH_INDEX") or "gptkbindex"
AZURE_OPENAI_SERVICE = os.environ.get("AZURE_OPENAI_SERVICE") or "myopenai"
AZURE_OPENAI_GPT_DEPLOYMENT = os.environ.get("AZURE_OPENAI_GPT_DEPLOYMENT") or "davinci"
AZURE_OPENAI_CHATGPT_DEPLOYMENT = os.environ.get("AZURE_OPENAI_CHATGPT_DEPLOYMENT") or "chat"
AZURE_OPENAI_CHATGPT_MODEL = os.environ.get("AZURE_OPENAI_CHATGPT_MODEL") or "gpt-35-turbo"
AZURE_OPENAI_EMB_DEPLOYMENT = os.environ.get("AZURE_OPENAI_EMB_DEPLOYMENT") or "embedding"
AZURE_STG_RESUME_CONTAINER = os.environ.get("AZURE_STG_RESUME_CONTAINER") or "stage-resumes"
AZURE_IDX_RESUME_CONTAINER = os.environ.get("AZURE_IDX_RESUME_CONTAINER") or "indexed-resumes"
AZURE_FORMRECOGNIZER_SERVICE = os.environ.get("AZURE_FORMRECOGNIZER_SERVICE") or "myformrecognizer"
AZURE_FORMRECOGNIZER_KEY = os.environ.get("AZURE_FORMRECOGNIZER_KEY") or "myformrecognizerkey"

KB_FIELDS_CONTENT = os.environ.get("KB_FIELDS_CONTENT") or "content"
KB_FIELDS_CATEGORY = os.environ.get("KB_FIELDS_CATEGORY") or "category"
KB_FIELDS_SOURCEPAGE = os.environ.get("KB_FIELDS_SOURCEPAGE") or "sourcepage"

# Use the current user identity to authenticate with Azure OpenAI, Cognitive Search and Blob Storage (no secrets needed, 
# just use 'az login' locally, and managed identity when deployed on Azure). If you need to use keys, use separate AzureKeyCredential instances with the 
# keys for each service
# If you encounter a blocking error during a DefaultAzureCredntial resolution, you can exclude the problematic credential by using a parameter (ex. exclude_shared_token_cache_credential=True)
azure_credential = DefaultAzureCredential(exclude_shared_token_cache_credential = True)

# Used by the OpenAI SDK
openai.api_type = "azure"
openai.api_base = f"https://{AZURE_OPENAI_SERVICE}.openai.azure.com"
openai.api_version = "2023-05-15"

##Added APIM Endpoint if set 
AZURE_APIM_OPENAI_URL = os.environ.get("AZURE_APIM_OPENAI_URL", "")
if AZURE_APIM_OPENAI_URL != "":
    openai.api_base = AZURE_APIM_OPENAI_URL

# Comment these two lines out if using keys, set your API key in the OPENAI_API_KEY environment variable instead
openai.api_type = "azure_ad"
openai_token = azure_credential.get_token("https://cognitiveservices.azure.com/.default")
openai.api_key = openai_token.token

# Set up clients for Cognitive Search and Storage
search_client = SearchClient(
    endpoint=f"https://{AZURE_SEARCH_SERVICE}.search.windows.net",
    index_name=AZURE_SEARCH_INDEX,
    credential=azure_credential)
blob_client = BlobServiceClient(
    account_url=f"https://{AZURE_STORAGE_ACCOUNT}.blob.core.windows.net", 
    credential=azure_credential)
blob_container = blob_client.get_container_client(AZURE_STORAGE_CONTAINER)

# Various approaches to integrate GPT and external knowledge, most applications will use a single one of these patterns
# or some derivative, here we include several for exploration purposes
ask_approaches = {
    "rtr": RetrieveThenReadApproach(search_client, AZURE_OPENAI_CHATGPT_DEPLOYMENT, AZURE_OPENAI_CHATGPT_MODEL, AZURE_OPENAI_EMB_DEPLOYMENT, KB_FIELDS_SOURCEPAGE, KB_FIELDS_CONTENT),
    "rrr": ReadRetrieveReadApproach(search_client, AZURE_OPENAI_GPT_DEPLOYMENT, AZURE_OPENAI_EMB_DEPLOYMENT, KB_FIELDS_SOURCEPAGE, KB_FIELDS_CONTENT),
    "rda": ReadDecomposeAsk(search_client, AZURE_OPENAI_GPT_DEPLOYMENT, AZURE_OPENAI_EMB_DEPLOYMENT, KB_FIELDS_SOURCEPAGE, KB_FIELDS_CONTENT)
}

chat_approaches = {
    "rrr": ChatReadRetrieveReadApproach(search_client, 
                                        AZURE_OPENAI_CHATGPT_DEPLOYMENT,
                                        AZURE_OPENAI_CHATGPT_MODEL, 
                                        AZURE_OPENAI_EMB_DEPLOYMENT,
                                        KB_FIELDS_SOURCEPAGE, 
                                        KB_FIELDS_CONTENT)
}

summarize_full_text_approaches = {
    "sft": summaryFullText(AZURE_OPENAI_CHATGPT_DEPLOYMENT, AZURE_OPENAI_CHATGPT_MODEL)
}

openbox_full_text_approaches = {
    "obt": openBoxFullText(AZURE_OPENAI_CHATGPT_DEPLOYMENT, AZURE_OPENAI_CHATGPT_MODEL)
}

text_compare_approaches = {
    "ctb": textCompare(AZURE_OPENAI_CHATGPT_DEPLOYMENT, AZURE_OPENAI_CHATGPT_MODEL)
}

indexResumeFiles_approaches = {
    "irf": indexResumeFiles(AZURE_STG_RESUME_CONTAINER, AZURE_IDX_RESUME_CONTAINER, AZURE_FORMRECOGNIZER_SERVICE, AZURE_FORMRECOGNIZER_KEY, AZURE_SEARCH_SERVICE, AZURE_SEARCH_INDEX, AZURE_OPENAI_EMB_DEPLOYMENT, AZURE_OPENAI_CHATGPT_DEPLOYMENT, AZURE_OPENAI_SERVICE)
}

app = Flask(__name__)

@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def static_file(path):
    return app.send_static_file(path)

# Serve content files from blob storage from within the app to keep the example self-contained. 
# *** NOTE *** this assumes that the content files are public, or at least that all users of the app
# can access all the files. This is also slow and memory hungry.
@app.route("/content/<path>")
def content_file(path):
    blob = blob_container.get_blob_client(path).download_blob()
    if not blob.properties or not blob.properties.has_key("content_settings"):
        abort(404)
    mime_type = blob.properties["content_settings"]["content_type"]
    if mime_type == "application/octet-stream":
        mime_type = mimetypes.guess_type(path)[0] or "application/octet-stream"
    blob_file = io.BytesIO()
    blob.readinto(blob_file)
    blob_file.seek(0)
    return send_file(blob_file, mimetype=mime_type, as_attachment=False, download_name=path)
    
@app.route("/ask", methods=["POST"])
def ask():
    ensure_openai_token()
    if not request.json:
        return jsonify({"error": "request must be json"}), 400
    approach = request.json["approach"]
    try:
        impl = ask_approaches.get(approach)
        if not impl:
            return jsonify({"error": "unknown approach"}), 400
        r = impl.run(request.json["question"], request.json.get("overrides") or {})
        return jsonify(r)
    except Exception as e:
        logging.exception("Exception in /ask")
        return jsonify({"error": str(e)}), 500
    
@app.route("/chat", methods=["POST"])
def chat():
    ensure_openai_token()
    if not request.json:
        return jsonify({"error": "request must be json"}), 400
    approach = request.json["approach"]
    try:
        impl = chat_approaches.get(approach)
        if not impl:
            return jsonify({"error": "unknown approach"}), 400
        r = impl.run(request.json["history"], request.json.get("overrides") or {})
        return jsonify(r)
    except Exception as e:
        logging.exception("Exception in /chat")
        return jsonify({"error": str(e)}), 500

@app.route("/indexes", methods=["GET"])
def indexes():
    ensure_openai_token()
    return jsonify([
        {"id": "1",
        "name": "Eye of the Tiger"},
        {"id": "2",
        "name": "The Final Countdown"},
        {"id": "3",
        "name": "The Safety Dance"},
        {"id": "4",
        "name": "Ice Ice Baby"}
    ])    


@app.route("/upload", methods=["POST"])
def upload():
    ensure_openai_token()
    try:

        sys.stdout.write("Upload Started")
        sys.stdout.write("starting file \n")
        sys.stdout.flush()
        file = request.files['file']
        sys.stdout.write("file \n" + str(file.name))
        sys.stdout.flush()
        # Connect to Azure Storage
        blob_service_client = BlobServiceClient(account_url=f"https://" + AZURE_STORAGE_ACCOUNT + ".blob.core.windows.net", credential=azure_credential)
        container_client = blob_service_client.get_container_client(AZURE_STG_RESUME_CONTAINER)

        # Upload the file to Azure Storage
        blob_client = container_client.get_blob_client(file.filename)
        blob_client.upload_blob(file, overwrite=True)
        #with file as data:
        #    container_client.upload_blob(file.name, data, overwrite=True)

        sys.stdout.write("End \n")
        sys.stdout.flush()
        return jsonify({"result":"File uploaded to Azure Storage!"})
    except Exception as e:
        logging.exception("Exception in /upload")
        return jsonify({"error": str(e)}), 500

@app.route("/readyFiles", methods=["GET"])
def readyFiles():
    ensure_openai_token()
    try: 
        blob_service_client = BlobServiceClient(account_url=f"https://" + AZURE_STORAGE_ACCOUNT + ".blob.core.windows.net", credential=azure_credential)
        container_client = blob_service_client.get_container_client(AZURE_STG_RESUME_CONTAINER) 
        blobs = container_client.list_blobs()

        files = [] 
        for blob in blobs:
            files.append({
                "size": blob.size, 
                "name": blob.name
                })
        return jsonify(files)
    except Exception as e:
        logging.exception("Exception in /readyFiles")
        return jsonify({"error": str(e)}), 500


@app.route("/removeStagedFile", methods=["POST"])
def removeStaged():
    
    ensure_openai_token()
    try:
        file = request.json["fileName"]
        blob_service_client = BlobServiceClient(account_url=f"https://" + AZURE_STORAGE_ACCOUNT + ".blob.core.windows.net", credential=azure_credential)
        container_client = blob_service_client.get_container_client(AZURE_STG_RESUME_CONTAINER) 
        container_client.delete_blob(file)
        return jsonify({"result":"File removed from Azure Storage!"})
    except Exception as e:
        logging.exception("Exception in /removeStagedFile")
        return jsonify({"error": str(e)}), 500


@app.route("/summary", methods=["POST"])
def summaryApi():
    ensure_openai_token()
    if not request.json:
        return jsonify({"error": "request must be json"}), 400

    approach = request.json["approach"]
    maxTokens = request.json["maxTokens"]
    impl = summarize_full_text_approaches.get(approach)
    prompt=request.json["summaryPrompt"]
    fullText=request.json["sumText"]
    temperature=request.json["temperature"]
    top_p=request.json["top_p"]
    frequency_penalty=request.json["frequency_penalty"]
    presence_penalty=request.json["presence_penalty"]
    r = impl.run(prompt, fullText, temperature, top_p, frequency_penalty, presence_penalty, maxTokens)
    return jsonify(r), 200


@app.route("/openbox", methods=["POST"])
def openboxApi():
    ensure_openai_token()
    if not request.json:
        return jsonify({"error": "request must be json"}), 400

    approach = request.json["approach"]
    maxTokens = request.json["maxTokens"]
    impl = openbox_full_text_approaches.get(approach)
    prompt=request.json["openBoxPrompt"]
    temperature=request.json["temperature"]
    top_p=request.json["top_p"]
    frequency_penalty=request.json["frequency_penalty"]
    presence_penalty=request.json["presence_penalty"]
    r = impl.run(prompt, temperature, top_p, frequency_penalty, presence_penalty, maxTokens)
    sys.stdout.write("openboxApi: " + str(r))
    sys.stdout.flush()
    return jsonify(r), 200

@app.route("/openboxcompare", methods=["POST"])
def textCompareApi():
    ensure_openai_token()
    if not request.json:
        return jsonify({"error": "request must be json"}), 400

    approach = request.json["approach"]
    maxTokens = request.json["maxTokens"]
    impl = text_compare_approaches.get(approach)
    promptBox2=request.json["openBox2Prompt"]
    box1=request.json["openBox1Prompt"]
    box3=request.json["openBox3Prompt"]

    temperature=request.json["temperature"]
    top_p=request.json["top_p"]
    frequency_penalty=request.json["frequency_penalty"]
    presence_penalty=request.json["presence_penalty"]
    r = impl.run(promptBox2,box1,box3, temperature, top_p, frequency_penalty, presence_penalty, maxTokens)
    sys.stdout.write("openboxApi: " + str(r))
    sys.stdout.flush()
    return jsonify(r), 200

@app.route("/cleardata", methods=["POST"])
def clearData():
    ensure_openai_token()
    if not request.json:
        return jsonify({"error": "request must be json"}), 400
    
    blob_service_client = BlobServiceClient(account_url=f"https://" + AZURE_STORAGE_ACCOUNT + ".blob.core.windows.net", credential=azure_credential)
    container_client = blob_service_client.get_container_client(AZURE_STG_RESUME_CONTAINER) 
    #delete all blobs in the container for staged resumes
    blobs = container_client.list_blobs()
    for blob in blobs:
        container_client.delete_blob(blob.name)
    
    #delete all blobs in the container for indexed resumes
    c_indexed_client = blob_service_client.get_container_client(AZURE_IDX_RESUME_CONTAINER) 
    idxBlobs = c_indexed_client.list_blobs()
    for blob in idxBlobs:
        c_indexed_client.delete_blob(blob.name)
    
    #delete and recreate the search index
    search_client = SearchIndexClient(endpoint=f"https://{AZURE_SEARCH_SERVICE}.search.windows.net/",
                                    index_name=AZURE_SEARCH_INDEX,
                                    credential=azure_credential)
    search_client.delete_index(AZURE_SEARCH_INDEX)

    return jsonify({"success": "data cleared"}), 200

@app.route("/indexUploadedFiles", methods=["POST"])
def indexUploadedFiles():
    ensure_openai_token()
    if not request.json:
        return jsonify({"error": "request must be json"}), 400
    approach = "irf"
    impl = indexResumeFiles_approaches.get(approach)
    #TODO: Fix this to actually work
    r = impl.run(openai_token, azure_credential) 

def ensure_openai_token():
    global openai_token
    if openai_token.expires_on < int(time.time()) - 60:
        openai_token = azure_credential.get_token("https://cognitiveservices.azure.com/.default")
        openai.api_key = openai_token.token
    
if __name__ == "__main__":
    app.run()
