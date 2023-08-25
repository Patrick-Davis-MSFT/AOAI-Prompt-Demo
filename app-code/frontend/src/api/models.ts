export type SummaryOpts = {
    summaryPrompt: string;
    filename: string;
}

export type Index = {
    id: string;
    name: string;
}
export type SummaryResponse = {
    answer: string;
};
export type Indexes = Index[];