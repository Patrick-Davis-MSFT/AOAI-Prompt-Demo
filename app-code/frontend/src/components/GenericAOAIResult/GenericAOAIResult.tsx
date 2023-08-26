import { useState } from 'react';
import { AOAIResult, aoaiChoices } from './GenericAOAIModel';
import { Field, Text, Textarea } from '@fluentui/react-components';

interface Props {
    input: AOAIResult;
}


export const GenericAOAIResult = ({ input }: Props) => {
    return (<div>
        <h2>GenericAOAIResult</h2>
        {input.choices.map((curr: aoaiChoices,idx) => {
            return (<>
            <h3>Choice {idx}</h3>
            <div>
            <Field label="Response">
            <Textarea 
                    resize="both"
                    size="large">{curr.text}</Textarea>
                       </Field>
                       </div>
                       <div>
                <Text >finish_reason: {curr.finish_reason}</Text>
                </div>
                <div>                    <Text>index: {curr.index}</Text></div>
                        <div><Text>logprobs: {curr.logprobs}</Text></div>
        </>)})}
        <h4>Technical Information</h4>
        <div>
            <div><Text>ID: {input.id}</Text></div>
            <div><Text>Model: {input.model}</Text></div>
            <div><Text>Object: {input.object}</Text></div>
            <div><Text>Usage</Text></div>
            <div><Text>completion_tokens: {input.usage.completion_tokens}</Text></div>
            <div><Text>prompt_tokens: {input.usage.prompt_tokens}</Text></div>
            <div><Text>total_tokens: {input.usage.total_tokens}</Text></div>
        </div>
    </div>);
}