import { DefaultButton, DefaultPalette, IStackItemStyles, IStackStyles, IStackTokens, Panel, SpinButton, Stack } from "@fluentui/react";
import { OpenBoxOpts, callOpenBox } from "../../api";
import { TextareaOnChangeData, Tooltip } from "@fluentui/react-components";

import styles from "./textCompare.module.css";
import { SettingsButton } from "../../components/SettingsButton";
import { BigInput } from "../../components/BigInput";
import { ChangeEvent, useState } from "react";
import { sizeBoolean } from "@fluentui/react/lib/index.bundle";
import { SparkleFilled } from "@fluentui/react-icons";
import { WhiteBoxModel } from "../../components/WhiteBox/WhiteBox";
import { AOAIResult, GenericAOAIResult } from "../../components/GenericAOAIResult";

export function Component(): JSX.Element {

    //section for White Boxing Text 
    var textCompareTitle: string = "Text Compare";
    var tcPromptlbl: string = "Text Compare Prompt";
    var box1Title: string = "First Text";
    var box2Title: string = "Second Text";
    var box3Title: string = "Third Text";
    var tcPromptTXT: string = "Write a product launch email for new AI-powered headphones that are priced at $79.99 and available at Best Buy, Target and Amazon.com. The target audience is tech-savvy music lovers and the tone is friendly and exciting.\n\n    1. What should be the subject line of the email?  \n    2. What should be the body of the email?";
    var maxTokensInit: number = 2000;
    var maxTokensAllowed: number = 4500;
    var chatLogo = () => {
        return (<SparkleFilled fontSize={"120px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Chat logo" />);
    }
    if (WhiteBoxModel.useWhiteBox) {
        textCompareTitle = WhiteBoxModel.textCompareTitle;
        tcPromptlbl = WhiteBoxModel.tcPromptlbl;
        tcPromptTXT = WhiteBoxModel.tcPromptTXT;
        box1Title = WhiteBoxModel.box1Title;
        box2Title = WhiteBoxModel.box2Title;
        box3Title = WhiteBoxModel.box3Title;
        maxTokensInit = WhiteBoxModel.maxTokensInit;
        maxTokensAllowed = WhiteBoxModel.maxTokensAllowed;
        if (WhiteBoxModel.chatLogoOverride) {
            chatLogo = WhiteBoxModel.chatLogo;
        }
    }


    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [temperature, setTemperature] = useState<number>(7);
    const [top_p, setTop_p] = useState<number>(10);
    const [frequencyPenalty, setFrequencyPenalty] = useState<number>(0);
    const [presencePenalty, setPresencePenalty] = useState<number>(0);
    const [maxTokens, setMaxTokens] = useState<number>(maxTokensInit);
    const [openBoxPrompt, setOpenBoxPrompt] = useState<string>(tcPromptTXT);
    
    const [aoaiResponse, setAOAIResponse] = useState<AOAIResult>({} as AOAIResult);
    const [gotResult, setGotResult] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    

    const makeSummaryRequest = async () => {
        setIsLoading(true);
        //remember to divide the number by 10 for Temperature
        const openBoxOpts: OpenBoxOpts = {
            openBoxPrompt: openBoxPrompt,
            temperature: temperature / 10,
            top_p: top_p / 10,
            frequency_penalty: frequencyPenalty / 10,
            presence_penalty: presencePenalty / 10,
            maxTokens: maxTokens
        };
        const response = await callOpenBox(openBoxOpts);
        const data = await response;
        setAOAIResponse(data);
        setGotResult(true);
        setIsLoading(false);
        console.log(data);
    }

    const onOpenBoxPromptChange = (ev: ChangeEvent<HTMLTextAreaElement>, newValue: TextareaOnChangeData) => {
        setOpenBoxPrompt(newValue.value || "");
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
    const stackStyles: IStackStyles = {
        root: {
            display: "flex",
          height: 500,
          width: "100%",
        },
      };
      const innerStackTokens: IStackTokens = {
        childrenGap: 1,
        padding: 0,
      };
    const stackItemStyles: IStackItemStyles = {
        root: {
          width: '100%',
          height: '100%',
        },
      };
    return (<div className={styles.container}>
        <div className={styles.commandsContainer}>
            <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
        </div>
        <div className={styles.sumRoot}>
            <div className={styles.sumContainer}>
            <h1>{textCompareTitle}</h1>
            {WhiteBoxModel.hideChatLogo ? <></>: chatLogo()}
            <Stack enableScopedSelectors horizontal styles={stackStyles} tokens={innerStackTokens}>
            <Stack.Item grow styles={stackItemStyles}>
                <Stack enableScopedSelectors>
                <h2>{box1Title}</h2>
                <BigInput
                    disabled={false}
                    placeholder={tcPromptlbl}
                    areaLabel={tcPromptlbl}
                    defaultText={openBoxPrompt}
                    onChange={onOpenBoxPromptChange}
                /></Stack>
                </Stack.Item>
                <Stack.Item grow={2}  styles={stackItemStyles}>
                    
                <Stack enableScopedSelectors>
                <h2>{box2Title}</h2>
                <BigInput
                    disabled={false}
                    placeholder={tcPromptlbl}
                    areaLabel={tcPromptlbl}
                    defaultText={openBoxPrompt}
                    onChange={onOpenBoxPromptChange}
                /></Stack>
                </Stack.Item>
                <Stack.Item grow={3}  styles={stackItemStyles}>
                <Stack enableScopedSelectors>
                <h2>{box3Title}</h2>
                <BigInput
                    disabled={false}
                    placeholder={tcPromptlbl}
                    areaLabel={tcPromptlbl}
                    defaultText={openBoxPrompt}
                    onChange={onOpenBoxPromptChange}
                />
                </Stack>
                </Stack.Item>
                </Stack>
                <DefaultButton disabled={isLoading} onClick={makeSummaryRequest}>{isLoading? (<>Loading...</>) : (<>Submit Request</>)} </DefaultButton>
                {gotResult && !isLoading? <GenericAOAIResult input={aoaiResponse} />: <></>}
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
                            className={styles.settingsSeparator}
                            label="Temperature (0 - 10):"
                            min={0}
                            max={10}
                            defaultValue={temperature.toString()}
                            onChange={onTemperatureChange}
                        />
                    </Tooltip>
                    <Tooltip content="The Higher value considers a more dynamic vocabulary." relationship="label">
                        <SpinButton
                            className={styles.settingsSeparator}
                            label="Top_p (0 - 10):"
                            min={0}
                            max={10}
                            defaultValue={top_p.toString()}
                            onChange={onTop_PChange}
                        />
                    </Tooltip>
                    <Tooltip content="The higher considers more information in the text for the summary." relationship="label">
                        <SpinButton
                            className={styles.settingsSeparator}
                            label="Frequency Penalty (0 - 10):"
                            min={0}
                            max={10}
                            defaultValue={frequencyPenalty.toString()}
                            onChange={onFrequencyPenaltyChange}
                        />
                    </Tooltip>
                    <Tooltip content="The higher considers more closely the summary relates to the incoming text." relationship="label">
                        <SpinButton
                            className={styles.settingsSeparator}
                            label="Presence Penalty (0 - 10):"
                            min={0}
                            max={10}
                            defaultValue={presencePenalty.toString()}
                            onChange={onPresencePenaltyChange}
                        />
                    </Tooltip>
                    <Tooltip content="The higher the tokens the higher the allowed cost." relationship="label">
                        <SpinButton
                            className={styles.settingsSeparator}
                            label="Max Tokens:"
                            min={0}
                            max={maxTokensAllowed}
                            defaultValue={maxTokens.toString()}
                            onChange={onMaxTokensChange}
                        />
                    </Tooltip>
                </Panel>
            </div>
        </div>
    </div>);
}

Component.displayName = "textCompare";