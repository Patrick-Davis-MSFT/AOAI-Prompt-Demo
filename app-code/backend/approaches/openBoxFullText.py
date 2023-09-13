#Note: The openai-python library support for Azure OpenAI is in preview.
import os
import openai
import sys
from core.modelhelper import get_token_limit

class openBoxFullText():
    def __init__(self,  chatgpt_deployment: str, chatgpt_model: str, largeModel:str, largeDeployment:str):
        
        self.chatgpt_deployment = chatgpt_deployment
        self.chatgpt_model = chatgpt_model
        self.chatgpt_token_limit = 5000 #get_token_limit(chatgpt_model)
        self.largeDeployment = largeDeployment
        self.largeModel = largeModel

    def run(self, prompt:str, temperature:float, top_p:float, frequency_penalty:float, presence_penalty:float, maxTokens:int): 
        fullPrompt = ""
        fullPrompt = prompt
        if maxTokens < 5000:
            self.chatgpt_token_limit = maxTokens
        response = openai.Completion.create(
            deployment_id=self.chatgpt_deployment,
            model=self.chatgpt_model,
            max_tokens=self.chatgpt_token_limit,
            prompt=fullPrompt,
            temperature=temperature,
            top_p=top_p,
            frequency_penalty=frequency_penalty,
            presence_penalty=presence_penalty,
            stop=None)
        return response
    
    def runLarge(self, prompt:str, usrmsg: str, temperature:float, top_p:float, frequency_penalty:float, presence_penalty:float, maxTokens:int): 
        fullPrompt = ""
        fullPrompt = prompt
        messages = [{ "role": "system", "content": fullPrompt }, { "role": "user", "content": usrmsg } ]
        if maxTokens < 5000:
            self.chatgpt_token_limit = maxTokens
        response = openai.ChatCompletion.create(
            deployment_id=self.largeDeployment,
            model=self.largeModel,
            max_tokens=self.chatgpt_token_limit,
            messages=messages,
            temperature=temperature,
            top_p=top_p,
            frequency_penalty=frequency_penalty,
            presence_penalty=presence_penalty,
            stop=None)
        return response
    
    def runLarge(self, prompt:str, compareText:str, temperature:float, top_p:float, frequency_penalty:float, presence_penalty:float, maxTokens:int): 
        fullPrompt = ""
        fullPrompt = prompt
        
        messages = [{ "role": "system", "content": fullPrompt }, { "role": "user", "content": compareText } ]
        if maxTokens < 5000:
            self.chatgpt_token_limit = maxTokens
        response = openai.ChatCompletion.create(
            deployment_id=self.largeDeployment,
            model=self.largeModel,
            max_tokens=self.chatgpt_token_limit,
            messages=messages,
            temperature=temperature,
            top_p=top_p,
            frequency_penalty=frequency_penalty,
            presence_penalty=presence_penalty,
            stop=None)
        return response