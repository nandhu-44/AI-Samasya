# from django.http import JsonResponse, HttpResponse
# from django.views.decorators.csrf import csrf_exempt
# from .utils import YouTubeBrailleTranslator  # Adjust import if necessary

# @csrf_exempt
# def translate_to_braille(request):
#     if request.method == 'GET':
#         video_url = request.GET.get('url')
#         if not video_url:
#             return JsonResponse({"error": "No URL provided"}, status=400)
        
#         translator = YouTubeBrailleTranslator()
#         video_id = translator.extract_video_id(video_url)
        
#         if not video_id:
#             return JsonResponse({"error": "Invalid YouTube URL"}, status=400)
        
#     #     result = translator.translate_transcript_to_braille(video_id)
#     #     return JsonResponse(result)
#     # else:
#     #     return JsonResponse({"error": "Invalid request method"}, status=405)

#         braille_text = translator.translate_transcript_to_braille(video_id)

#         # Generate .brf file
#         file_name = "braille_output.brf"
#         response = HttpResponse(braille_text, content_type="text/plain")
#         response["Content-Disposition"] = f"attachment; filename={file_name}"
#         return response
#     else:
#         return JsonResponse({"error": "Invalid request method"}, status=405)


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

        # Debugging: Print or log the Braille text
        print("Braille Text:", braille_text)
        
        if not braille_text:
            return JsonResponse({"error": "Braille translation failed"}, status=500)

        # Generate .brf file for download
        file_name = "braille_output.brf"
        response = HttpResponse(braille_text, content_type="text/plain")
        response["Content-Disposition"] = f"attachment; filename={file_name}"
        return response
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)
