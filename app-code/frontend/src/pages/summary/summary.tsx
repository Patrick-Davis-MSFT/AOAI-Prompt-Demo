import { DefaultButton, Panel, SpinButton, TextField } from "@fluentui/react";
import { SummaryOpts, callSummary } from "../../api";
import { Field, Textarea, TextareaOnChangeData, Tooltip } from "@fluentui/react-components";

import styles from "./summary.module.css";
import { SettingsButton } from "../../components/SettingsButton";
import { BigInput } from "../../components/BigInput";
import { ChangeEvent, useState } from "react";
import { sizeBoolean } from "@fluentui/react/lib/index.bundle";
import { SparkleFilled } from "@fluentui/react-icons";
import { WhiteBoxModel } from "../../components/WhiteBox/WhiteBox";
import { AOAIResult, GenericAOAIResult } from "../../components/GenericAOAIResult";

const Summary = () => {

    //section for White Boxing Text 
    var summaryTitle: string = "Summarize Text";
    var sumPromptlbl: string = "Summarization Prompt";
    var txtEntrylbl: string = "Text to Summarize";
    var summaryPromptTXT: string = "Below is an extract from the annual financial report of a company. Extract key financial number (if present), key internal risk factors, and key external risk factors. Limit your response to 10 sentences.";
    var sumTextTXT: string = "Revenue increased $7.5 billion or 16%. Commercial products and cloud services revenue increased $4.0 billion or 13%. O365 Commercial revenue grew 22% driven by seat growth of 17% and higher revenue per user. Office Consumer products and cloud services revenue increased $474 million or 10% driven by Consumer subscription revenue, on a strong prior year comparable that benefited from transactional strength in Japan. Gross margin increased $6.5 billion or 18% driven by the change in estimated useful lives of our server and network equipment. \nOur competitors range in size from diversified global companies with significant research and development resources to small, specialized firms whose narrower product lines may let them be more effective in deploying technical, marketing, and financial resources. Barriers to entry in many of our businesses are low and many of the areas in which we compete evolve rapidly with changing and disruptive technologies, shifting user needs, and frequent introductions of new products and services. Our ability to remain competitive depends on our success in making innovative products, devices, and services that appeal to businesses and consumers.";
    var maxTokensInit: number = 1500;
    var maxTokensAllowed: number = 2500;
    var chatLogo = () => {
        return (<SparkleFilled fontSize={"120px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Chat logo" />);
    }
    if (WhiteBoxModel.useWhiteBox) {
        summaryTitle = WhiteBoxModel.summaryTitle;
        sumPromptlbl = WhiteBoxModel.sumPromptlbl;
        txtEntrylbl = WhiteBoxModel.txtEntrylbl;
        summaryPromptTXT = WhiteBoxModel.summaryPromptTXT;
        sumTextTXT = WhiteBoxModel.sumTextTXT;
        maxTokensInit = WhiteBoxModel.maxTokensInit;
        maxTokensAllowed = WhiteBoxModel.maxTokensAllowed;
        if (WhiteBoxModel.chatLogoOverride) {
            chatLogo = WhiteBoxModel.chatLogo;
        }
    }


    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [temperature, setTemperature] = useState<number>(3);
    const [top_p, setTop_p] = useState<number>(10);
    const [frequencyPenalty, setFrequencyPenalty] = useState<number>(0);
    const [presencePenalty, setPresencePenalty] = useState<number>(0);
    const [maxTokens, setMaxTokens] = useState<number>(maxTokensInit);
    const [summaryPrompt, setSummaryPrompt] = useState<string>(summaryPromptTXT);
    const [sumText, setSumText] = useState<string>(sumTextTXT);
    
    const [aoaiResponse, setAOAIResponse] = useState<AOAIResult>({} as AOAIResult);
    const [gotResult, setGotResult] = useState<boolean>(false);

    const makeSummaryRequest = async () => {
        //remember to divide the number by 10 for Temperature
        const sumOpts: SummaryOpts = {
            sumText: sumText,
            temperature: temperature / 10,
            top_p: top_p / 10,
            frequency_penalty: frequencyPenalty / 10,
            presence_penalty: presencePenalty / 10,
            summaryPrompt: summaryPrompt,
            maxTokens: maxTokens
        };
        const response = await callSummary(sumOpts);
        const data = await response;
        setAOAIResponse(data);
        setGotResult(true);
        console.log(data);
    }

    const onSummaryPromptChange = (ev: ChangeEvent<HTMLTextAreaElement>, newValue: TextareaOnChangeData) => {
        setSummaryPrompt(newValue.value || "");
    };
    const onSumTextChange = (ev: ChangeEvent<HTMLTextAreaElement>, newValue: TextareaOnChangeData) => {
        setSumText(newValue.value || "");
    };

    const onTemperatureChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setTemperature(parseInt(newValue || "3"));
    };

    const onTop_PChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setTop_p(parseInt(newValue || "10"));
    };
    const onFrequencyPenaltyChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setFrequencyPenalty(parseInt(newValue || "0"));
    };
    const onPresencePenaltyChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setPresencePenalty(parseInt(newValue || "0"));
    };

    const onMaxTokensChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setMaxTokens(parseInt(newValue || "0"));
    };


    return (<div className={styles.container}>
        <div className={styles.commandsContainer}>
            <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
        </div>
        <div className={styles.sumRoot}>
            <div className={styles.sumContainer}>
            {WhiteBoxModel.hideChatLogo ? <></>: chatLogo()}
                <h1>{summaryTitle}</h1>
                {!WhiteBoxModel.showSummaryPrompt && WhiteBoxModel.useWhiteBox ? <></> :  <BigInput
                    disabled={false}
                    placeholder={sumPromptlbl}
                    areaLabel={sumPromptlbl}
                    defaultText={summaryPrompt}
                    onChange={onSummaryPromptChange}
                />}
               
                <BigInput
                    disabled={false}
                    placeholder={txtEntrylbl}
                    areaLabel={txtEntrylbl}
                    defaultText={sumText}
                    onChange={onSumTextChange}
                />
                <DefaultButton onClick={makeSummaryRequest}>Make Summary Request</DefaultButton>
                {gotResult? <GenericAOAIResult input={aoaiResponse} />: <></>}
                <Panel
                    headerText="Configure answer generation"
                    isOpen={isConfigPanelOpen}
                    isBlocking={false}
                    onDismiss={() => setIsConfigPanelOpen(false)}
                    closeButtonAriaLabel="Close"
                    onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
                    isFooterAtBottom={true}
                >

                    <Tooltip content="The higher leads to more creative results." relationship="label">
                        <SpinButton
                            className={styles.chatSettingsSeparator}
                            label="Temperature (0 - 10):"
                            min={0}
                            max={10}
                            defaultValue={temperature.toString()}
                            onChange={onTemperatureChange}
                        />
                    </Tooltip>
                    <Tooltip content="The Higher value considers a more dynamic vocabulary." relationship="label">
                        <SpinButton
                            className={styles.chatSettingsSeparator}
                            label="Top_p (0 - 10):"
                            min={0}
                            max={10}
                            defaultValue={top_p.toString()}
                            onChange={onTop_PChange}
                        />
                    </Tooltip>
                    <Tooltip content="The higher considers more information in the text for the summary." relationship="label">
                        <SpinButton
                            className={styles.chatSettingsSeparator}
                            label="Frequency Penalty (0 - 10):"
                            min={0}
                            max={10}
                            defaultValue={frequencyPenalty.toString()}
                            onChange={onFrequencyPenaltyChange}
                        />
                    </Tooltip>
                    <Tooltip content="The higher considers more closely the summary relates to the incoming text." relationship="label">
                        <SpinButton
                            className={styles.chatSettingsSeparator}
                            label="Presence Penalty (0 - 10):"
                            min={0}
                            max={10}
                            defaultValue={presencePenalty.toString()}
                            onChange={onPresencePenaltyChange}
                        />
                    </Tooltip>
                    <Tooltip content="The higher the tokens the higher the allowed cost." relationship="label">
                        <SpinButton
                            className={styles.chatSettingsSeparator}
                            label="Max Tokens:"
                            min={0}
                            max={maxTokensAllowed}
                            defaultValue={presencePenalty.toString()}
                            onChange={onMaxTokensChange}
                        />
                    </Tooltip>
                </Panel>
            </div>
        </div>
    </div>);
}

export default Summary;