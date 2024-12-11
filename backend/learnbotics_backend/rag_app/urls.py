from django.urls import path
from .views import rag_query, upload_document, list_uploaded_documents, delete_document
from rest_framework_simplejwt.views import TokenRefreshView
from . import views 

from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    UserProfileView
)

urlpatterns = [
    #rag endpoints
    path('rag_query/', rag_query, name='rag_query'),
    path('upload-document/', upload_document, name='upload_document'),
    path('list-documents/', list_uploaded_documents, name='list_documents'),
    path('delete-document/<int:document_id>/', delete_document, name='delete_document'),

    # Authentication endpoints
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('refresh-token/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile endpoint
    path('profile/', UserProfileView.as_view(), name='profile'),


]
    

