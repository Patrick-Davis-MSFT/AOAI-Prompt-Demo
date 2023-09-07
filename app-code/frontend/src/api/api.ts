import { AOAIResult, aoaiChoices } from "../components/GenericAOAIResult";
import { Indexes, OpenBoxCompareOpts, OpenBoxOpts, SummaryOpts, SummaryResponse } from "./models";
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
    json.choices.forEach((choice: any) => {
        retVal.choices.push({
            finish_reason: choice.finish_reason,
            index: choice.index,
            logprobs: choice.logprobs,
            text: choice.text
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
            text: choice.text
    });
    });

    return retVal;
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
            text: choice.text
    });
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

export async function postFile(inFile: FileContent): Promise<string> {
    const response = await fetch("/upload", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            file: inFile.content,
            name: inFile.name
        })
    });

    const parsedResponse: string = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error("Uploading File: Unknown error");
    }

    return parsedResponse;
}