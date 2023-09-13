import { useEffect, useState } from 'react';
import { AOAIResult, aoaiChoices } from './GenericAOAIModel';
import { Field, Text, Textarea } from '@fluentui/react-components';
import { DefaultPalette, IStackItemStyles, IStackStyles, IStackTokens, Label, List, Stack, mergeStyles } from '@fluentui/react';

import styles from './GenericAOAIResult.module.css';
import { WhiteBoxModel } from '../WhiteBox/WhiteBox';

interface Props {
    input: AOAIResult;
    boxTitle?: string;
    hideTitle?: boolean;
}

export var aoaiValue: string = "";

export const GenericAOAIResult = ({ input, boxTitle, hideTitle }: Props) => {

    const verticalGapStackTokens: IStackTokens = {
        childrenGap: 10,
        padding: 10,
    };
    const stackStyles: IStackStyles = {
        root: {
            background: DefaultPalette.themeTertiary,
        },
    };
    const stackItemStyles: IStackItemStyles = {
        root: {
            background: DefaultPalette.themePrimary,
            color: DefaultPalette.white,
            padding: 5,
        },
    };

    aoaiValue = input.choices[0].message &&  input.choices[0].message.content?  input.choices[0].message.content :  input.choices[0].text;

    return (<div className={styles.resultWrapper}>
        {hideTitle ? <></> : <h2>Azure Open AI Result</h2>}
        {input.choices.map((curr: aoaiChoices, idx) => {
            return (<>
                <Stack enableScopedSelectors className={mergeStyles(styles.inputContainer, stackStyles)} tokens={verticalGapStackTokens}>
                    <Stack.Item><Field label={boxTitle ? boxTitle : "Response"} className={styles.inputTextArea}>
                        <Textarea className={styles.editArea}
                            resize="both"
                            size="large">{curr.message && curr.message.content? curr.message.content : curr.text}</Textarea>
                    </Field>
                    </Stack.Item>
                    <Stack.Item><Text><b>Tokens Used</b>: {input.usage.total_tokens}</Text></Stack.Item>
                    {WhiteBoxModel.useWhiteBox && !WhiteBoxModel.showTechnicalInfo || !WhiteBoxModel.useWhiteBox ? <></>: 
                    (<><Stack.Item><Text ><b>finish_reason:</b> {curr.finish_reason}</Text></Stack.Item>
                    <Stack.Item><Text><b>index:</b> {curr.index}</Text></Stack.Item>
                    <Stack.Item><Text><b>logprobs:</b> {curr.logprobs}</Text></Stack.Item></>) }
                </Stack>
            </>)
        })}
        {WhiteBoxModel.useWhiteBox && !WhiteBoxModel.showTechnicalInfo || !WhiteBoxModel.useWhiteBox ? <></>: 
                    (<><h4>Technical Information</h4>
        <div>
            <div><Text>ID: {input.id}</Text></div>
            <div><Text>Model: {input.model}</Text></div>
            <div><Text>Object: {input.object}</Text></div>
            <div><Text>Usage</Text></div>
            <div><Text>completion_tokens: {input.usage.completion_tokens}</Text></div>
            <div><Text>prompt_tokens: {input.usage.prompt_tokens}</Text></div>
            <div><Text>total_tokens: {input.usage.total_tokens}</Text></div>
        </div>
        <Label>{JSON.stringify(input)}</Label></>)}
    </div>);
}