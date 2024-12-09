from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils.mcq_generator import MCQGenerator
import json

@csrf_exempt
def generate_mcq_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        chapter_name = data.get('chapter_name')
        
        if not chapter_name:
            return JsonResponse({'error': 'Chapter name is required'}, status=400)
        
        api_key = 'AIzaSyD5jvGlcPH8II0FNrB7mTQWxfxVw-H9aV4'  # Replace with your API key
        generator = MCQGenerator()
        
        try:
            answer_key = generator.generate_mcq_for_chapter(chapter_name)
            generator.save_answers(chapter_name, answer_key)
            return JsonResponse({'message': 'MCQs generated successfully', 'answer_key': answer_key})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)
