#Note: The openai-python library support for Azure OpenAI is in preview.
import os
import openai
import sys
from core.modelhelper import get_token_limit

class summaryFullText():
    def __init__(self,  chatgpt_deployment: str, chatgpt_model: str):
        
        self.chatgpt_deployment = chatgpt_deployment
        self.chatgpt_model = chatgpt_model
        self.chatgpt_token_limit = 5000 #get_token_limit(chatgpt_model)

    def run(self, prompt:str, text:str, temperature:float, top_p:float, frequency_penalty:float, presence_penalty:float, maxTokens:int): 
        fullPrompt = prompt + "\n\n# Start of Report\n" + text + "\n# End of Report"
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