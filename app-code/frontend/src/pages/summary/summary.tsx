import { DefaultButton, Panel, SpinButton, TextField } from "@fluentui/react";
import { callSummary } from "../../api";
import { Tooltip } from "@fluentui/react-components";

import styles from "./summary.module.css";
import { SettingsButton } from "../../components/SettingsButton";
import { useState } from "react";

const Summary = () => {
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [promptTemplate, setPromptTemplate] = useState<string>("");
    const [temperature, setTemperature] = useState<number>(3);
    const [top_p, setTop_p] = useState<number>(10);
    const [frequencyPenalty, setFrequencyPenalty] = useState<number>(0);
    const [presencePenalty, setPresencePenalty] = useState<number>(0);

    const makeSummaryRequest = async () => {
        //remember to divide the number by 10 for Temperature
        //const sumOpts:SummaryOpts = { filename: "somefile", summaryPrompt: "someprompt" };
        const response = await callSummary();
        const data = await response;
        console.log(data);
    }

    const onPromptTemplateChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setPromptTemplate(newValue || "");
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


    return (<div className={styles.container}>
        <div className={styles.commandsContainer}>
            <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
        </div>
        <div className={styles.sumRoot}>
            <div className={styles.sumContainer}>
                <h1>summary controls</h1>

                <TextField
                    className={styles.chatSettingsSeparator}
                    defaultValue={promptTemplate}
                    label="Summary Prompt"
                    multiline
                    autoAdjustHeight
                    onChange={onPromptTemplateChange}
                />

                <TextField
                    className={styles.chatSettingsSeparator}
                    defaultValue={promptTemplate}
                    label="Text to Summarize"
                    multiline
                    autoAdjustHeight
                    onChange={onPromptTemplateChange}
                />
                <DefaultButton onClick={makeSummaryRequest}>Make Summary Request</DefaultButton>
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
                </Panel>
            </div>
        </div>
    </div>);
}

export default Summary;