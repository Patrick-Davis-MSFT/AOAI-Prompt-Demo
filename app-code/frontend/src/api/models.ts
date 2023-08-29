export type SummaryOpts = {
    summaryPrompt: string;
    sumText: string;
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    maxTokens: number;
}

export type OpenBoxOpts = {
    openBoxPrompt: string;
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    maxTokens: number;
}

export type Index = {
    id: string;
    name: string;
}
export type SummaryResponse = {
    answer: string;
};
export type Indexes = Index[];

