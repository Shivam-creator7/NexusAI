import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  topic: {
    type: String,
    default: "New Chat"
  },

  model: {
    type: String,
    required: true
  },

  summary: {
    type: String,
    default: ""
  },

  summaryUpdatedAt: {
    type: Date,
    default: null
  },

  summarizedTillMessageNumber: {
    type: Number,
    default: 0
  },


  messageCount: {
    type: Number,
    default: 0
  },

  // ================= AI TUTOR KNOBS & CONFIGURATION =================
  // Level: Kitne depth par padhna hai (beginner -> expert)
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "expert"],
    default: "intermediate",
  },

  // 1. Prior Knowledge knob: Starting from Zero, Know the Basics, Some Experience
  priorKnowledge: {
    type: String,
    enum: ["zero", "basics", "experienced"],
    default: "basics",
  },

  // 2. Learning Goal knob: Understand Concepts, Build Projects, Interview Prep, Master Internals
  learningGoal: {
    type: String,
    enum: ["understand_concepts", "build_projects", "interview_prep", "master_internals"],
    default: "understand_concepts",
  },

  // 3. Practice Intensity knob: Light, Balanced, Challenge Mode
  practiceIntensity: {
    type: String,
    enum: ["light", "balanced", "challenge_mode"],
    default: "balanced",
  },

  // 4. Interaction Mode knob: Explain First, Interactive Socratic, Learn by Doing
  interactionMode: {
    type: String,
    enum: ["explain_first", "socratic", "learn_by_doing"],
    default: "explain_first",
  },

  // 5. Time Budget knob: 15 Mins, 30 Mins, 60 Mins, No Limit
  timeBudget: {
    type: String,
    enum: ["15_mins", "30_mins", "60_mins", "no_limit"],
    default: "30_mins",
  },

  // 6. Language knob: Hinglish vs English
  language: {
    type: String,
    enum: ["hinglish", "english"],
    default: "hinglish",
  },

  // Kitne responses me pura topic finish karna hai (Milestones)
  targetSteps: {
    type: Number,
    min: 1,
    max: 10,
    default: 4,
  },

  // Checkpoint Quiz Questions per milestone (e.g., 1, 3, or 5 questions)
  questionsPerMilestone: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },

  // Current milestone step (e.g., Step 1 of 5)
  currentStep: {
    type: Number,
    default: 1,
  },

  // Custom questions count (tracked separately from milestone progression)
  customQuestionsCount: {
    type: Number,
    default: 0,
  },

  // Response length knob: concise, standard, ya exhaustive deep-dive
  responseLength: {
    type: String,
    enum: ["concise", "standard", "deep_dive"],
    default: "standard",
  },

  // Learning style knob: Practical coding, Concept first, ya Bug hunting
  learningStyle: {
    type: String,
    enum: ["hands_on", "conceptual", "debugging_gotchas"],
    default: "hands_on",
  },

  // Fact Verification knob: Strict Ground Truth (Always enabled, zero hallucinations)
  verifyFacts: {
    type: Boolean,
    default: true,
  },

  // ================= DOCUMENT-BASED LEARNING STUDIO =================
  // Supports interactive mastery of uploaded PDFs, PPTs, DOCs, TXT
  isDocumentSession: {
    type: Boolean,
    default: false,
  },

  documentInfo: {
    fileName: { type: String, default: "" },
    fileType: { type: String, default: "" }, // pdf, pptx, docx, txt, md
    fileSize: { type: Number, default: 0 },
    totalPages: { type: Number, default: 0 },
    documentSummary: { type: String, default: "" },
    documentContent: { type: String, default: "" }, // Cleaned text (bounded for high speed)
    milestonePlan: [
      {
        step: { type: Number },
        title: { type: String },
        focusTopics: [{ type: String }],
        sectionReference: { type: String },
      },
    ],
  },

  // ================= CONTEXTUAL DOUBT HISTORY =================
  // Har chat ka apna right-side doubt panel context store karega
  doubts: [
    {
      doubt: { type: String, required: true },
      answer: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  usage: {
    promptTokens: {
      type: Number,
      default: 0
    },

    completionTokens: {
      type: Number,
      default: 0
    },

    totalTokens: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

chatSchema.index({ userId: 1, updatedAt: -1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;