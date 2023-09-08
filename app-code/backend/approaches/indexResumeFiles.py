import os
import openai
import sys
from core.modelhelper import get_token_limit

class textCompare():
    def __init__(self,  stagingContainer: str, indexContainer: str, formAnalyzer: str,formAnalyzerKey: str, cognitiveSearch: str, cognitiveSearchIndex: str, embDeployment: str, aoaiService: str):
        self.stagingContainer = stagingContainer
        self.indexContainer = indexContainer
        self.formAnalyzer = formAnalyzer
        self.formAnalyzerKey = formAnalyzerKey
        self.cognitiveSearch = cognitiveSearch
        self.cognitiveSearchIndex = cognitiveSearchIndex
        self.embDeployment = embDeployment
        self.aoaiService = aoaiService
        self.chatgpt_token_limit = 5000 #get_token_limit(chatgpt_model)
        
    def run(self, openAIAuth, azure_creds): 
        print("indexResumeFiles")