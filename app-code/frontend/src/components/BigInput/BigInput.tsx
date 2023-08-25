import { ChangeEvent, useState } from "react";
import { Stack, TextField } from "@fluentui/react";
import { Send28Filled } from "@fluentui/react-icons";

import styles from "./BigInput.module.css";
import { Textarea, TextareaOnChangeData } from "@fluentui/react-textarea";
import { Field, Label } from "@fluentui/react-components";

interface Props {
    onChange: (ev: ChangeEvent<HTMLTextAreaElement>, newValue: TextareaOnChangeData) => void;
    disabled: boolean;
    placeholder?: string;
    clearOnSend?: boolean;
    defaultText?: string;
    areaLabel?: string;
}

export const BigInput = ({ disabled, placeholder, defaultText, onChange, areaLabel }: Props) => {
    const [question, setQuestion] = useState<string>(defaultText || "");

    const changeLocalQuestion = (ev: ChangeEvent<HTMLTextAreaElement>, newValue: TextareaOnChangeData) => {
        setQuestion(newValue.value || "");
        onChange(ev, newValue);
    };


    return (
        <Stack horizontal className={styles.inputContainer}>
            <Field label={areaLabel || "Text Entry"} className={styles.inputTextArea}>
                <Textarea
                    placeholder={placeholder}
                    value={question}
                    resize="vertical"
                    className={styles.editArea}
                    onChange={changeLocalQuestion}
                />
            </Field>
        </Stack>
    );
};
