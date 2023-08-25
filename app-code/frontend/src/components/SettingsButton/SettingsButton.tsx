import { Text } from "@fluentui/react";
import { Settings24Regular } from "@fluentui/react-icons";
import { WhiteBoxModel } from "../WhiteBox/WhiteBox";

import styles from "./SettingsButton.module.css";

interface Props {
    className?: string;
    onClick: () => void;
}

export const SettingsButton = ({ className, onClick }: Props) => {
    if (!WhiteBoxModel.showDevSettings && WhiteBoxModel.useWhiteBox) {
        return <></>;
    }
    return (
        <div className={`${styles.container} ${className ?? ""}`} onClick={onClick}>
            <Settings24Regular />
            <Text>{"Settings"}</Text>
        </div>
    );
};
