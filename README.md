# AI Learning Assistant

This is a small project I built to explore how AI can help in learning.
The idea is simple: instead of just reading notes, you can **ask questions and generate quizzes instantly**.

I made this during practice / hackathon preparation to understand how frontend + backend + AI APIs work together.

---

## What it can do

* Chat with an AI tutor
* Generate quizzes on topics like "loops", "arrays", etc.
* Quick responses (no heavy UI, kept it simple)

---

## Tech used

Frontend:

* React (Vite)
* Axios

Backend:

* Node.js
* Express

AI:

* OpenAI API

---

## Folder structure

ai_learning_assistant/

* backend/ → API + AI logic
* frontend/ → UI (React)

---

## How to run this project

### 1. Clone

git clone https://github.com/gauravyadav73670-dot/ai-learning-assistant.git
cd ai-learning-assistant

---

### 2. Backend

cd backend
npm install

Create a `.env` file and add:

OPENAI_API_KEY=your_api_key_here

Then run:

npm run dev

---

### 3. Frontend

cd frontend
npm install
npm run dev

---

## API routes

* `/api/chat` → normal AI chat
* `/api/quiz/generate-quiz` → quiz generation

---

## Why I made this

I wanted to build something practical using AI, not just theory.
Also tried to understand:

* API handling
* frontend-backend connection
* real-time responses

---

## Problems I faced 

* API not responding at first
* Wrong routes (spent time debugging)
* GitHub push blocked because of `.env` (learned about security the hard way)

---

## Future improvements

* Better UI (current one is basic)
* Add login system
* Save user progress
* Voice feature maybe

---

## Author

Gaurav yadav
