import { DefaultButton, DefaultPalette, IStackItemStyles, IStackStyles, IStackTokens, Panel, SpinButton, Stack } from "@fluentui/react";
import { OpenBoxCompareOpts, OpenBoxOpts, callOpenBox, callOpenCompareBox } from "../../api";
import { TextareaOnChangeData, Tooltip } from "@fluentui/react-components";

import styles from "./textCompare.module.css";
import { SettingsButton } from "../../components/SettingsButton";
import { BigInput } from "../../components/BigInput";
import { ChangeEvent, useState } from "react";
import { sizeBoolean } from "@fluentui/react/lib/index.bundle";
import { SparkleFilled } from "@fluentui/react-icons";
import { Text } from "@fluentui/react";
import { WhiteBoxModel } from "../../components/WhiteBox/WhiteBox";
import { AOAIResult, GenericAOAIResult } from "../../components/GenericAOAIResult";

export function Component(): JSX.Element {

    //section for White Boxing Text 
    var textCompareTitle: string = "Text Compare";
    var tcPromptlbl: string = "Text Compare Prompt";
    var box1Title: string = "Resume";
    var box1Caption: string = "Refer to this as {Document 1}";
    var box1Text: string = "I throw rocks very good.";
    var box1lbl: string = "Resume Text";
    var box2Title: string = "Comparison Prompt";
    var box2Caption: string = "Enter Comparison Text Here";
    var box2Text: string = "How does the resume in {Document 1} compare to the job description in {Document 2}?";
    var box2lbl: string = "Prompt";
    var box3Title: string = "Job Description";
    var box3Caption: string = "Refer to this as {Document 2}";
    var box3Text: string = "This job requires someone who throws rocks.";
    var box3lbl: string = "Job Description Text";
    var maxTokensInit: number = 2000;
    var maxTokensAllowed: number = 4500;
    var chatLogo = () => {
        return (<SparkleFilled fontSize={"120px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Chat logo" />);
    }
    if (WhiteBoxModel.useWhiteBox) {
        textCompareTitle = WhiteBoxModel.textCompareTitle;
        box1Title = WhiteBoxModel.box1Title;
        box1Caption = WhiteBoxModel.box1Caption;
        box1Text = WhiteBoxModel.box1Text;
        box1lbl = WhiteBoxModel.box1lbl;
        box2Title = WhiteBoxModel.box2Title;
        box2Caption = WhiteBoxModel.box2Caption;
        box2Text = WhiteBoxModel.box2Text;  
        box2lbl = WhiteBoxModel.box2lbl;
        box3Title = WhiteBoxModel.box3Title;
        box3Caption = WhiteBoxModel.box3Caption;
        box3Text = WhiteBoxModel.box3Text;
        box3lbl = WhiteBoxModel.box3lbl;
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
    const [openBox1Prompt, setOpenBox1Prompt] = useState<string>(box1Text);
    const [openBox2Prompt, setOpenBox2Prompt] = useState<string>(box2Text);
    const [openBox3Prompt, setOpenBox3Prompt] = useState<string>(box3Text);
    
    const [aoaiResponse, setAOAIResponse] = useState<AOAIResult>({} as AOAIResult);
    const [gotResult, setGotResult] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    

    const makeSummaryRequest = async () => {
        setIsLoading(true);
        //remember to divide the number by 10 for Temperature
        const openBoxCompareOpts: OpenBoxCompareOpts = {
            openBox1Prompt: openBox1Prompt,
            openBox2Prompt: openBox2Prompt,
            openBox3Prompt: openBox3Prompt,
            temperature: temperature / 10,
            top_p: top_p / 10,
            frequency_penalty: frequencyPenalty / 10,
            presence_penalty: presencePenalty / 10,
            maxTokens: maxTokens
        };
        const response = await callOpenCompareBox(openBoxCompareOpts);
        const data = await response;
        setAOAIResponse(data);
        setGotResult(true);
        setIsLoading(false);
        console.log(data);
    }

    const onOpenBox1PromptChange = (ev: ChangeEvent<HTMLTextAreaElement>, newValue: TextareaOnChangeData) => {
        setOpenBox1Prompt(newValue.value || "");
    };
    const onOpenBox2PromptChange = (ev: ChangeEvent<HTMLTextAreaElement>, newValue: TextareaOnChangeData) => {
        setOpenBox2Prompt(newValue.value || "");
    };
    const onOpenBox3PromptChange = (ev: ChangeEvent<HTMLTextAreaElement>, newValue: TextareaOnChangeData) => {
        setOpenBox3Prompt(newValue.value || "");
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
                <Text variant="small" >{box1Caption}</Text>
                <BigInput
                    disabled={false}
                    placeholder={box1lbl}
                    areaLabel={box1lbl}
                    defaultText={openBox1Prompt}
                    onChange={onOpenBox1PromptChange}
                /></Stack>
                </Stack.Item>
                <Stack.Item grow={2}  styles={stackItemStyles}>
                    
                <Stack enableScopedSelectors>
                <h2>{box2Title}</h2>
                <Text variant="small" >{box2Caption}</Text>
                <BigInput
                    disabled={false}
                    placeholder={box2lbl}
                    areaLabel={box2lbl}
                    defaultText={openBox2Prompt}
                    onChange={onOpenBox2PromptChange}
                /></Stack>
                </Stack.Item>
                <Stack.Item grow={3}  styles={stackItemStyles}>
                <Stack enableScopedSelectors>
                <h2>{box3Title}</h2>
                <Text variant="small" >{box3Caption}</Text>
                <BigInput
                    disabled={false}
                    placeholder={box3lbl}
                    areaLabel={box3lbl}
                    defaultText={openBox3Prompt}
                    onChange={onOpenBox3PromptChange}
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