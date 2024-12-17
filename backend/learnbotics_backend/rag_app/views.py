import os
import json
import magic
from dotenv import load_dotenv

from django.conf import settings
from django.contrib.auth import logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import DocumentUpload
from .rag import RAGSystem
from .serializers import UserRegistrationSerializer, UserProfileSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rag_app.models import DocumentUpload

# Load environment variables
load_dotenv('/Users/nabeelnazeer/Desktop/ai-samasya/AI-Samasya/backend/.env')

# Configure your Google AI API Key here
GOOGLE_AI_API_KEY = os.getenv('GOOGLE_AI_API_KEY')

@csrf_exempt
def rag_query(request):
    """
    Handle RAG query requests
    """
    if request.method == "POST":
        try:
            # Parse the incoming JSON request
            data = json.loads(request.body)
            query = data.get("query")
            
            if not query:
                return JsonResponse({"error": "Query is missing"}, status=400)
            
            # Retrieve the most recent processed document
            latest_document = DocumentUpload.objects.filter(is_processed=True).order_by('-id').first()
            
            if not latest_document:
                return JsonResponse({"error": "No processed document found"}, status=404)
            
            pdf_path = latest_document.file.path
            
            # Validate that the PDF file exists
            if not os.path.exists(pdf_path):
                return JsonResponse({"error": f"File not found: {pdf_path}"}, status=404)
            
            # Initialize RAG System with the uploaded PDF
            rag_system = RAGSystem(
                pdf_path=pdf_path, 
                api_key=GOOGLE_AI_API_KEY  # Replace with your actual API key variable
            )
            
            # Generate response to the user's query
            response = rag_system.generate_response(query)
            
            return JsonResponse({"response": response})
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Invalid request method"}, status=405)




@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_document(request):
    """
    Handle document upload
    """
    if request.method == 'POST':
        try:
            # Get uploaded file
            uploaded_file = request.FILES.get('file')
            if not uploaded_file:
                return JsonResponse({
                    'success': False, 
                    'message': 'No file uploaded'
                }, status=400)
            
            # Validate file type
            file_type = magic.from_buffer(uploaded_file.read(2048), mime=True)
            uploaded_file.seek(0)  # Reset file pointer
            
            # Allowed file types
            allowed_types = [
                'application/pdf', 
                'text/plain', 
                'application/docx', 
                'application/doc'
            ]
            
            if file_type not in allowed_types:
                return JsonResponse({
                    'success': False, 
                    'message': 'Unsupported file type'
                }, status=400)
            
            # Save file
            fs = FileSystemStorage(
                location=os.path.join(settings.MEDIA_ROOT, 'uploaded_documents')
            )
            filename = fs.save(uploaded_file.name, uploaded_file)
            file_path = fs.path(filename)
            
            # Create database record
            doc_upload = DocumentUpload.objects.create(
                user=request.user,
                file=file_path,
                filename=uploaded_file.name,
                file_type=file_type,
                is_processed=False
            )
            
            # Process document (optional background task)
            try:
                rag_system = RAGSystem(pdf_path=file_path)
                # Optional: You could store processed embeddings or other metadata
                doc_upload.is_processed = True
                doc_upload.save()
            except Exception as processing_error:
                return JsonResponse({
                    'success': False, 
                    'message': f'Error processing document: {str(processing_error)}'
                }, status=500)
            
            return JsonResponse({
                'success': True, 
                'message': 'File uploaded successfully',
                'filename': filename
            })
        
        except Exception as e:
            return JsonResponse({
                'success': False, 
                'message': f'Upload failed: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False, 
        'message': 'Invalid request method'
    }, status=405)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_uploaded_documents(request):
    """
    Retrieve list of uploaded documents for the current user
    """
    documents = DocumentUpload.objects.filter(user=request.user)
    document_list = [
        {
            'id': doc.id,
            'filename': doc.filename,
            'uploaded_at': doc.uploaded_at.isoformat(),
            'file_type': doc.file_type,
            'is_processed': doc.is_processed
        } for doc in documents
    ]
    
    return JsonResponse({
        'success': True, 
        'documents': document_list
    })

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_document(request, document_id):
    """
    Delete a specific uploaded document
    """
    try:
        document = DocumentUpload.objects.get(
            id=document_id, 
            user=request.user
        )
        
        # Remove file from storage
        if os.path.exists(document.file.path):
            os.remove(document.file.path)
        
        # Delete database record
        document.delete()
        
        return JsonResponse({
            'success': True, 
            'message': 'Document deleted successfully'
        })
    
    except DocumentUpload.DoesNotExist:
        return JsonResponse({
            'success': False, 
            'message': 'Document not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False, 
            'message': f'Error deleting document: {str(e)}'
        }, status=500)
    
class UserRegistrationView(APIView):
    """
    Handle user registration
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserProfileSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(TokenObtainPairView):
    """
    Handle user login with JWT
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        # Add user profile to response
        user = User.objects.get(username=request.data['username'])
        response.data['user'] = UserProfileSerializer(user).data
        
        return response

class UserLogoutView(APIView):
    """
    Handle user logout
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Blacklist refresh token
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            # Django logout
            logout(request)
            
            return Response({
                'message': 'Successfully logged out.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Invalid token or logout failed'
            }, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    """
    Retrieve and update user profile
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get current user profile
        """
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        """
        Update user profile
        """
        serializer = UserProfileSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@csrf_exempt
def generate_mcq_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            chapter_name = data.get('chapter_name')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        
        if not chapter_name:
            return JsonResponse({'error': 'Chapter name is required'}, status=400)
        
        generator = MCQGenerator()
        
        try:
            answer_key = generator.generate_mcq_for_chapter(chapter_name)
            generator.save_answers(chapter_name, answer_key)
            return JsonResponse({'message': 'MCQs generated successfully', 'answer_key': answer_key})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)
