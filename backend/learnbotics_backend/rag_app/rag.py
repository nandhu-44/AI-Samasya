import google.generativeai as genai
import numpy as np
from typing import List, Optional

from .utils import PDFProcessor

class RAGSystem:
    def __init__(self, 
                 pdf_path: str, 
                 api_key: Optional[str] = None, 
                 model_name: str = "gemini-1.5-flash"):
        """
        Initialize RAG system with PDF and Gemini
        
        Args:
            pdf_path (str): Path to the PDF file
            api_key (str, optional): Google AI API Key
            model_name (str, optional): Gemini model to use
        """
        # Configure Gemini
        if api_key:
            genai.configure(api_key=api_key)
        
        # Initialize Gemini model
        self.model = genai.GenerativeModel(model_name)
        
        # Process PDF
        self.pdf_processor = PDFProcessor()
        self.text = self.pdf_processor.extract_text(pdf_path)
        self.sentences = self.pdf_processor.tokenize_text(self.text)
        
        # Generate embeddings and build index
        self.embeddings = self.pdf_processor.generate_embeddings(self.sentences)
        self.faiss_index = self.pdf_processor.build_faiss_index(self.embeddings)
    
    def retrieve_context(self, query: str, top_k: int = 3) -> List[str]:
        """
        Retrieve most relevant sentences for a query
        
        Args:
            query (str): User's query
            top_k (int): Number of top contexts to retrieve
        
        Returns:
            List of most relevant sentences
        """
        query_embedding = self.pdf_processor.generate_embeddings([query])
        distances, indices = self.faiss_index.search(query_embedding, top_k)
        
        return [self.sentences[i] for i in indices[0]]
    
    def generate_response(self, query: str, context: Optional[List[str]] = None) -> str:
        """
        Generate response using Gemini with optional context
        
        Args:
            query (str): User's query
            context (List[str], optional): Retrieved context sentences
        
        Returns:
            Generated response from Gemini
        """
        # If no context provided, retrieve it
        if context is None:
            context = self.retrieve_context(query)
        
        # Combine context and query
        augmented_prompt = f"""
        Context: {' '.join(context)}
        
        Query: {query}
        
        Based on the context, provide a comprehensive and precise answer to the query.
        """
        
        try:
            for chunk in self.model.generate_content_stream(augmented_prompt):
                yield chunk.text  # Assuming each chunk has a `text` property
        except Exception as e:
            yield f"Error generating response: {str(e)}"