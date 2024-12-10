from django.urls import path
from .views import generate_mcq_view

urlpatterns = [
    path('generate-mcq/', generate_mcq_view, name='generate_mcq'),
]
