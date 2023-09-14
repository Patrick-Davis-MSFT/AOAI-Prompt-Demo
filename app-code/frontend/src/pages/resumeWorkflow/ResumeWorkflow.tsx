import { Text, ContextualMenu, DefaultButton, FontWeights, IButtonStyles, IDragOptions, IIconProps, IStackProps, IStackTokens, IconButton, List, Modal, Overlay, Panel, SpinButton, Stack, getTheme, initializeIcons, mergeStyleSets, mergeStyles, CommandButton, TextField } from "@fluentui/react";
import { OpenBoxOpts, ReadyFile, SearchTermOpts, callClearData, callOpenBox, callSearchDocs, calljdSeachTerms, callResumeJD, getReadyFiles, indexReadyFiles, removeStagedFile, resumeJDCompareReq, searchDocumentTerms, searchDocumentTermsResponse, skillTerm, streamToBlob, uploadBlob } from "../../api";
import { TextareaOnChangeData, Tooltip } from "@fluentui/react-components";
import { useId, useBoolean } from '@fluentui/react-hooks';

import styles from "./ResumeWorkflow.module.css";
import { SettingsButton } from "../../components/SettingsButton";
import { BigInput } from "../../components/BigInput";
import { ChangeEvent, useEffect, useState } from "react";
import { sizeBoolean } from "@fluentui/react/lib/index.bundle";
import { Delete16Regular, Delete24Regular, Document16Regular, Document24Regular, SparkleFilled } from "@fluentui/react-icons";
import { WhiteBoxModel } from "../../components/WhiteBox/WhiteBox";
import { AOAIResult, GenericAOAIResult } from "../../components/GenericAOAIResult";
import React from "react";
import ReactMarkdown from "react-markdown";
import JobDescription from "./jobDescription.md?raw"

import MDEditor from '@uiw/react-md-editor';

export function Component(): JSX.Element {

    //section for White Boxing Text 
    var openBoxTitle: string = "Resume Workflow";
    var obPromptlbl: string = "Open Box Prompt";
    var searchTermPromptTXT: string = "### The User is sending a Job Description formatted with Markdown. Find the top five skills and search terms that an applicant would need to perform the job successfully according to the job description provided. \n " +
        " Respond first with a JavaScript Array of Objects. Only use information noted in the job description and no where else. \n " +
        " Order the skills from most important to least important. \n\n" +
        ' Format your answers in a javascript string array of objects in the structure {"skill": "value", "term": "value" } where as the skill ' +
        'is the skill from the document and the term is 4 or more generated search keywords in a single string. The result should be returned such as \n' +
        '```\n const topSkills = [{"skill": "value", "term": "value" },  \n ' +
        '{"skill": "value", "term": "value" }, \n ' +
        '{"skill": "value", "term": "value" }, \n ' +
        '{"skill": "value", "term": "value" }, \n ' +
        '{"skill": "value", "term": "value" }] \n``` \n\n ' +
        "Replace value with the skill or the search term. \n " +
        "Do not include any other information. \n " +
        "If there are less than five skills that are important return an array of only those skills. \n " +
        "If there are no skills that are important return an empty array. ###";
    var resumeCompareJDPromptTXT: string = ' ### Provided below is a Job Description formatted with Markdown. ' + 
    'The User is sending a resume in plain text.  \n' +
    'Start the response with the name and contact email supplied in the resume in the format below, ' +
    'replacing the request in the between the curly brackets { } with the requested information from the resume.  \n\n' +
    'Applicant Name: {Name from Resume} \n' +
    'Applicant Email: {Email from Resume} \n' +
    'Applicant Phone: {Phone Number from Resume} \n\n' +  
    'Then compare the resume to the Job Description and return a score between 1 and 10 for ' +
    'how well the resume matches the job description. \n' +
    'The score should be returned as a single number between 1 and 10. \n' +
    'Also provide a brief explanation of why the score was given.  Respond only with plain text in English. ### ';
    var maxTokensInit: number = 15000;
    var maxTokensAllowed: number = 15000;
    var chatLogo = () => {
        return (<SparkleFilled fontSize={"120px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Chat logo" />);
    }
    if (WhiteBoxModel.useWhiteBox) {
        openBoxTitle = WhiteBoxModel.openBoxTitle;
        obPromptlbl = WhiteBoxModel.obPromptlbl;
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
    const [searchTermPrompt, setSearchTermPrompt] = useState<string>(searchTermPromptTXT);
    const [resumeJDComparePrompt, setResumeJDComparePrompt] = useState<string>(resumeCompareJDPromptTXT);
    const [aoaiSkillTermsResponse, setAOAISkillTermsResponse] = useState<AOAIResult>({} as AOAIResult);
    const [gotSkillTermsResult, setGotSkillTermsResult] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [streamOutput, setStreamOutput] = useState<string>("");
    const [jdValue, setJdValue] = useState<string>(JobDescription);
    const [docResponse, setDocResponse] = useState<searchDocumentTermsResponse[]>([]);
    const [aoaiResumeRecResp, setAOAIResumeRecResp] = useState<AOAIResult[]>([]);

    const updateJD = (value?: string | undefined, event?: ChangeEvent<HTMLTextAreaElement>) => {
        setJdValue(value || "");
    }

    const makeSearchTermRequest = async () => {
        setIsLoading(true);
        //remember to divide the number by 10 for Temperature
        const searchTermOpts: SearchTermOpts = {
            searchTermPrompt: searchTermPrompt,
            jobDescription: jdValue,
            temperature: temperature / 10,
            top_p: top_p / 10,
            frequency_penalty: frequencyPenalty / 10,
            presence_penalty: presencePenalty / 10,
            maxTokens: maxTokens
        };
        const response = await calljdSeachTerms(searchTermOpts);
        const data = await response;
        setAOAISkillTermsResponse(data);
        setGotSkillTermsResult(true);
        setIsLoading(false);
        console.log(data);
    }

    const compareResumeJD = () => {
        if (docResponse.length === 0) { alert("Please run the search resumes prompt first."); return; }

        setAOAIResumeRecResp([]);
        compareResumeJDCall();
    }

    const compareResumeJDCall = async () => {
        setIsLoading(true);

        //consolidate resumes into a single list
        var resumes = new Array();
        docResponse.forEach((doc: searchDocumentTermsResponse) => {
            if (resumes.indexOf(doc.document) === -1) {
                resumes.push(doc.document);
            }
        });
        resumes.forEach(async (resume: string) => {
            const compareResumeJD: resumeJDCompareReq = {
                prompt: resumeJDComparePrompt,
                resumeName: resume,
                jobDesc: jdValue,
                temperature: temperature / 10,
                top_p: top_p / 10,
                frequency_penalty: frequencyPenalty / 10,
                presence_penalty: presencePenalty / 10,
                maxTokens: maxTokens
            };
            const response = await callResumeJD(compareResumeJD);
            const data = await response;
            console.log(data);
            setAOAIResumeRecResp((aoaiResumeRecResp) => [...aoaiResumeRecResp, data]);
            setIsLoading(false);

        });

    }


    const searchResumes = () => {
        setDocResponse([]);
        searchResumesCall();
    }

    const searchResumesCall = async () => {
        if (aoaiSkillTermsResponse && aoaiSkillTermsResponse.choices && aoaiSkillTermsResponse.choices[0].message && aoaiSkillTermsResponse.choices[0].message.content) {
            setIsLoading(true);
            var searchTerms: skillTerm[];
            try {
                var searchTermPrompt = aoaiSkillTermsResponse.choices[0].message.content;
                const startIndex = searchTermPrompt.indexOf("[");
                const endIndex = searchTermPrompt.indexOf("]") + 1;
                const formattedSearch = searchTermPrompt.substring(startIndex, endIndex);
                console.log(formattedSearch);
                searchTerms = JSON.parse(formattedSearch);
            }
            catch (error: any) {
                console.log(error);
                alert(`An error occurred in parsing the response last format: ${error.message}`);
                setIsLoading(false);
                return;
            }
            searchTerms.forEach(async (term: skillTerm) => {
                console.log("term")
                console.log(term);
                const searchDocuments: searchDocumentTerms = {
                    searchTerm: term.term,
                    searchSkill: term.skill,
                    temperature: temperature / 10,
                    top_p: top_p / 10,
                    frequency_penalty: frequencyPenalty / 10,
                    presence_penalty: presencePenalty / 10,
                    maxTokens: maxTokens
                }

                const response = await callSearchDocs(searchDocuments);
                const data = await response;
                data.forEach((doc: searchDocumentTermsResponse) => {
                    setDocResponse((docResponse) => [...docResponse, doc]);
                });

                setIsLoading(false);
            });
        }
        else { alert("Please run the skill finding prompt first.") }
    }

    const onOpenBoxPromptChange = (ev: ChangeEvent<HTMLTextAreaElement>, newValue: TextareaOnChangeData) => {
        setSearchTermPrompt(newValue.value || "");
    };

    const onResumeJDComparePrompt = (ev: ChangeEvent<HTMLTextAreaElement>, newValue: TextareaOnChangeData) => {
        setResumeJDComparePrompt(newValue.value || "");
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
    const bodyStackTokens: IStackTokens = { childrenGap: 25, padding: 10, };
    const confirmBtnStackTokens: IStackTokens = { childrenGap: 5, padding: 10 };
    const bodyStackSecondRowFirstCol: IStackTokens = {};


    const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
    const [isModalOpenConfirm, { setTrue: showModalConfirm, setFalse: hideModalConfirm }] = useBoolean(false);
    const [isModalOpenSource, { setTrue: showModalSource, setFalse: hideModalSource }] = useBoolean(false);
    const [isOverlayVisible, { toggle: toggleIsOverlayVisible2 }] = useBoolean(false);
    const [isDraggable, { toggle: toggleIsDraggable }] = useBoolean(false);
    const [keepInBounds, { toggle: toggleKeepInBounds }] = useBoolean(false);
    const [overlayText, setOverlayText] = useState('Overlay is Here');
    const titleId = useId('howitworks');
    const confirmTitleId = useId('confirm');
    const sourceTitleId = useId('sourceModal');
    const [error, setError] = useState<string | null>(null);
    const [uploadIndexDisabled, setUploadIndexDisabled] = useState<boolean>(false); //disable index button
    const [activeSource, setActiveSource] = useState<string>("");

    const toggleIsOverlayVisible = () => {
        window.scrollTo(0, 0);
        toggleIsOverlayVisible2();

    }

    useEffect(() => {
        const run = async () => {
            await setReadyFileList();
        }
        run();
    }, []);

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
        const callReset = async () => {
            try {
                await callClearData();
                toggleIsOverlayVisible();
                setReadyFileList();
            }
            catch (e: any) {
                console.log(e);
                setOverlayText("Error in callReset(): " + e.message);
            }
        }
        setOverlayText("Clearing Data...");
        toggleIsOverlayVisible();
        callReset();
        hideModalConfirm();
    }

    const [file, setFile] = useState<File | null>(null);
    const [fileUploading, setFileUploading] = useState<boolean>(false);

    const [uploadedFileList, setUploadedFileList] = useState<ReadyFile[]>([]);
    const setReadyFileList = async () => {
        const fileIdx = await getReadyFiles();
        setUploadedFileList(fileIdx);
        return true;
    };
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!file) return;

        setOverlayText("Uploading: " + file.name + "...");
        toggleIsOverlayVisible();
        try {
            setFileUploading(true);
            console.log("loading: " + file.name);
            const blob = await streamToBlob(file.stream());
            await uploadBlob(blob, file.name);
            console.log("done: " + file.name);
            await setReadyFileList();
            setFile(null);
            toggleIsOverlayVisible();
        }
        catch (error: any) {
            console.log(error);
            setError("Error in Upload: " + error.message);
            setOverlayText("Error in Upload: " + error.message);

        }
        setFileUploading(false);
    }

    const removeItem = (name: string) => {
        setOverlayText("Removing " + name + "...");
        toggleIsOverlayVisible();
        setUploadIndexDisabled(true);
        const removeStagedItem = async (name: string) => {
            const result = await removeStagedFile(name);
            console.log(result);
            await setReadyFileList();
            setUploadIndexDisabled(false);
            toggleIsOverlayVisible();
        }
        removeStagedItem(name);
    }

    const getStreamOutput = (data: string) => {
        setStreamOutput(data);
    }
    const callIndexFiles = async () => {
        try {
            const retValue = await indexReadyFiles(getStreamOutput);
            console.log(retValue);
            await setReadyFileList();
            setStreamOutput("");
        }
        catch (error: any) {
            console.log(error);
            alert(`An error occurred: ${error.message}`);
            setError(error.message);
            setOverlayText("Indexing Error: " + error.message);
        }
        setError(null);
        setUploadIndexDisabled(false);
        toggleIsOverlayVisible();
    };
    const indexFilesPress = () => {

        setOverlayText("Indexing Files...");
        toggleIsOverlayVisible();
        setUploadIndexDisabled(true);
        return callIndexFiles();
    };

    const onRenderCellFiles = (item?: ReadyFile, index?: number | undefined): JSX.Element | null => {
        if (!item) return null;
        return (<>
            <div className={styles.fileOptContainer}>
                <span className={styles.fileOption}><Document24Regular />
                    <Text variant="large">{item.name}</Text>
                    <CommandButton onClick={() => removeItem(item.name)}><Delete24Regular />
                    </CommandButton>
                </span>
            </div>
        </>);
    };

    const removeDocMatch = (name: string, skill: string) => {
        var tmp = docResponse.filter((doc: searchDocumentTermsResponse) => doc.document !== name || doc.searchSkill !== skill);
        setDocResponse(tmp);
    }

    const onRenderCellDocs = (item?: searchDocumentTermsResponse, index?: number | undefined): JSX.Element | null => {
        if (!item) return null;
        return (<>
            <div className={mergeStyles(styles.docRetItemContainer)}>
                <span className={mergeStyles(styles.docRetItemSpan)}>
                    <Document16Regular />
                    <Text variant="medium">{item.document} - Matched on: {item.searchTerm} - Score: {item.score} </Text>
                    <CommandButton onClick={() => removeDocMatch(item.document, item.searchSkill)}><Delete16Regular /></CommandButton>
                </span>
            </div>
        </>)
    }

    const showActiveSource = (source?: string) => {
        if (!source) return;
        setActiveSource(source);
        showModalSource();
    }

    const onRenderRecResults = (item?: AOAIResult, index?: number | undefined): JSX.Element | null => {
        if (!item) return null;
        return (<>
            <div className={mergeStyles(styles.docRetItemContainer)}>
                <span className={mergeStyles(styles.docRetItemSpan)}>
                    <GenericAOAIResult input={item} boxTitle={"AOAI Resume Recommendation #" + index} hideTitle={true} />
                    <div className={styles.docRetItemBtnDiv}>
                        {item.source ? <DefaultButton onClick={() => showActiveSource(item.source)}>View Source Resume</DefaultButton> : <></>}
                    </div>
                </span>
            </div>
        </>);
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
                    {fileUploading ? <h3>File Uploading... Please Wait</h3> : <>
                        <h3>File Upload</h3>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                            />
                            <button type="submit" disabled={!file}>
                                Upload
                            </button>
                        </form></>}
                </Stack.Item>
                <Stack.Item align="start">
                    <h3>Ready for Indexing</h3>
                    <DefaultButton
                        className={styles.buttonSpace}
                        onClick={() => indexFilesPress()}
                        disabled={uploadIndexDisabled || uploadedFileList.length === 0}>
                        Upload Index
                    </DefaultButton>
                    <List items={uploadedFileList} onRenderCell={onRenderCellFiles} />
                    {error ? <Text variant="large" style={{ color: "red" }}>{error}</Text> : null}
                </Stack.Item>
            </Stack>
            <Stack enableScopedSelectors>
                <Stack.Item align="start">
                    <h2>Step 2. Update the Job Description</h2>
                </Stack.Item>
                <Stack.Item align="start">
                    <div data-color-mode="light">
                        <MDEditor
                            value={jdValue}
                            onChange={updateJD}
                        />
                    </div>
                </Stack.Item>
            </Stack>
        </Stack>
        <hr className={styles.divider}></hr>
        <Stack enableScopedSelectors tokens={bodyStackTokens}>
            <Stack enableScopedSelectors horizontal>
                <Stack.Item grow={1}>
                    <h2>Step 3 - 1. Skill Finding Prompt</h2>
                    <BigInput
                        disabled={false}
                        placeholder={obPromptlbl}
                        areaLabel={obPromptlbl}
                        defaultText={searchTermPrompt}
                        onChange={onOpenBoxPromptChange}
                    />
                    <DefaultButton disabled={isLoading} onClick={makeSearchTermRequest}>{isLoading ? (<>Loading...</>) : (<>Find Skills from JD</>)} </DefaultButton>

                </Stack.Item>
                <Stack.Item grow={2}>
                    <h2>Step 3 - 2. Output from Skilling</h2>
                    {gotSkillTermsResult ? <GenericAOAIResult input={aoaiSkillTermsResponse} boxTitle={"Azure OpenAI Result"} hideTitle={true} /> : <></>}
                </Stack.Item>
            </Stack>
        </Stack>

        <hr className={styles.divider}></hr>
        <Stack enableScopedSelectors tokens={bodyStackTokens}>
            <Stack enableScopedSelectors horizontal>
                <Stack.Item grow={1}>
                    <h2>Step 4 - 1. Search Resumes</h2>
                    <p>Search resumes for the returned search terms from Azure OpenAI</p>
                    <DefaultButton disabled={isLoading} onClick={searchResumes}>{isLoading ? (<>Loading...</>) : (<>Search Resumes</>)} </DefaultButton>

                </Stack.Item>
                <Stack.Item grow={3}>
                    <h2>Step 4 - 2. Resumes returned</h2>
                    {!docResponse || docResponse.length == 0 ? <></> :
                        <div className={styles.docRetContainer} data-is-scrollable>
                            <List items={docResponse} onRenderCell={onRenderCellDocs} />
                        </div>}
                </Stack.Item>
            </Stack>
        </Stack>

        <hr className={styles.divider}></hr>
        <Stack enableScopedSelectors tokens={bodyStackTokens}>
            <Stack enableScopedSelectors>
                <Stack.Item grow={1}>
                    <h2>Step 5. Compare the Resume to the job Listing</h2>
                    <p>Using the provided Job Listing Compare that to the resumes selected</p>
                    <BigInput
                        disabled={false}
                        placeholder={obPromptlbl}
                        areaLabel={obPromptlbl}
                        defaultText={resumeJDComparePrompt}
                        onChange={onResumeJDComparePrompt}
                    />
                    <DefaultButton disabled={isLoading} onClick={compareResumeJD}>{isLoading ? (<>Loading...</>) : (<>Compare Resumes to JD</>)} </DefaultButton>

                </Stack.Item>
            </Stack>
        </Stack>
        {!aoaiResumeRecResp || aoaiResumeRecResp.length == 0 ? <></> :
            <Stack enableScopedSelectors tokens={bodyStackTokens}>
                <Stack enableScopedSelectors horizontal>
                    <Stack.Item grow={1}>
                        <h2>Azure OpenAI Recommendations</h2>
                        <List items={aoaiResumeRecResp} onRenderCell={onRenderRecResults} />
                    </Stack.Item>
                </Stack>
            </Stack>
        }
        {isOverlayVisible && (
            <Overlay className={mergeStyles(styles.overlay)}>
                <Stack enableScopedSelectors>
                    <Stack.Item align="center" className={styles.overlayContent}>
                        <div >{overlayText}</div>
                        <pre className={mergeStyles(styles.indexOut)}>{streamOutput}</pre>
                    </Stack.Item>
                </Stack>
            </Overlay>
        )}
        <Modal
            titleAriaId={sourceTitleId}
            isOpen={isModalOpenSource}
            onDismiss={hideModalSource}
            isBlocking={false}
            containerClassName={mergeStyles(styles.modalContainerSource)}
            dragOptions={isDraggable ? dragOptions : undefined}>
            <div className={mergeStyles(styles.modalHeader, styles.modalHeaderSource)}>
            <IconButton
                styles={iconButtonStyles}
                iconProps={cancelIcon}
                ariaLabel="Close confirm modal"
                onClick={hideModalSource} />
                <h2>Resume Source Document</h2>
            </div>
            <div className={mergeStyles(styles.modalContainerSourceBody)}>
                <iframe title="Source Resume" src={activeSource} height="80%" width="95%" />
            </div>
        </Modal>
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
                    It uses Azure OpenAI service, Azure Document Services and cognitive search to find the best matching resumes. This is
                    an example of a complex workflow that can be built using Azure OpenAI. Because of the complexity of this workflow this
                    page cannot be changed.
                </p>
                <h3>The Workflow</h3>
                <p>
                    The workflow starts with a job description. The job description is first summarized by Azure OpenAI to produce a list
                    of skills needed for the position. The job description is then sent to Azure Cognitive Search to find resumes that match
                    the skills needed for the position. The resumes are then returned to Azure OpenAI to compare with the job description and
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
                        <ul>
                            <li> Do <b>not</b> leave the page. This can interrupt the process.</li>
                        </ul>
                    </li>
                    <li>Enter the job description or use the one that is provided.</li>
                    <li>Update the Skill Finding Prompt to extract skills from the job description and run it.</li>
                    <li>Search the resumes for the relevant skills and view the relevant resumes.</li>
                    <li>Update the prompt for comparing the relevant resumes to the job description.</li>
                    <li>View the Azure OpenAI recommendations for the relevant resumes.</li>
                </ol>
                <small><b>Note:</b> Data used in this example has been generated using Azure OpenAI and public sources. No real PII should be used or exposed in this example.</small>
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