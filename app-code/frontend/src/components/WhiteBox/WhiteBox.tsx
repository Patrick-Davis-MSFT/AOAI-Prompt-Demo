
import logo from "./Microsoft-logo-PNG.png"

export interface WhiteBoxProps {
}
export class WhiteBoxModel {
    //View settings
    static useWhiteBox: boolean = false;
    static maxTokensInit: number = 1500;
    static maxTokensAllowed: number = 2500;

    //Page View Overrides
    static showDevSettings: boolean = true;
    static showGitHub: boolean = true;
    static showQuestion: boolean = true;
    static menuLeftTitle: string = "Summarize Example";
    static menuRightTitle: string = "Azure Open AI Sandbox";
    
    //Summary View Overrides
    static showSummaryPrompt: boolean = true;
    static summaryTitle: string = "Summary Text Page";
    static sumPromptlbl: string = "Summary Prompt Label";
    static txtEntrylbl: string = "Text Entry Label";
    static summaryPromptTXT: string = "Explain the song below in your own words for a child.";
    static sumTextTXT: string = "Bumping up and down in my little red wagon\nBumping up and down in my little red wagon\nBumping up and down in my little red wagon\nWon’t you be my darling?\n\nOne wheel’s off and the axle’s broken\nOne wheel’s off and the axle’s broken\nOne wheel’s off and the axle’s broken\nWon’t you be my darling?\n\nFreddy’s gonna fix it with his hammer\nFreddy’s gonna fix it with his hammer\nFreddy’s gonna fix it with his hammer\nWon’t you be my darling?\n\nBumping up and down in my little red wagon\nBumping up and down in my little red wagon\nBumping up and down in my little red wagon\nWon’t you be my darling?";
    static showTechnicalInfo: boolean = true;


    //Open Box View Overrides
    static openBoxTitle: string = "Open Box Trial";
    static obPromptlbl: string = "Open Box Prompt";
    static openBoxPromptTXT: string = "Tell me a joke.";

    
    //Open Box View Overrides
    static textCompareTitle: string = "Open Box Trial";
    static tcPromptlbl: string = "Open Box Prompt";
    static tcPromptTXT: string = "Tell me a joke.";
    static box1Title: string = "Box 1 Title";
    static box2Title: string = "Box 2 Title";
    static box3Title: string = "Box 3 Title";

    static chatLogoOverride: boolean = true;
    static hideChatLogo: boolean = false;
    static chatLogo = () => {
        return (
            <img src={logo} height={"50px"} style={{ marginBottom: 20 + 'px' }} alt="Microsoft Logo" />
        );
    }
}