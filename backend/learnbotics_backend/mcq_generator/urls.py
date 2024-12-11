from django.urls import path
from .views import generate_mcq_view

urlpatterns = [
    path('generatemcq/',generate_mcq_view, name='generate_mcq'),
]
