import os
import PyPDF2
import nltk
from nltk.tokenize import sent_tokenize
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# Download necessary NLTK resources
nltk.download('punkt', quiet=True)

class PDFProcessor:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        self.model = SentenceTransformer(model_name)
        
    def extract_text(self, file_path):
        """Extract text from a PDF file."""
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        return text
    
    def tokenize_text(self, text):
        """Split text into sentences."""
        return sent_tokenize(text)
    
    def generate_embeddings(self, sentences):
        """Generate embeddings for sentences."""
        return self.model.encode(sentences, convert_to_numpy=True)
    
    def build_faiss_index(self, embeddings):
        """Build a FAISS index for efficient similarity search."""
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings)
        return index