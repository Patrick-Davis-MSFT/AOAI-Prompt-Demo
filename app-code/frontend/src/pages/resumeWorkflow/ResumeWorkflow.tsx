import { ContextualMenu, DefaultButton, FontWeights, IButtonStyles, IDragOptions, IIconProps, IStackProps, IStackTokens, IconButton, Modal, Overlay, Panel, SpinButton, Stack, getTheme, initializeIcons, mergeStyleSets, mergeStyles } from "@fluentui/react";
import { OpenBoxOpts, callClearData, callOpenBox } from "../../api";
import { TextareaOnChangeData, Tooltip } from "@fluentui/react-components";
import { useId, useBoolean } from '@fluentui/react-hooks';

import styles from "./ResumeWorkflow.module.css";
import { SettingsButton } from "../../components/SettingsButton";
import { BigInput } from "../../components/BigInput";
import { ChangeEvent, useState } from "react";
import { sizeBoolean } from "@fluentui/react/lib/index.bundle";
import { SparkleFilled } from "@fluentui/react-icons";
import { WhiteBoxModel } from "../../components/WhiteBox/WhiteBox";
import { AOAIResult, GenericAOAIResult } from "../../components/GenericAOAIResult";
import React from "react";

export function Component(): JSX.Element {

    //section for White Boxing Text 
    var openBoxTitle: string = "Resume Workflow";
    var obPromptlbl: string = "Open Box Prompt";
    var openBoxPromptTXT: string = "some job description";
    var maxTokensInit: number = 250;
    var maxTokensAllowed: number = 2500;
    var chatLogo = () => {
        return (<SparkleFilled fontSize={"120px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Chat logo" />);
    }
    if (WhiteBoxModel.useWhiteBox) {
        openBoxTitle = WhiteBoxModel.openBoxTitle;
        obPromptlbl = WhiteBoxModel.obPromptlbl;
        openBoxPromptTXT = WhiteBoxModel.openBoxPromptTXT;
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
    const [openBoxPrompt, setOpenBoxPrompt] = useState<string>(openBoxPromptTXT);

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


    const sectionStackTokens: IStackTokens = { childrenGap: 10, padding: 10 };
    const headingStackTokens: IStackTokens = { childrenGap: 50 };
    const bodyStackTokens: IStackTokens = { childrenGap: 5, padding: 10, maxWidth: 400 };
    const confirmBtnStackTokens: IStackTokens = { childrenGap: 5, padding: 10 };

    const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
    const [isModalOpenConfirm, { setTrue: showModalConfirm, setFalse: hideModalConfirm }] = useBoolean(false);
    const [isOverlayVisible, { toggle: toggleIsOverlayVisible }] = useBoolean(false);
    const [isDraggable, { toggle: toggleIsDraggable }] = useBoolean(false);
    const [keepInBounds, { toggle: toggleKeepInBounds }] = useBoolean(false);
    const [overlayText, setOverlayText] = useState('Overlay is Here');
    const titleId = useId('howitworks');

    const confirmTitleId = useId('confirm');

    const dragOptions = React.useMemo(
        (): IDragOptions => ({
            moveMenuItemText: 'Move',
            closeMenuItemText: 'Close',
            menu: ContextualMenu,
            keepInBounds,
            dragHandleSelector: '.ms-Modal-scrollableContent > div:first-child',
        }),
        [keepInBounds],
    );

    const cancelIcon: IIconProps = { iconName: 'Cancel' };

    const resetData = () => {
        const callReset = async() => {
            try{
            await callClearData();
            toggleIsOverlayVisible();
            }
            catch(e: any){
                console.log(e);
                setOverlayText("Error in callReset(): " + e.message)
            }
        }
        setOverlayText("Clearing Data...");
        toggleIsOverlayVisible();
        callReset();
        hideModalConfirm();
    }

    return (<div className={styles.container}>
        <div className={styles.commandsContainer}>
            <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
        </div>
        <Stack enableScopedSelectors tokens={sectionStackTokens}>
            <Stack enableScopedSelectors horizontal tokens={headingStackTokens} className={mergeStyles(styles.headerStack)}>
                <Stack enableScopedSelectors>
                    <Stack.Item align="start">
                        <span>
                            <DefaultButton className={styles.commandButton} onClick={showModal} >How Does this work?</DefaultButton>
                        </span></Stack.Item>
                </Stack>
                <Stack enableScopedSelectors horizontalAlign="center" className={mergeStyles(styles.headerItem)} >
                    <Stack.Item align="center">
                        {WhiteBoxModel.hideChatLogo ? <></> : chatLogo()}
                    </Stack.Item>
                    <Stack.Item align="center">
                        <h1>{openBoxTitle}</h1>
                    </Stack.Item>
                </Stack>
            </Stack>
        </Stack>
        <Stack enableScopedSelectors horizontal tokens={bodyStackTokens}>
            <Stack enableScopedSelectors>
                <Stack.Item align="center">
                    <h2>Step 1. Update the Resume Pool</h2>
                </Stack.Item>
                <Stack.Item align="start">
                    <DefaultButton className={styles.warningButton} onClick={showModalConfirm} >Clear Existing Data</DefaultButton>
                </Stack.Item>
                <Stack.Item align="start">
                    <h2>Upload Button</h2>
                </Stack.Item>
                <Stack.Item align="start">
                    <h2>Index Button</h2>
                </Stack.Item>
            </Stack>
        </Stack>
        <Stack>
            <Stack.Item className={styles.contentStack} align="center">
                <div className={styles.sumContainer}>

                    <BigInput
                        disabled={false}
                        placeholder={obPromptlbl}
                        areaLabel={obPromptlbl}
                        defaultText={openBoxPrompt}
                        onChange={onOpenBoxPromptChange}
                    />
                    <DefaultButton disabled={isLoading} onClick={makeSummaryRequest}>{isLoading ? (<>Loading...</>) : (<>Submit Request</>)} </DefaultButton>
                    {gotResult && !isLoading ? <GenericAOAIResult input={aoaiResponse} /> : <></>}

                    {isOverlayVisible && (
                        <Overlay className={mergeStyles(styles.overlay)}>
                                                 <Stack enableScopedSelectors>
                                <Stack.Item align="center" className={styles.overlayContent}>
                                    <div >{overlayText}</div>
                                </Stack.Item>
                            </Stack>
                        </Overlay>
                    )}
                    <Modal
                        titleAriaId={confirmTitleId}
                        isOpen={isModalOpenConfirm}
                        onDismiss={hideModalConfirm}
                        isBlocking={false}
                        containerClassName={mergeStyles(styles.modalContainer)}
                        dragOptions={isDraggable ? dragOptions : undefined}>
                        <IconButton
                            styles={iconButtonStyles}
                            iconProps={cancelIcon}
                            ariaLabel="Close confirm modal"
                            onClick={hideModalConfirm} />
                        <Stack enableScopedSelectors >
                            <Stack.Item align="center">
                                <h2>Are you Sure?</h2>
                            </Stack.Item>
                            <Stack.Item align="center">
                                <Stack enableScopedSelectors horizontal tokens={confirmBtnStackTokens}>
                                    <Stack.Item align="center">
                                        <DefaultButton className={styles.warningButton} onClick={() => resetData()} >Yes</DefaultButton>
                                    </Stack.Item>
                                    <Stack.Item align="center">
                                        <DefaultButton className={styles.notWarningButton} onClick={hideModalConfirm} >No</DefaultButton>
                                    </Stack.Item>
                                </Stack>
                            </Stack.Item>
                            <Stack.Item align="center">
                                <div>Note: This will clear all existing data.</div>
                            </Stack.Item>
                        </Stack>
                    </Modal>
                    <Modal
                        titleAriaId={titleId}
                        isOpen={isModalOpen}
                        onDismiss={hideModal}
                        isBlocking={false}
                        containerClassName={mergeStyles(styles.modalContainer)}
                        dragOptions={isDraggable ? dragOptions : undefined}>
                        <div className={mergeStyles(styles.modalHeader)}>
                            <IconButton
                                styles={iconButtonStyles}
                                iconProps={cancelIcon}
                                ariaLabel="Close popup modal"
                                onClick={hideModal}
                            />
                            <h2 className={mergeStyles(styles.modalHeading)} id={titleId}>
                                How It Works...
                            </h2>
                        </div>
                        <div className={mergeStyles(styles.modalBody)}>
                            <h3>What it Does</h3>
                            <p>
                                This example is a demonstration of how to use the Azure OpenAI API to analyze resumes for a given job description.
                                It uses Azure Open AI service, Azure Document Services and cognitive search to find the best matching resumes. This is
                                an example of a complex workflow that can be built using Azure OpenAI. Because of the complexity of this workflow this
                                page cannot be changed.
                            </p>
                            <h3>The Workflow</h3>
                            <p>
                                The workflow starts with a job description. The job description is first summarized by Azure Open AI to produce a list
                                of skills needed for the position. The job description is then sent to Azure Cognitive Search to find resumes that match
                                the skills needed for the position. The resumes are then returned to Azure Open AI to compare with the job description and
                                give a score for each resume. The resumes are then sorted by scored and recommendations are returned to the user.
                            </p>
                            <h3>How to Use the Demo</h3>
                            <p>The following inputs are required from the user.</p>
                            <ul>
                                <li>Job Description</li>
                                <li>Resumes in <i>PDF</i> format</li>
                                <li>Azure Cloud Subscription and this demo deployed</li>
                                <li>A basic level of prompt engineering is helpful</li>
                            </ul>
                            <p>
                                Once the demo and infrastructure is deployed. Follow these steps to use the demo on this page:
                            </p>
                            <ol>
                                <li>If you are using a new batch of resumes press the reset button
                                    <ul>
                                        <li>This will clear all information that is stored in the storage account, search indexing and fields on the UI.</li>
                                        <li>You <i>must</i> reload and index all Resumes after pressing this button.</li>
                                    </ul></li>
                                <li>Select the resumes to upload and click upload.</li>
                                <li>Once the resumes are staged. Index the resumes. <i>Indexing can take a few minutes.</i>
                                    <ul><li> Do <b>not</b> leave the page. This can interrupt the process.</li></ul></li>
                                <li>Once the resumes are indexed. Enter the job description and click submit.</li>
                                <li>View the results.</li>
                            </ol>
                        </div>
                    </Modal>
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
            </Stack.Item>
        </Stack>
    </div>);
}

const theme = getTheme();


const iconButtonStyles: Partial<IButtonStyles> = {
    root: {
        color: theme.palette.neutralPrimary,
        marginLeft: 'auto',
        marginTop: '1px',
        marginRight: '2px',
        float: 'right',
    },
    rootHovered: {
        color: theme.palette.neutralDark,
    },
};

Component.displayName = "ResumeWorkflow";