
import { DefaultButton, Panel, SpinButton, mergeStyles } from "@fluentui/react";
import { TextareaOnChangeData, Tooltip } from "@fluentui/react-components";
import { ChangeEvent, useState } from "react";

import styles from "./SettingsPanel.module.css";

interface Props {
    defaultOpen: boolean;
    isBlocking: boolean;
    defaultTemperature: number | undefined;
    defaultFrequencyPenalty: number | undefined;
    defaultMaxTokens: number | undefined;
    defaultPresencePenalty: number | undefined;
    defaultStopSequences: string[] | undefined;
    defaultTop_p: number | undefined;
    defaultPreResponseText: string | undefined;
    defaultPostResponseText: string | undefined;
    updateSettings: (settings: settings) => void;
}

interface settings {
    temperature: number;
    top_p: number;
    frequencyPenalty: number;
    presencePenalty: number;
    maxTokens: number;
    stopSequences: string[];
    preResponseText: string;
    postResponseText: string;
}

export const SettingsPanel = ({ defaultOpen, 
    isBlocking, 
    updateSettings, 
    defaultTemperature, 
    defaultFrequencyPenalty, 
    defaultMaxTokens, 
    defaultPresencePenalty, 
    defaultStopSequences,
    defaultTop_p, 
    defaultPreResponseText,
    defaultPostResponseText
}: Props) => {
    
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(defaultOpen);
    const [currSettings, setCurrSettings] = useState<settings>({
        frequencyPenalty: defaultFrequencyPenalty? defaultFrequencyPenalty : 0.5, 
        maxTokens: defaultMaxTokens? defaultMaxTokens: 100, 
        presencePenalty: defaultPresencePenalty? defaultPresencePenalty: 0.5, 
        stopSequences: defaultStopSequences? defaultStopSequences: [], 
        temperature: defaultTemperature? defaultTemperature : 0.5, 
        top_p: defaultTop_p? defaultTop_p: 0.5, 
        preResponseText: defaultPreResponseText? defaultPreResponseText:"", 
        postResponseText: defaultPostResponseText? defaultPostResponseText:""});

    const [temperature, setTemperature] = useState(defaultTemperature ? defaultTemperature : 0.1);
    const [top_p, setTop_p] = useState(defaultTemperature ? defaultTemperature : 0.7);
    const [frequencyPenalty, setFrequencyPenalty] = useState(defaultTemperature ? defaultTemperature : 0.5);
    const [presencePenalty, setPresencePenalty] = useState(defaultTemperature ? defaultTemperature : 0.5);
    const [maxTokens, setMaxTokens] = useState(defaultTemperature ? defaultTemperature : 4000);
    
    const setSettings = (settings: settings) => { 
        setCurrSettings(settings);
        updateSettings(settings);
    }
    const onTemperatureChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setTemperature(parseInt(newValue || "3"));
        var tempSettings = currSettings;
        tempSettings.temperature = parseInt(newValue || "3");
        setSettings(tempSettings);
    };

    const onTop_PChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setTop_p(parseInt(newValue || "3"));
        var tempSettings = currSettings;
        tempSettings.top_p = parseInt(newValue || "3");
        setSettings(tempSettings);
    };
    
    const onFrequencyPenaltyChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setFrequencyPenalty(parseInt(newValue || "3"));
        var tempSettings = currSettings;
        tempSettings.frequencyPenalty = parseInt(newValue || "3");
        setSettings(tempSettings);
    };
    const onPresencePenaltyChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setPresencePenalty(parseInt(newValue || "3"));
        var tempSettings = currSettings;
        tempSettings.presencePenalty = parseInt(newValue || "3");
        setSettings(tempSettings);
    };
    const onMaxTokensChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setMaxTokens(parseInt(newValue || "3"));
        var tempSettings = currSettings;
        tempSettings.maxTokens = parseInt(newValue || "3");
        setSettings(tempSettings);
    };

return (<Panel
    headerText="Configure answer generation"
    isOpen={isConfigPanelOpen}
    isBlocking={isBlocking}
    onDismiss={() => setIsConfigPanelOpen(false)}
    closeButtonAriaLabel="Close"
    onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
    isFooterAtBottom={true}
>

    <Tooltip content="The higher leads to more creative results." relationship="label">
        <SpinButton
            className={mergeStyles(styles.settingsSeparator)}
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
            max={32000}
            defaultValue={maxTokens.toString()}
            onChange={onMaxTokensChange}
        />
    </Tooltip>
</Panel>);
}