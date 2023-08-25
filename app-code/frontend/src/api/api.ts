import { Indexes, SummaryOpts, SummaryResponse } from "./models";
import { FileContent } from "use-file-picker";

export async function callSummary(options: SummaryOpts): Promise<SummaryResponse> {
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
        }),
    });
    const json = await response.json();
    return json;
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