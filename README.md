# AOAI Prompt Demos and Workflows

This demonstration allows for a web based playground of Azure Open AI to demonstrate prompt engineering and a few complex workflows. These include

- Open Box Connected Directly to Azure Open AI
- Text Summarization
- Text Comparison 
- Resume Search Workflow (*under construction*)
    > This workflow is not intended to replace or replicate HR needs or other more complex systems. Instead show a window into how Azure Open AI can be used for human like text analysis. 

> **AZURE RESOURCE COSTS** by default this sample will create Azure App Service and Azure Cognitive Search resources that have a monthly cost, as well as Form Recognizer resource that has cost per document page. You can switch them to free versions of each of them if you want to avoid this cost by changing the parameters file under the infra folder (though there are some limits to consider; for example, you can have up to 1 free Cognitive Search resource per subscription, and the free Form Recognizer resource only analyzes the first 2 pages of each document.)

> **Note**: Enterprise Security is <b>not</b> a part of this demonstration. Security for the deploy application is controlled by API Keys and System Assigned Identities. Further security demonstrations are available at https://github.com/Azure-Samples 

> The `.azure/{enviroment-name}/.env` file contains all keys and environmental variables needed to run the demo

## Fist steps
### Prerequisites  
To install this on an azure cloud you will need the following
1. An Azure Cloud Account with the contributor role to the subscription
1. Your Azure Account must have `Microsoft.Authorization/roleAssignments/write` permissions, such as [User Access Administrator](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles#user-access-administrator) or [Owner](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles#owner). 


### Prerequisites
The demo can be installed from
* Github Codespace
* Docker Container
* Azure Cloud Shell
* A Local Development Machine

> To control the resource group that the demo deploys to run `azd env set AZURE_RESOURCE_GROUP {Name of the target resource group}` after running `azd init`. Otherwise the target resource group will be `rg-{enviroment-name}`

### Installing from Cloud Environments

To use a preconfigured VM image choose one of the below options.

[![Open in GitHub Codespaces](https://img.shields.io/static/v1?style=for-the-badge&label=GitHub+Codespaces&message=Open&color=brightgreen&logo=github)](https://github.com/codespaces/new?hide_repo_select=false&ref=main&repo=682644932&machine=standardLinux32gb&devcontainer_path=.devcontainer%2Fdevcontainer.json&location=WestUs2)
[![Open in Remote - Containers](https://img.shields.io/static/v1?style=for-the-badge&label=Remote%20-%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/Patrick-Davis-MSFT/AOAI-Prompt-Demo)

> You may need to give execute authority to the `./scripts` folder with the containers and the cloud accounts or if running from a linux machine.

To install from these cloud development environments open a terminal window 
1. Run `azd auth login` and follow the instructions. 
1. Run `azd init -t Patrick-Davis-MSFT/AOAI-Prompt-Demo`
1. Add the `AZURE_OPENAI_RESOURCE_GROUP` and `AZURE_OPENAI_SERVICE` to the `.azure/{enviroment-name}/.env` file 
    * `azd env set AZURE_OPENAI_SERVICE {Name of existing OpenAI service}`
    * `azd env set AZURE_OPENAI_RESOURCE_GROUP {Name of existing resource group that OpenAI service is provisioned to}`
1. If running on a linux VM set all scripts in the `scripts` folder to execute using `chmod -R 777 scripts`
1. Run `azd deploy`
    - This will create the deployment in a resource group `rg-{enviroment-name}`

To install from the Azure Cloud Shell
1. Create a new directory for the deployment
1. You will need to login using `azd auth login` to run the python scripts 
1. `azd init -t Patrick-Davis-MSFT/AOAI-Prompt-Demo` Note: This will not link the downloaded solution to the git repo
1. Choose to overwrite the files if no if you cloned and/or made changes locally 
1. Add the `AZURE_OPENAI_RESOURCE_GROUP` and `AZURE_OPENAI_SERVICE` to the `.azure/{enviroment-name}/.env` file 
    * `azd env set AZURE_OPENAI_SERVICE {Name of existing OpenAI service}`
    * `azd env set AZURE_OPENAI_RESOURCE_GROUP {Name of existing resource group that OpenAI service is provisioned to}`
1. Update the other parameters in the `.azure` folder as needed
1. If running on the Cloud shell set all scripts in the `scripts` folder to execute using `chmod -R 777 scripts`
1. Deploy the files with `azd up`

### Install locally 
* [Azure Developer CLI](https://aka.ms/azure-dev/install)
* [Python 3+](https://www.python.org/downloads/)
  * **Important**: Python and the pip package manager must be in the path in Windows for the setup scripts to work.
  * **Important**: Ensure you can run `python --version` from console. On Ubuntu, you might need to run `sudo apt install python-is-python3` to link `python` to `python3`.
* [Node.js](https://nodejs.org/en/download/)
* [Git](https://git-scm.com/downloads)
* [Powershell 7+ (pwsh)](https://github.com/powershell/powershell) - For Windows users only.
  * **Important**: Ensure you can run `pwsh.exe` from a PowerShell command. If this fails, you likely need to upgrade PowerShell.
* *Optional*: Visual Studio Code

### Initialize the Project Locally 
1. Create a new folder and switch to it in the terminal
1. Run `azd auth login`
1. Run `azd init -t Patrick-Davis-MSFT/AOAI-Prompt-Demo`
    * note that this command will download this repository but will not initialize git to track local changes
1. Add the `AZURE_OPENAI_RESOURCE_GROUP` and `AZURE_OPENAI_SERVICE` to the `.azure/{enviroment-name}/.env` file by running the following 
    * `azd env set AZURE_OPENAI_SERVICE {Name of existing OpenAI service}`
    * `azd env set AZURE_OPENAI_RESOURCE_GROUP {Name of existing resource group that OpenAI service is provisioned to}`
1. Run `azd up` - This will provision Azure resources and deploy this sample to those resources, including building the search index based on the files found in the `./data` folder.
    * For the target location, the regions that currently support the models used in this sample are **East US**, **France Central**, **South Central US**, **UK South**, and **West Europe**. For an up-to-date list of regions and models, check [here](https://learn.microsoft.com/azure/cognitive-services/openai/concepts/models#model-summary-table-and-region-availability).
1. After the application has been successfully deployed you will see a URL printed to the console.  Click that URL to interact with the application in your browser.  


## Other Helpful commands
> <b>Note</b>: all `azd` commands assume that the user has run both `azd auth login` and the `azd init -t {repo}` first
> - `azd init` only needs to be run once when first setting up the environment

To run the code locally:
1. Clone this repository to your local environment.
1. If not already done so, provision the infrastructure in the Azure subscription using `azd up`
1. Change to the directory `.\app-code`
1. Run the script `.\start.ps1`

To only provision the infrastructure 
1. Run the command `azd provision`

To only deploy the code
1. Run the command `azd deploy`

To test packaging of any changes
1. Run the command `azd package`


#### Sharing Environments

To give someone else access to a completely deployed and existing environment,
either you or they can follow these steps:

1. Install the [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
1. Run `azd init -t Patrick-Davis-MSFT/AOAI-Prompt-Demos` or clone this repository.
1. Run `azd env refresh -e {environment name}`
   They will need the azd environment name, subscription ID, and location to run this command. You can find those values in your `.azure/{env name}/.env` file.  This will populate their azd environment's `.env` file with all the settings needed to run the app locally.
1. Set the environment variable `AZURE_PRINCIPAL_ID` either in that `.env` file or in the active shell to their Azure ID, which they can get with `az account show`.
1. Run `./scripts/roles.ps1` or `.scripts/roles.sh` to assign all of the necessary roles to the user.  If they do not have the necessary permission to create roles in the subscription, then you may need to run this script for them. Once the script runs, they should be able to run the app locally.
