import json
import re
import google.generativeai as genai
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

class MCQGenerator:
    def __init__(self):
        # Note: In production, use environment variables for API keys
        genai.configure(api_key="AIzaSyD5jvGlcPH8II0FNrB7mTQWxfxVw-H9aV4")
        self.model = genai.GenerativeModel("gemini-1.5-flash")
    
    def generate_mcq_for_chapter(self, chapter_name):
        prompt = f"""Generate 10 multiple-choice questions (2 questions each from 5 important topics) 
        for the chapter: {chapter_name}. 
        Strictly follow this JSON format:
        [
            {{
                "question": "Question text",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "A or B or C or D"
            }},
            ...
        ]
        Ensure:
        - Questions cover different aspects of {chapter_name}
        - Options are plausible
        - Correct answer is clearly marked
        """
        response = self.model.generate_content(prompt)
        
        questions_data = self.extract_json_from_text(response.text)
        
        if not questions_data:
            raise ValueError(f"Could not parse questions. Response: {response.text}")
        
        # Transform the questions to include full details
        full_mcqs = []
        for i, q in enumerate(questions_data, 1):
            full_mcq = {
                "question_number": i,
                "question": q['question'],
                "options": q['options'],
                "correct_answer_option": q['correct_answer']
            }
            full_mcqs.append(full_mcq)
        
        return full_mcqs

    def extract_json_from_text(self, text):
        # Clean the text and attempt to extract JSON
        text = text.replace('json', '').replace('', '').strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try to find JSON-like structure using regex
            json_match = re.search(r'\[.*\]', text, re.DOTALL | re.MULTILINE | re.UNICODE)
            if json_match:
                try:
                    return json.loads(json_match.group(0))
                except json.JSONDecodeError:
                    pass
        return None

    def save_answers(self, chapter_name, answer_key):
        # Optional method to save answers locally
        safe_filename = ''.join(c if c.isalnum() or c in [' ', ''] else '' for c in chapter_name)
        safe_filename = safe_filename.replace(' ', '_').lower()
        
        answers_filename = f"{safe_filename}_answers.json"
        with open(answers_filename, 'w', encoding='utf-8') as f:
            json.dump(answer_key, f, indent=2)
        
        print(f"\nAnswers saved to {answers_filename}")

@csrf_exempt
def generate_mcq_view(request):
    if request.method == 'POST':
        try:
            # Parse the incoming JSON data
            data = json.loads(request.body)
            chapter_name = data.get('chapter_name')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        
        # Validate chapter name
        if not chapter_name:
            return JsonResponse({'error': 'Chapter name is required'}, status=400)
        
        # Create MCQ Generator instance
        generator = MCQGenerator()
        
        try:
            # Generate MCQs
            mcqs = generator.generate_mcq_for_chapter(chapter_name)
            
            # Optionally save answers
            generator.save_answers(chapter_name, mcqs)
            
            # Return full MCQ details
            return JsonResponse({
                'message': 'MCQs generated successfully', 
                'answer_key': mcqs
            })
        except Exception as e:
            # Log the full error for debugging
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)

