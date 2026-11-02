# Nexus AI - Next-Gen Adaptive AI Tutor Studio

Where speed meets intelligence — a full-stack AI learning platform featuring structured milestone-based mastery, multi-format document curriculum deconstruction, checkpoint quizzes, and real-time contextual doubt solving.

---

## 🌟 Key Features

- 🧠 **Dynamic Tutor Studio (Knobs Control)**:
  - **Difficulty Levels**: Beginner, Intermediate, Advanced, Expert
  - **Learning Goals**: Deep Understanding, Interview Prep, Practical Projects, Master Internals
  - **Interaction Modes**: Socratic Dialogue, Learn by Doing, Explain First
  - **Languages**: Authentic Khatarnak Hinglish & Modern Technical English
  - **Pedagogical Pacing**: 1 to 10 sequential milestones with custom questions separation

- 📄 **Document Studio (Upload & Master)**:
  - Supports **PDF**, **PPTX**, **DOCX**, and **TXT** files.
  - Deconstructs uploaded documents into progressive learning milestones with bounded token excerpts for blazing-fast responses (<2s).

- 🎯 **Interactive Checkpoint Quizzes**:
  - Auto-generated conceptual MCQs at each milestone with instant feedback, answer explanations, and dynamic retry options.

- 💬 **Contextual Doubt Copilot**:
  - Slide-out assistant grounded directly in the active lesson context and uploaded source material.

- 📐 **Rich KaTeX & Markdown Rendering**:
  - Full LaTeX math notation ($inline$ & $$display$$), GFM tables, and syntax-highlighted code blocks with 1-click copy.

---

## 🏗️ Project Architecture

```
Nexus AI/
├── backend/
│   ├── config/          # Database (MongoDB) & Gemini AI configuration
│   ├── controllers/     # Auth, Chat, Message & Doubt controllers
│   ├── middlewares/     # JWT authentication middleware
│   ├── model/           # User, Chat, and Message Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── service/         # Gemini AI failover service & summarizer
│   ├── utils/           # Dynamic tutor prompt engine & document parser
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/  # ChatArea, DoubtSidebar, TutorKnobsModal, etc.
│   │   ├── context/     # Auth context & session management
│   │   ├── utils/       # Resilient lesson, quiz & markdown parser
│   │   ├── api.js       # Axios client & endpoints
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── package.json         # Root workspace scripts
```

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)
- [Google Gemini API Key](https://aistudio.google.com/)

### 2. Environment Setup
Create a `.env` file inside `backend/` using `backend/.env.example`:
```env
PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
DEFAULT_AI_MODEL=gemini-3.5-flash
```

### 3. Installation & Running

From the root project directory:

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

To run both:

```bash
# Start backend server (Port 3000)
npm run server

# Start frontend development server (Port 5173)
npm run client
```

---

## 🛡️ License
ISC License
