
import logo from "./Microsoft-logo-PNG.png"

export interface WhiteBoxProps {
}
export class WhiteBoxModel {
    //View settings
    static useWhiteBox: boolean = false;

    //Page View Overrides
    static showDevSettings: boolean = false;
    static showGitHub: boolean = false;
    static showQuestion: boolean = false;
    static menuLeftTitle: string = "Menu Left Title";
    static menuRightTitle: string = "Menu Right Title";
    static chatPageTitle: string = "Chat Page Title";
    static chatPageSubTitle: string = "Chat Page Subtitle";
    static questPageTitle: string = "Question Page Subtitle";

    static chatPrompt: string = "What is your prompt for the entry box?";
    static questPrompt: string = "What is your prompt for the entry box?";
    static chatLogoOverride: boolean = true;
    static chatLogo = () => {
        return (
            <img src={logo} height={"50px"} style={{ marginBottom: 20 + 'px' }} alt="Microsoft Logo" />
        );
    }
}