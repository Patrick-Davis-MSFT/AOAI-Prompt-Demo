from typing import Any, Sequence
import os
import openai
import tiktoken
from azure.search.documents import SearchClient
from azure.search.documents.models import QueryType
from azure.search.documents.indexes import SearchIndexClient
from approaches.approach import Approach
from text import nonewlines

from core.messagebuilder import MessageBuilder
from core.modelhelper import get_token_limit

class docSearchApproach(Approach):


    def __init__(self, searchService:str, searchIndex: str,  sourcepage_field: str, content_field: str, sourcefile_field: str):
        self.searchService = searchService
        self.searchIndex = searchIndex
        self.sourcepage_field = sourcepage_field
        self.content_field = content_field
        self.sourcefile_field = sourcefile_field

    def run(self, searchTerm:str, searchSkill:str, azure_credential) -> Any:
        # Get the top 3 results from the index
        
        search_client = SearchClient(endpoint=f"https://{self.searchService}.search.windows.net/", index_name=self.searchIndex, credential=azure_credential)
        result = search_client.search(search_text=searchTerm, query_type=QueryType.full, query_language="en-us", top=3, include_total_count=True, search_mode="any")
        
        retVal = []
        print(str(result))
        # Get the results
        for res in result:
            retVal.append( 
                {
                "documentPage": res[self.sourcepage_field],
                "document": res[self.sourcefile_field],  
                "score": res["@search.score"],
                "searchTerm": searchTerm,
                "searchSkill": searchSkill
                })
        
        return retVal

        if len(result) > 0:
            top_result = result[0]
            # Get the top result's source page
            source_page = top_result[self.sourcepage_field]
            # Get the top result's content
            content = top_result[self.content_field]
            # Get the top result's source file
            source_file = top_result[self.sourcefile_field]
            # Get the top result's score
            score = top_result["@search.score"]
            # Return the top result's source page, content, source file, score
            return source_page, content, source_file, score
        else:
            return None, None, None, None, None, None