import { Checkbox, DefaultButton, Dropdown, Panel, SpinButton, TextField } from "@fluentui/react";
import { callSummary } from "../../api";


import styles from "./summary.module.css";
import { SettingsButton } from "../../components/SettingsButton";
import { useState } from "react";

const Summary = () => {
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [promptTemplate, setPromptTemplate] = useState<string>("");

    const makeSummaryRequest = async () => {
        //const sumOpts:SummaryOpts = { filename: "somefile", summaryPrompt: "someprompt" };
        const response = await callSummary();
        const data = await response;
        console.log(data);
    }

    const onPromptTemplateChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setPromptTemplate(newValue || "");
    };

    return (<div className={styles.container}>
        <div className={styles.commandsContainer}>
                <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
        </div>
        <div className={styles.sumRoot}>
            <div className={styles.sumContainer}>
                <h1>summary controls</h1>
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
                    <TextField
                        className={styles.chatSettingsSeparator}
                        defaultValue={promptTemplate}
                        label="Override prompt template"
                        multiline
                        autoAdjustHeight
                        onChange={onPromptTemplateChange}
                    />

                  
                </Panel>
            </div>
        </div>
    </div>);
}

export default Summary;