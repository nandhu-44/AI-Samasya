# SAHAAYI  
**Enhancing Personalized Learning Experiences**  

SAHAAYI is an innovative platform designed to provide personalized learning experiences for differently-abled individuals. By integrating advanced AI/ML models and accessibility-focused features, it ensures inclusivity and adaptability for all users.  

## Key Features  

### 1. Braille Conversion  
- Converts text to Braille using Unicode mapping.  
- Fetches video transcripts from YouTube using YouTubeTranscriptAPI.  
- Outputs original and Braille transcripts.  

**Workflow:**  
1. Accepts YouTube video URL.  
2. Extracts video ID and retrieves transcript.  
3. Converts transcript to Braille for accessibility.  

---

### 2. Hand Gesture Detection and Recognition  
- Real-time hand tracking and gesture recognition using Mediapipe.  
- Supports accurate detection of finger positions for sign classification.  
- Aids communication through hand-sign tutorials.  

**Dependencies:**  
- OpenCV for image processing.  
- Mediapipe for hand tracking.  

---

### 3. MCQ Generation  
- Generates high-quality, topic-specific MCQs using Gemini AI.  
- Provides real-time feedback and score tracking.  
- Features hover-to-speak functionality for enhanced accessibility.  

**Workflow:**  
1. User inputs a topic.  
2. System generates structured MCQs.  
3. Displays questions in an interactive quiz interface.  

---

### 4. Retrieval-Augmented Generation (RAG)  
- Uses semantic search to retrieve relevant knowledge.  
- Synthesizes coherent responses with Google Gemini AI.  
- Combines dense embeddings (SentenceTransformer) and FAISS for efficient retrieval.  

---

## Tech Stack  

### Frontend  
- **React** with **NextJS**  
- **TailwindCSS** for design  
- **ShadCN** components  

### Backend  
- **Python**, **Django**, and **Django Rest Framework**  

### AI/ML  
- **Transformers model** (all-MiniLM-L6-v2)  
- **FAISS** for similarity search  
- **Gemini LLM 1.5 Flash**  

---

## Installation  

1. Clone the repository:  
   ```bash
   git clone https://github.com/your-repo/SAHAAYI.git
   ```
2. Install dependencies:
   ```bash
   npm install  # For frontend  
   pip install -r requirements.txt  # For backend
   ```

3. Set up the environment variables as required.
4. Start the development servers:
   ```bash
   npm run dev  # Frontend  
   python manage.py runserver  # Backend
   ```



