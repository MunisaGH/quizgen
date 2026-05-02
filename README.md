# AI Quiz Generator

A full-stack application that transforms PDF or Word documents into interactive multiple-choice quizzes using AI.

## Features
- **Authentication**: Secure Google Login using Firebase.
- **File Parsing**: Upload `.pdf` or `.docx` files (up to 10MB) to extract text.
- **AI Generation**: Uses Google's Gemini 3.1 Pro via backend Express API to generate a structured strict JSON quiz.
- **Interactive Quiz**: Progressive quiz interface to take the generated generated tests.
- **Results & History**: Automatic grading and secure history tracking on Firestore.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend/API**: Express + Node.js
- **Database / Auth**: Firebase (Auth & Firestore)
- **AI**: `@google/genai` (Gemini API)
- **Parsing**: `pdf-parse`, `mammoth`

## Run Instructions

This project is built to run entirely inside Google AI Studio's environment or any Node.js environment.

### 1. Environment Variables
Ensure you have the following environment variables. The `GEMINI_API_KEY` is required. If running locally, create a `.env` file based on `.env.example`.

### 2. Install Dependencies
```bash
npm install
```

### 3. Development
Run the combined Vite + Express dev server:
```bash
npm run dev
```

### 4. Build & Production
To build the React frontend and ES Modules backend:
```bash
npm run build
```

Then start the production server:
```bash
npm run start
```
