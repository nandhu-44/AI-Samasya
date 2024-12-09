import json
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .rag import RAGSystem

# Configure your Google AI API Key here
GOOGLE_AI_API_KEY = 'AIzaSyD5jvGlcPH8II0FNrB7mTQWxfxVw-H9aV4'

@csrf_exempt
def rag_query(request):
    """
    Handle RAG query requests
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            query = data.get("query")
            
            # Path to your PDF
            pdf_path = os.path.join(os.path.dirname(__file__), 'AAC.pdf')
            
            # Validate PDF existence
            if not os.path.exists(pdf_path):
                return JsonResponse({"error": f"File not found: {pdf_path}"}, status=404)
            
            # Initialize RAG System
            rag_system = RAGSystem(
                pdf_path=pdf_path, 
                api_key=GOOGLE_AI_API_KEY
            )
            
            # Generate response
            response = rag_system.generate_response(query)
            
            return JsonResponse({"response": response})
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Invalid request method"}, status=405)