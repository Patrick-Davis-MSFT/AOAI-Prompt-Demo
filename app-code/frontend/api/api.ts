import { SummaryResponse } from "./models";

export async function callSummary(): Promise<SummaryResponse> {
    const response = await fetch(`/summary`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            summaryPrompt: "somePrompt", //options.summaryPrompt,
            filename: "someFile", //options.filename,
            approach: "someApproach", //options.approach,
        }),
    });
    const json = await response.json();
    console.log("got summary response");
    console.log(json);
    return json;
}