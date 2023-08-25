import { SummaryResponse } from "./models";

export async function callSummary(): Promise<SummaryResponse> {
    const response = await fetch(`/summary`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            summaryPrompt: "Below is an extract from the annual financial report of a company. Extract key financial number (if present), key internal risk factors, and key external risk factors.", //options.summaryPrompt,
            textSum: "Revenue increased $7.5 billion or 16%. Commercial products and cloud services revenue increased $4.0 billion or 13%. O365 Commercial revenue grew 22% driven by seat growth of 17% and higher revenue per user. Office Consumer products and cloud services revenue increased $474 million or 10% driven by Consumer subscription revenue, on a strong prior year comparable that benefited from transactional strength in Japan. Gross margin increased $6.5 billion or 18% driven by the change in estimated useful lives of our server and network equipment. \nOur competitors range in size from diversified global companies with significant research and development resources to small, specialized firms whose narrower product lines may let them be more effective in deploying technical, marketing, and financial resources. Barriers to entry in many of our businesses are low and many of the areas in which we compete evolve rapidly with changing and disruptive technologies, shifting user needs, and frequent introductions of new products and services. Our ability to remain competitive depends on our success in making innovative products, devices, and services that appeal to businesses and consumers.", //options.filename,
            approach: "sft", //options.approach,
        }),
    });
    const json = await response.json();
    return json;
}