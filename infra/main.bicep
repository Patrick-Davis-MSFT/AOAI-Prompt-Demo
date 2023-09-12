targetScope = 'subscription'

// The main bicep module to provision Azure resources.
// For a more complete walkthrough to understand how this file works with azd,
// see https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/make-azd-compatible?pivots=azd-create

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

// Optional parameters to override the default azd resource naming conventions.
// Add the following to main.parameters.json to provide values:
// "resourceGroupName": {
//      "value": "myGroupName"
// }
param resourceGroupName string = ''

var abbrs = loadJsonContent('./abbreviations.json')


param appServicePlanName string = ''
param backendServiceName string = ''

param storageAccountName string = ''
param storageResourceGroupLocation string = location
param storageIdxResumeContainerName string = 'indexed-resumes'
param storageStgResumeContainerName string = 'stage-resumes'


param formRecognizerServiceName string = ''
param formRecognizerSkuName string = 'S0'

param openAiServiceName string = ''
param openAiResourceGroupName string = ''
param openAiSkuName string = 'S0'


param searchServiceName string = ''
param searchServiceSkuName string = 'standard'
param searchIndexName string // Set in main.parameters.json

@description('Location for the OpenAI resource group')
@allowed(['eastus', 'francecentral', 'southcentralus', 'uksouth', 'westeurope'])
@metadata({
  azd: {
    type: 'location'
  }
})
param openAiResourceGroupLocation string


param gptDeploymentName string // Set in main.parameters.json
param gptDeploymentCapacity int = 30
param gptModelName string = 'gpt-35-turbo'
param chatGptDeploymentName string // Set in main.parameters.json
param chatGptDeploymentCapacity int = 30
param chatGptModelName string = 'gpt-35-turbo'
param embeddingDeploymentName string = 'embedding'
param embeddingDeploymentCapacity int = 30
param embeddingModelName string = 'text-embedding-ada-002'


param largeGptDeploymentName string // Set in main.parameters.json
param largegptDeploymentCapacity int = 120
param largegptModelName string = 'gpt-35-turbo-16k'


@description('Id of the user or app to assign application roles')
param principalId string = ''

// tags that should be applied to all resources.
var tags = {
  // Tag all resources with the environment name.
  'azd-env-name': environmentName
}

// Generate a unique token to be used in naming resources.
// Remove linter suppression after using.
#disable-next-line no-unused-vars
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))

// Name of the service defined in azure.yaml
// A tag named azd-service-name with this value should be applied to the service host resource, such as:
//   Microsoft.Web/sites for appservice, function
// Example usage:
//   tags: union(tags, { 'azd-service-name': apiServiceName })
#disable-next-line no-unused-vars
var apiServiceName = 'python-api'

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

resource openAiResourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' existing = if (!empty(openAiResourceGroupName)) {
  name: !empty(openAiResourceGroupName) ? openAiResourceGroupName : rg.name
}

// Add resources to be provisioned below.
// A full example that leverages azd bicep modules can be seen in the todo-python-mongo template:
// https://github.com/Azure-Samples/todo-python-mongo/tree/main/infra


module openAi 'components/ai/cognitiveservices.bicep' = {
  name: 'openai'
  scope: openAiResourceGroup
  params: {
    name: !empty(openAiServiceName) ? openAiServiceName : '${abbrs.cognitiveServicesAccounts}${resourceToken}'
    location: openAiResourceGroupLocation
    tags: tags
    sku: {
      name: openAiSkuName
    }
    deployments: [
      {
        name: gptDeploymentName
        model: {
          format: 'OpenAI'
          name: gptModelName
          version: '0301'
        }
        sku: {
          name: 'Standard'
          capacity: gptDeploymentCapacity
        }
      }
      {
        name: largeGptDeploymentName
        model: {
          format: 'OpenAI'
          name: largegptModelName
          version: '0301'
        }
        sku: {
          name: 'Standard'
          capacity: largegptDeploymentCapacity
        }
      }
      {
        name: chatGptDeploymentName
        model: {
          format: 'OpenAI'
          name: chatGptModelName
          version: '0301'
        }
        sku: {
          name: 'Standard'
          capacity: chatGptDeploymentCapacity
        }
      }
      {
        name: embeddingDeploymentName
        model: {
          format: 'OpenAI'
          name: embeddingModelName
          version: '2'
        }
        capacity: embeddingDeploymentCapacity
      }
    ]
  }
}

//Create Form Reconizer for PDF indexing
module formRecognizer 'components/ai/documentrecog.bicep' = {
  name: 'formrecognizer'
  scope: rg
  params: {
    name: !empty(formRecognizerServiceName) ? formRecognizerServiceName : '${abbrs.cognitiveServicesFormRecognizer}${resourceToken}'
    kind: 'FormRecognizer'
    location: rg.location
    tags: tags
    sku: {
      name: formRecognizerSkuName
    }
  }
}


//create a blob storage account
module storage 'components/storage/storage-account.bicep' = {
  name: 'storage'
  scope: rg
  params: {
    name: !empty(storageAccountName) ? storageAccountName : '${abbrs.storageStorageAccounts}${resourceToken}'
    location: storageResourceGroupLocation
    tags: tags
    publicNetworkAccess: 'Enabled'
    sku: {
      name: 'Standard_ZRS'
    }
    deleteRetentionPolicy: {
      enabled: true
      days: 2
    }
    containers: [
      {
        name: storageIdxResumeContainerName
        publicAccess: 'None'
      }
      {
        name: storageStgResumeContainerName
        publicAccess: 'None'
      }
    ]
  }
}

// Create an App Service Plan to group applications under the same payment plan and SKU
module appServicePlan 'components/host/appserviceplan.bicep' = {
  name: 'appserviceplan'
  scope: rg
  params: {
    name: !empty(appServicePlanName) ? appServicePlanName : '${abbrs.webServerFarms}${resourceToken}'
    location: location
    tags: tags
    sku: {
      name: 'B1'
      capacity: 1
    }
    kind: 'linux'
  }
}

// The application frontend
module backend 'components/host/appservice.bicep' = {
  name: 'web'
  scope: rg
  params: {
    name: !empty(backendServiceName) ? backendServiceName : '${abbrs.webSitesAppService}ui-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'feapp' })
    appServicePlanId: appServicePlan.outputs.id
    runtimeName: 'python'
    runtimeVersion: '3.10'
    scmDoBuildDuringDeployment: true
    managedIdentity: true
    appSettings: {
      AZURE_STORAGE_ACCOUNT: storage.outputs.name
      AZURE_IDX_RESUME_CONTAINER: storageIdxResumeContainerName
      AZURE_STG_RESUME_CONTAINER: storageStgResumeContainerName
      AZURE_OPENAI_SERVICE: openAi.outputs.name
      AZURE_FORMRECOGNIZER_SERVICE: formRecognizer.outputs.name
      AZURE_FORMRECOGNIZER_KEY: formRecognizer.outputs.accountKey
      AZURE_SEARCH_INDEX: searchIndexName
      AZURE_SEARCH_SERVICE: searchService.outputs.name
      AZURE_OPENAI_GPT_DEPLOYMENT: gptDeploymentName
      AZURE_OPENAI_CHATGPT_DEPLOYMENT: chatGptDeploymentName
      AZURE_OPENAI_LARGEGPT_DEPLOYMENT: largeGptDeploymentName
      AZURE_OPENAI_EMB_DEPLOYMENT: embeddingDeploymentName
      AZURE_OPENAI_LARGEGPT_MODEL: largegptModelName
    }
  }
}

//Create search service
module searchService 'components/search/search-services.bicep' = {
  name: 'search-service'
  scope: rg
  params: {
    name: !empty(searchServiceName) ? searchServiceName : 'gptkb-${resourceToken}'
    location: rg.location
    tags: tags
    authOptions: {
      aadOrApiKey: {
        aadAuthFailureMode: 'http401WithBearerChallenge'
      }
    }
    sku: {
      name: searchServiceSkuName
    }
    semanticSearch: 'free'
  }
}

// USER ROLES
module openAiRoleUser 'components/security/role.bicep' = {
  scope: openAiResourceGroup
  name: 'openai-role-user'
  params: {
    principalId: principalId
    roleDefinitionId: '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd'
    principalType: 'User'
  }
}

module formRecognizerRoleUser 'components/security/role.bicep' = {
  scope: rg
  name: 'formrecognizer-role-user'
  params: {
    principalId: principalId
    roleDefinitionId: 'a97b65f3-24c7-4388-baec-2e87135dc908'
    principalType: 'User'
  }
}

module storageRoleUser 'components/security/role.bicep' = {
  scope: rg
  name: 'storage-role-user'
  params: {
    principalId: principalId
    roleDefinitionId: '2a2b9908-6ea1-4ae2-8e65-a410df84e7d1'
    principalType: 'User'
  }
}

module storageContribRoleUser 'components/security/role.bicep' = {
  scope: rg
  name: 'storage-contribrole-user'
  params: {
    principalId: principalId
    roleDefinitionId: 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
    principalType: 'User'
  }
}

module searchRoleUser 'components/security/role.bicep' = {
  scope: rg
  name: 'search-role-user'
  params: {
    principalId: principalId
    roleDefinitionId: '1407120a-92aa-4202-b7e9-c0e197c71c8f'
    principalType: 'User'
  }
}

module searchContribRoleUser 'components/security/role.bicep' = {
  scope: rg
  name: 'search-contrib-role-user'
  params: {
    principalId: principalId
    roleDefinitionId: '8ebe5a00-799e-43f5-93ac-243d3dce84a7'
    principalType: 'User'
  }
}

module searchSvcContribRoleUser 'components/security/role.bicep' = {
  scope: rg
  name: 'search-svccontrib-role-user'
  params: {
    principalId: principalId
    roleDefinitionId: '7ca78c08-252a-4471-8644-bb5ff32d4ba0'
    principalType: 'User'
  }
}

// SYSTEM IDENTITIES
module openAiRoleBackend 'components/security/role.bicep' = {
  scope: openAiResourceGroup
  name: 'openai-role-backend'
  params: {
    principalId: backend.outputs.identityPrincipalId
    roleDefinitionId: '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd'
    principalType: 'ServicePrincipal'
  }
}

module storageRoleBackend 'components/security/role.bicep' = {
  scope: rg
  name: 'storage-role-backend'
  params: {
    principalId: backend.outputs.identityPrincipalId
    roleDefinitionId: '2a2b9908-6ea1-4ae2-8e65-a410df84e7d1'
    principalType: 'ServicePrincipal'
  }
}

module searchRoleBackend 'components/security/role.bicep' = {
  scope: rg
  name: 'search-role-backend'
  params: {
    principalId: backend.outputs.identityPrincipalId
    roleDefinitionId: '1407120a-92aa-4202-b7e9-c0e197c71c8f'
    principalType: 'ServicePrincipal'
  }
}

module formRecRoleBackend 'components/security/role.bicep' = {
  scope: rg
  name: 'formReconizer-role-backend'
  params: {
    principalId: backend.outputs.identityPrincipalId
    roleDefinitionId: 'a97b65f3-24c7-4388-baec-2e87135dc908'
    principalType: 'ServicePrincipal'
  }
}

module formRec2RoleBackend 'components/security/role.bicep' = {
  scope: rg
  name: 'form2Reconizer-role-backend'
  params: {
    principalId: backend.outputs.identityPrincipalId
    roleDefinitionId: '7ca78c08-252a-4471-8644-bb5ff32d4ba0'
    principalType: 'ServicePrincipal'
  }
}

module blobDataContributor 'components/security/role.bicep' = {
  scope: rg
  name: 'blobDataContributor-role-backend'
  params: {
    principalId: backend.outputs.identityPrincipalId
    roleDefinitionId: 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
    principalType: 'ServicePrincipal'
  }
}



// Add outputs from the deployment here, if needed.
//
// This allows the outputs to be referenced by other bicep deployments in the deployment pipeline,
// or by the local machine as a way to reference created resources in Azure for local development.
// Secrets should not be added here.
//
// Outputs are automatically saved in the local azd environment .env file.
// To see these outputs, run `azd env get-values`,  or `azd env get-values --output json` for json output.
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = rg.name


output AZURE_STORAGE_ACCOUNT string = storage.outputs.name
output AZURE_IDX_RESUME_CONTAINER string = storageIdxResumeContainerName
output AZURE_STG_RESUME_CONTAINER string = storageStgResumeContainerName

output BACKEND_URI string = backend.outputs.uri

output AZURE_OPENAI_SERVICE string = openAi.outputs.name
output AZURE_OPENAI_RESOURCE_GROUP string = openAiResourceGroup.name
output AZURE_OPENAI_GPT_DEPLOYMENT string = gptDeploymentName
output AZURE_OPENAI_LARGEGPT_DEPLOYMENT string = largeGptDeploymentName
output AZURE_OPENAI_LARGEGPT_MODEL string = largegptModelName
output AZURE_OPENAI_CHATGPT_DEPLOYMENT string = chatGptDeploymentName
output AZURE_OPENAI_EMB_DEPLOYMENT string = embeddingDeploymentName

output AZURE_FORMRECOGNIZER_SERVICE string = formRecognizer.outputs.name
output AZURE_FORMRECOGNIZER_KEY string = formRecognizer.outputs.accountKey

output AZURE_SEARCH_INDEX string = searchIndexName
output AZURE_SEARCH_SERVICE string = searchService.outputs.name
