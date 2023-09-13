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

export type OpenBoxCompareOpts = {
    openBox1Prompt: string;
    openBox2Prompt: string;
    openBox3Prompt: string;
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



export type ReadyFile = {
    size: string;
    name: string;
}

export type SearchTermOpts = {
    searchTermPrompt: string;
    jobDescription: string;
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    maxTokens: number;
}
export type ReadyFiles = ReadyFile[];

export type skillTerm = {
    skill: string;
    term: string;
  }

  export type searchDocumentTerms = {
    searchTerm: string;
    searchSkill: string;
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    maxTokens: number;
  }

  export type searchDocumentTermsResponse = {
    document: string;
    documentPage: string;
    searchTerm: string;
    searchSkill: string;
    score: number;
  }

  export type resumeJDCompareReq = {
    prompt: string;
    resumeName: string;
    jobDesc: string;
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    maxTokens: number;
  }