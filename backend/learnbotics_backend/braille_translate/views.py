from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import YouTubeBrailleTranslator  # Adjust import if necessary

@csrf_exempt
def translate_to_braille(request):
    if request.method == 'GET':
        video_url = request.GET.get('url')
        if not video_url:
            return JsonResponse({"error": "No URL provided"}, status=400)
        
        translator = YouTubeBrailleTranslator()
        video_id = translator.extract_video_id(video_url)
        
        if not video_id:
            return JsonResponse({"error": "Invalid YouTube URL"}, status=400)
        
        # Translate transcript to Braille
        braille_text = translator.translate_transcript_to_braille(video_id)
        
        if not braille_text:
            return JsonResponse({"error": "Braille translation failed"}, status=500)

        # Ensure braille_text is a string and handle potential object
        if isinstance(braille_text, dict):
            braille_text = str(braille_text.get('text', '')) if 'text' in braille_text else str(braille_text)
        else:
            braille_text = str(braille_text)

        # Return JSON response instead of file download
        return JsonResponse({
            "translation": braille_text,
            "success": True
        })
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)
