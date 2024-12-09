# from django.urls import path
# from .views import TranslateBraille

# urlpatterns = [
#     path('translate/', TranslateBraille.as_view(), name='translate_braille'),
# ]


from django.urls import path, include
from .views import translate_to_braille
from . import views

urlpatterns = [
    path("translate/", translate_to_braille, name="translate_to_braille"),
]
