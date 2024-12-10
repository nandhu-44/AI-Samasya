from django.urls import path
from . import views

urlpatterns = [
    path('process_hand_sign/', views.process_hand_sign, name='process_hand_sign'),
]
