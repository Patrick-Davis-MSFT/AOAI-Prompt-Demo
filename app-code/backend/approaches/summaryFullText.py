#Note: The openai-python library support for Azure OpenAI is in preview.
import os
from openai import AzureOpenAI
import sys
from core.modelhelper import get_token_limit

class summaryFullText():
    def token_provider(self, scopes=None):
        return self.defaultCreds.get_token("https://cognitiveservices.azure.com/.default").token
    
    def __init__(self,  defaultCreds, aoai_endpoint, chatgpt_deployment: str, chatgpt_model: str):
        self.defaultCreds = defaultCreds
        self.aoai_endpoint = aoai_endpoint
        
        self.chatgpt_deployment = chatgpt_deployment
        self.chatgpt_model = chatgpt_model
        self.chatgpt_token_limit = 5000 #get_token_limit(chatgpt_model)

    def run(self, prompt:str, text:str, temperature:float, top_p:float, frequency_penalty:float, presence_penalty:float, maxTokens:int): 
        #fullPrompt = prompt + "\n\n# Start of Report\n" + text + "\n# End of Report"
        messages = [{"role": "system", "content": prompt}, {"role": "user", "content": text}]
        self.aoai_client = AzureOpenAI(azure_endpoint=self.aoai_endpoint, 
                                azure_ad_token_provider=self.token_provider, 
                                api_version="2023-12-01-preview")
        if maxTokens < 5000:
            self.chatgpt_token_limit = maxTokens
        response = self.aoai_client.chat.completions.create(
            model=self.chatgpt_model,
            max_tokens=self.chatgpt_token_limit,
            messages=messages,
            temperature=temperature,
            top_p=top_p,
            frequency_penalty=frequency_penalty,
            presence_penalty=presence_penalty,
            stop=None)
        return response