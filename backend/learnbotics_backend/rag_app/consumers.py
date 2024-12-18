import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .rag import RAGSystem
import asyncio
from channels.db import database_sync_to_async
import os
from .models import DocumentUpload

class RAGConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        
    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        query = data.get('query')
        pdf_name = data.get('pdf_path')

        # Validate input
        if not query or not pdf_name:
            await self.send(json.dumps({
                'type': 'error',
                'message': 'Missing query or pdf_path'
            }))
            await self.close()
            return

        try:
            # Retrieve the processed document based on the file name
            document = await database_sync_to_async(DocumentUpload.objects.get)(
                filename=pdf_name, is_processed=True
            )
            pdf_path = document.file.path

            # Initialize RAGSystem with the uploaded PDF
            rag_system = RAGSystem(
                pdf_path=pdf_path,
                api_key=os.getenv('GOOGLE_AI_API_KEY')
            )

            # Generate and stream the response
            async for chunk in rag_system.generate_response_stream(query):
                await self.send(json.dumps({
                    'type': 'stream',
                    'message': chunk,
                    'is_complete': False
                }))

            # Indicate completion
            await self.send(json.dumps({
                'type': 'stream',
                'message': '',
                'is_complete': True
            }))

        except Exception as e:
            await self.send(json.dumps({
                'type': 'error',
                'message': str(e)
            }))
            await self.close()

async def process_rag_query(query, pdf_path):
    # ...perform RAG processing...
    # Simulate streaming response
    lines = ["First line of response.", "Second line of response.", "Third line of response."]
    for line in lines:
        yield line
        await asyncio.sleep(0.1)  # Simulate delay