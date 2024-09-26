import os
from openai import AzureOpenAI
import sys
from core.modelhelper import get_token_limit

class textCompare():
    def token_provider(self, scopes=None):
        return self.defaultCreds.get_token("https://cognitiveservices.azure.com/.default").token
    def __init__(self,  defaultCreds, aoai_endpoint, chatgpt_deployment: str, chatgpt_model: str):
        self.defaultCreds = defaultCreds
        self.aoai_endpoint = aoai_endpoint
        self.chatgpt_deployment = chatgpt_deployment
        self.chatgpt_model = chatgpt_model
        self.chatgpt_token_limit = 5000 #get_token_limit(chatgpt_model)

    def run(self, promptBox2:str, box1:str, box3:str, temperature:float, top_p:float, frequency_penalty:float, presence_penalty:float, maxTokens:int): 
        
        self.aoai_client = AzureOpenAI(azure_endpoint=self.aoai_endpoint, 
                                azure_ad_token_provider=self.token_provider, 
                                api_version="2023-12-01-preview")
        fullPrompt = ""
        fullPrompt = """The user is requesting help with this task Once answering this question stop responding. 
        Answer as briefly as possible and only regarding reference the information provided in a way that is easy to understand and in correct English Grammar."""
        fullPrompt += "\n\n The user task is " + promptBox2 + " \n\n"
        fullPrompt += "\n\n {Document 1} is below from <<document_1_start>> start and ends at <<document_1_end>> \n\n"
        fullPrompt += "<<document_1_start>>\n"
        fullPrompt += box1 + "\n"
        fullPrompt += "<<document_1_end>>\n\n"
        fullPrompt += "\n\n {Document 2} is below from <<document_2_start>> start and ends at <<document_2_end>> \n\n"
        fullPrompt += "<<document_2_start>>\n"
        fullPrompt += box3 + "\n"
        fullPrompt += "<<document_2_end>>\n\n"
        message = [{"role": "system", "content": fullPrompt}]
        if maxTokens < 5000:
            self.chatgpt_token_limit = maxTokens
        response = self.aoai_client.chat.completions.create(
            model=self.chatgpt_model,
            messages=message,
            temperature=temperature,
            top_p=top_p,
            frequency_penalty=frequency_penalty,
            presence_penalty=presence_penalty,
            stop=None)
        return response