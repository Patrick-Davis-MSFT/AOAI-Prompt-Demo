/*
{
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "logprobs": null,
            "text": "\n\nKey Financial Numbers: \n- Revenue: $7.5 billion or 16%\n- Commercial products and cloud services revenue: $4.0 billion or 13%\n- O365 Commercial revenue grew 22% driven by seat growth of 17% and higher revenue per user\n- Office Consumer products and cloud services revenue increased $474 million or 10% driven by Consumer subscription revenue\n\nKey Internal Risk Factors:\n- Ability to remain competitive depends on success in making innovative products, devices, and services that appeal to businesses and consumers\n- Rapidly evolving areas in which we compete with changing and disruptive technologies, shifting user needs, and frequent introductions of new products and services\n\nKey External Risk Factors:\n- Competitors range in size from diversified global companies with significant research and development resources to small, specialized firms whose narrower product lines may let them be more effective in deploying technical, marketing, and financial resources\n- Barriers to entry in many of our businesses are low.<|im_end|>"
        }
    ],
    "created": 1693002875,
    "id": "cmpl-7rZfvzmlPAlEMz8ytc2omJzI2Pd5U",
    "model": "gpt-35-turbo",
    "object": "text_completion",
    "usage": {
        "completion_tokens": 198,
        "prompt_tokens": 261,
        "total_tokens": 459
    }
}
*/
export type aoaiChoices = {
    finish_reason: string,
    index: number,
    logprobs: null,
    text: string,
    message?: message,
    choices?: choice[]
}

export type choice = {
    finish_reason: string,
    index: number,
    logprobs: null,
    text: string,
    message?: message,
}

export type message = {
    role: string,
    content: string,
    function_call?: string,
    tool_calls?: string,
}
export type usage = {
    completion_tokens: number,
    prompt_tokens: number,
    total_tokens: number
}
export type AOAIResult = {
    choices: aoaiChoices[],
    created: number,
    id: string,
    model: string,
    object: string,
    usage: usage,
    source?: string,
}