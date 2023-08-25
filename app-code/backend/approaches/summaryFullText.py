#Note: The openai-python library support for Azure OpenAI is in preview.
import os
import openai
import sys
from core.modelhelper import get_token_limit

class summaryFullText():
    def __init__(self,  chatgpt_deployment: str, chatgpt_model: str):
        
        self.chatgpt_deployment = chatgpt_deployment
        self.chatgpt_model = chatgpt_model
        self.chatgpt_token_limit = get_token_limit(chatgpt_model)

    def run(self, prompt:str, text:str): 
        fullPrompt = prompt + "\n\n# Start of Report\n" + text + "\n# End of Report"
        response = openai.Completion.create(
            deployment_id=self.chatgpt_deployment,
            model=self.chatgpt_model,
            max_tokens=self.chatgpt_token_limit,
            prompt=fullPrompt,
            temperature=0.3,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None)
        return response