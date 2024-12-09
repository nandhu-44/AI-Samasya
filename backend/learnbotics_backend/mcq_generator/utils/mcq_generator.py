import google.generativeai as genai
import json
import re

# Configure the API key
genai.configure(api_key="AIzaSyD5jvGlcPH8II0FNrB7mTQWxfxVw-H9aV4")

class MCQGenerator:
    def __init__(self):
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

        answer_key = []

        for i, q in enumerate(questions_data, 1):
            print(f"\n### Question {i}")
            print(q['question'])
            
            for j, option in enumerate(q['options']):
                print(f"{chr(65+j)}. {option}")
            
            answer_key.append({
                "question_number": i,
                "correct_answer_option": q['correct_answer']
            })

        return answer_key

    def extract_json_from_text(self, text):
        text = text.replace('```json', '').replace('```', '').strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            json_match = re.search(r'\[.*\]', text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group(0))
                except json.JSONDecodeError:
                    pass
        return None

    def save_answers(self, chapter_name, answer_key):
        safe_filename = ''.join(c if c.isalnum() or c in [' ', '_'] else '_' for c in chapter_name)
        safe_filename = safe_filename.replace(' ', '_').lower()
        
        answers_filename = f"{safe_filename}_answers.json"
        with open(answers_filename, 'w', encoding='utf-8') as f:
            json.dump(answer_key, f, indent=2)
        
        print(f"\nAnswers saved to {answers_filename}")

def main():
    generator = MCQGenerator()
    chapter_name = input("Enter the chapter name: ")
    answer_key = generator.generate_mcq_for_chapter(chapter_name)
    generator.save_answers(chapter_name, answer_key)

if __name__ == "__main__":
    main()