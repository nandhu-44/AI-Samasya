from django.urls import path
from . import views

urlpatterns = [
    path('generate-mcq/', views.generate_mcq_view, name='generate_mcq'),
]
