import { AOAIResult, aoaiChoices } from "../components/GenericAOAIResult";
import { Indexes, OpenBoxCompareOpts, OpenBoxOpts, ReadyFiles, SearchTermOpts, SummaryOpts, SummaryResponse, resumeJDCompareReq, searchDocumentTerms, searchDocumentTermsResponse } from "./models";
import { FileContent } from "use-file-picker";

export async function callSummary(options: SummaryOpts): Promise<AOAIResult> {
    const response = await fetch(`/summary`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            summaryPrompt: options.summaryPrompt,
            sumText: options.sumText,
            temperature: options.temperature,
            top_p: options.top_p,
            frequency_penalty: options.frequency_penalty,
            presence_penalty: options.presence_penalty,
            approach: "sft", //options.approach,
            maxTokens: options.maxTokens,
        }),
    });
    const json = await response.json();
    var retVal: AOAIResult = {
        created: json.created,
        id: json.id,
        model: json.model,
        object: json.object,
        usage: {
            completion_tokens: json.usage.completion_tokens,
            prompt_tokens: json.usage.prompt_tokens,
            total_tokens: json.usage.total_tokens
        },
        choices: new Array<aoaiChoices>()
    };
    console.log(json);
    json.choices.forEach((choice: any) => {
        console.log(choice);
        retVal.choices.push({
            finish_reason: choice.finish_reason,
            index: choice.index,
            logprobs: choice.logprobs,
            text: choice.message.content
        });
    });

    return retVal;
}

export async function callOpenCompareBox(options: OpenBoxCompareOpts): Promise<AOAIResult> {
    const response = await fetch(`/openboxcompare`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            openBox1Prompt: options.openBox1Prompt,
            openBox2Prompt: options.openBox2Prompt,
            openBox3Prompt: options.openBox3Prompt,
            temperature: options.temperature,
            top_p: options.top_p,
            frequency_penalty: options.frequency_penalty,
            presence_penalty: options.presence_penalty,
            approach: "ctb", //options.approach,
            maxTokens: options.maxTokens,
        }),
    });
    const json = await response.json();
    var retVal = {} as AOAIResult;
    retVal = {
        created: json.created,
        id: json.id,
        model: json.model,
        object: json.object,
        usage: {
            completion_tokens: json.usage.completion_tokens,
            prompt_tokens: json.usage.prompt_tokens,
            total_tokens: json.usage.total_tokens
        },
        choices: new Array<aoaiChoices>()
    };
    json.choices.forEach((choice: any) => {
        retVal.choices.push({
            finish_reason: choice.finish_reason,
            index: choice.index,
            logprobs: choice.logprobs,
            text: choice.message.content
        });
    });

    return retVal;
}

export async function callClearData(): Promise<string> {
    const response = await fetch(`/cleardata`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ "clear": "true" })
    });
    const json = await response.json();
    return json;
}

export async function callOpenBox(options: OpenBoxOpts): Promise<AOAIResult> {
    const response = await fetch(`/openbox`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            openBoxPrompt: options.openBoxPrompt,
            temperature: options.temperature,
            top_p: options.top_p,
            frequency_penalty: options.frequency_penalty,
            presence_penalty: options.presence_penalty,
            approach: "obt", //options.approach,
            maxTokens: options.maxTokens,
        }),
    });
    const json = await response.json();
    var retVal = {} as AOAIResult;
    retVal = {
        created: json.created,
        id: json.id,
        model: json.model,
        object: json.object,
        usage: {
            completion_tokens: json.usage.completion_tokens,
            prompt_tokens: json.usage.prompt_tokens,
            total_tokens: json.usage.total_tokens
        },
        choices: new Array<aoaiChoices>()
    };
    json.choices.forEach((choice: any) => {
        retVal.choices.push({
            finish_reason: choice.finish_reason,
            index: choice.index,
            logprobs: choice.logprobs,
            text: choice.message.content
        });
    });

    return retVal;
}


export async function calljdSeachTerms(options: SearchTermOpts): Promise<AOAIResult> {
    const response = await fetch(`/jobDescSkills`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            searchTermPrompt: options.searchTermPrompt,
            jobDescription: options.jobDescription,
            temperature: options.temperature,
            top_p: options.top_p,
            frequency_penalty: options.frequency_penalty,
            presence_penalty: options.presence_penalty,
            approach: "obt", //options.approach,
            maxTokens: options.maxTokens,
        }),
    });
    const json = await response.json();
    var retVal = {} as AOAIResult;
    retVal = {
        created: json.created,
        id: json.id,
        model: json.model,
        object: json.object,
        usage: {
            completion_tokens: json.usage.completion_tokens,
            prompt_tokens: json.usage.prompt_tokens,
            total_tokens: json.usage.total_tokens
        },
        choices: new Array<aoaiChoices>()
    };
    json.choices.forEach((choice: any) => {
        retVal.choices.push({
            finish_reason: choice.finish_reason,
            index: choice.index,
            logprobs: choice.logprobs,
            text: choice.message.content,
            message: { role: choice.message.role, content: choice.message.content }
        });
    });

    return retVal;
}

export async function callResumeJD(options: resumeJDCompareReq): Promise<AOAIResult> {
    const response = await fetch(`/resumeJDCompare`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt: options.prompt,
            resumeName: options.resumeName,
            jobDesc: options.jobDesc,
            temperature: options.temperature,
            top_p: options.top_p,
            frequency_penalty: options.frequency_penalty,
            presence_penalty: options.presence_penalty,
            approach: "obt", //options.approach,
            maxTokens: options.maxTokens,
        }),
    });
    const json = await response.json();
    var retVal = {} as AOAIResult;
    retVal = {
        created: json.created,
        id: json.id,
        model: json.model,
        object: json.object,
        usage: {
            completion_tokens: json.usage.completion_tokens,
            prompt_tokens: json.usage.prompt_tokens,
            total_tokens: json.usage.total_tokens
        },
        choices: new Array<aoaiChoices>(),
        source: json.source
    };
    json.choices.forEach((choice: any) => {
        retVal.choices.push({
            finish_reason: choice.finish_reason,
            index: choice.index,
            logprobs: choice.logprobs,
            text: choice.message.content,
            message: { role: choice.message.role, content: choice.message.content }
        });
    });

    return retVal;
}

export async function callSearchDocs(options: searchDocumentTerms): Promise<searchDocumentTermsResponse[]> {
    console.log("Calling searchDocs");
    console.log(options);
    const response = await fetch(`/searchDocs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            searchTerm: options.searchTerm,
            searchSkill: options.searchSkill,
            temperature: options.temperature,
            top_p: options.top_p,
            frequency_penalty: options.frequency_penalty,
            presence_penalty: options.presence_penalty,
            approach: "dsa", //options.approach,
            maxTokens: options.maxTokens,
        }),
    });
    const json = await response.json();
    var retVal = [] as searchDocumentTermsResponse[];
    console.log("json: ");
    console.log(json);
    json.forEach((docResp: any) => {
        const temp: searchDocumentTermsResponse = {
            document: docResp.document,
            score: docResp.score,
            documentPage: docResp.documentPage,
            searchTerm: docResp.searchTerm,
            searchSkill: docResp.searchSkill
        };
        retVal.push(temp);
    });
   

    return retVal;
}

export async function getIndexes(): Promise<Indexes> {
    const response = await fetch("/indexes", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const parsedResponse: Indexes = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error("Getting Indexes: Unknown error");
    }

    return parsedResponse;
}

export async function streamToBlob(readableStream: ReadableStream): Promise<Blob> {
    const reader = readableStream.getReader();
    const chunks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    return new Blob(chunks, { type: "application/octet-stream" });
}

export async function uploadBlob(blob: Blob, fName: string): Promise<void> {
    const formData = new FormData();
    formData.append("file", blob, fName);
    await fetch("/upload", {
        method: "POST",
        body: formData,
    });
}

export async function getReadyFiles(): Promise<ReadyFiles> {
    console.log("Getting ready files");
    const response = await fetch("/readyFiles", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const parsedResponse: ReadyFiles = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error("Getting Indexes: Unknown error");
    }

    return parsedResponse;
}
export async function removeStagedFile(fileName: string): Promise<void> {
    const response = await fetch("/removeStagedFile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ "fileName": fileName })
    });
    return response.json();
}

export async function indexReadyFiles(setReturn: (result: string) => void): Promise<void> {
    const response = await fetch("/indexUploadedFilesStream", {
        method: "GET"
    });


    if (response.status > 299 || !response.ok || response.body == null) {
        throw Error("Indexing files: Unknown error: " + response.statusText);
    }
    const reader = response.body.getReader();
    var result: string = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        var newValue = new TextDecoder().decode(value);
        result += newValue + "\n";
        setReturn(result);
    }
}