import { Outlet, NavLink, Link } from "react-router-dom";

import github from "../../assets/github.svg";

import styles from "./Layout.module.css";
import { HistoryButton } from "../../components/HistoryButton";
import { FileButton } from "../../components/FilePanel/FileButton";
import { useState } from "react";
//import { Index } from "../../api";
import { HistoryPanel } from "../../components/HistoryPanel";
//import { FilePanel } from "../../components/FilePanel/FilePanel";
import { WhiteBoxModel } from "../../components/WhiteBox/WhiteBox";

const Layout = () => {
    const [isHistPanelOpen, setIsHistPanelOpen] = useState(false);
    const [isFilePanelOpen, setIsFilePanelOpen] = useState(false);
    //const [fileIndexList, setFileIndexList] = useState<Index[]>([]);

    /*const addFileIndexList = (file: Index) => {
        var newFileIndexList = [...fileIndexList];
        newFileIndexList.push(file);
        setFileIndexList(newFileIndexList);
    };*/

    var leftTitle = "GPT Summarize | Sample";
    var rightTitle = "Azure OpenAI";
    if (WhiteBoxModel.useWhiteBox) {
        leftTitle = WhiteBoxModel.menuLeftTitle;
        rightTitle = WhiteBoxModel.menuRightTitle;
    }

    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                    <Link to="/" className={styles.headerTitleContainer}>
                        <h3 className={styles.headerTitle}>{leftTitle}</h3>
                    </Link>
                    <nav>
                        <ul className={styles.headerNavList}>
                            {WhiteBoxModel.showQuestion || !WhiteBoxModel.useWhiteBox ?
                                (<><li>
                                    <NavLink to="/" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                        Summarize
                                    </NavLink>
                                </li>
                                    <li className={styles.headerNavLeftMargin}>
                                        <NavLink to="/fs" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                            File Summarize
                                        </NavLink>
                                    </li></>) : <></>}
                            {WhiteBoxModel.showGitHub || !WhiteBoxModel.useWhiteBox ?
                                <li className={styles.headerNavLeftMargin}>
                                    <a href="https://github.com/Patrick-Davis-MSFT/AOAI-Document-Sumerazation" target={"_blank"} title="Github repository link">
                                        <img
                                            src={github}
                                            alt="Github logo"
                                            aria-label="Link to github repository"
                                            width="20px"
                                            height="20px"
                                            className={styles.githubLogo}
                                        />
                                    </a>
                                </li> : <></>}
                        </ul>
                    </nav>
                    <span>
                        <h4 className={styles.headerRightText}>{rightTitle}</h4>
                        <div className={styles.headerRightText2}>
                            {true ? <></> : <HistoryButton className={styles.settingsButton} onClick={() => setIsHistPanelOpen(!isHistPanelOpen)} />}
                            {true ? <></> : <FileButton className={styles.settingsButton} onClick={() => setIsFilePanelOpen(!isFilePanelOpen)} />}
                            
                            <HistoryPanel
                                show={isHistPanelOpen}
                                close={(cls: boolean) => setIsHistPanelOpen(false)}
                            />
                        </div>
                    </span>
                </div>

            </header>

            <Outlet />
        </div>
    );
};

export default Layout;
