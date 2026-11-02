import Chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";
import mongoose from "mongoose";
import { extractTextFromBuffer, generateDocumentCurriculum } from "../utils/documentParser.js";
import { buildGeminiContext } from "../utils/chatContext.js";
import { generateAIResponse } from "../service/geminiService.js";
import { addUserTokenUsage } from "../utils/userUsage.js";
import { addChatTokenUsage } from "../utils/tokenUsage.js";

// ==========================================
// CHAT & AI TUTOR CONTROLLER
// Handles Learning Sessions, Knobs & History
// ==========================================

// Allowed Enum values for validation and fallback
const VALID_LEVELS = ["beginner", "intermediate", "advanced", "expert"];
const VALID_PRIOR_KNOWLEDGE = ["zero", "basics", "experienced"];
const VALID_LEARNING_GOALS = ["understand_concepts", "build_projects", "interview_prep", "master_internals"];
const VALID_INTENSITIES = ["light", "balanced", "challenge_mode"];
const VALID_INTERACTION_MODES = ["explain_first", "socratic", "learn_by_doing"];
const VALID_TIME_BUDGETS = ["15_mins", "30_mins", "60_mins", "no_limit"];
const VALID_LANGUAGES = ["hinglish", "english"];
const VALID_RESPONSE_LENGTHS = ["concise", "standard", "deep_dive"];
const VALID_LEARNING_STYLES = ["hands_on", "conceptual", "debugging_gotchas"];

// 1. Get recent chats / learning sessions (Last 20)
export const getRecentChat = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .select("topic level priorKnowledge learningGoal practiceIntensity interactionMode timeBudget language targetSteps currentStep customQuestionsCount questionsPerMilestone isDocumentSession documentInfo.fileName documentInfo.fileType documentInfo.totalPages updatedAt")
      .sort({ updatedAt: -1 })
      .limit(20);

    res.status(200).json({
      message: "Your all recent chats",
      chats,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// 2. Get single chat details with all tutor knobs & doubts
export const getSingleChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        message: "Invalid chat id",
        messages: "Invalid chat id",
      });
    }

    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });

    if (!chat) {
      return res.status(404).json({
        message: "Sorry no data found",
        messages: "Sorry no data found",
      });
    }

    res.status(200).json({
      chatId: chat._id,
      userId: chat.userId,
      topic: chat.topic,
      model: chat.model,
      level: chat.level,
      priorKnowledge: chat.priorKnowledge || "basics",
      learningGoal: chat.learningGoal || "understand_concepts",
      practiceIntensity: chat.practiceIntensity || "balanced",
      interactionMode: chat.interactionMode || "explain_first",
      timeBudget: chat.timeBudget || "30_mins",
      language: chat.language || "hinglish",
      targetSteps: chat.targetSteps,
      currentStep: chat.currentStep,
      customQuestionsCount: chat.customQuestionsCount || 0,
      questionsPerMilestone: chat.questionsPerMilestone || 3,
      responseLength: chat.responseLength,
      learningStyle: chat.learningStyle,
      verifyFacts: true, // Strict Ground Truth always enforced
      isDocumentSession: chat.isDocumentSession || false,
      documentInfo: chat.documentInfo ? {
        fileName: chat.documentInfo.fileName,
        fileType: chat.documentInfo.fileType,
        fileSize: chat.documentInfo.fileSize,
        totalPages: chat.documentInfo.totalPages,
        documentSummary: chat.documentInfo.documentSummary,
        milestonePlan: chat.documentInfo.milestonePlan || [],
      } : null,
      doubts: chat.doubts || [],
      usage: chat.usage,
      createdAt: chat.createdAt,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// 3. Create a new learning session with custom knobs
export const createChat = async (req, res) => {
  try {
    const {
      topic = "New Learning Session",
      model = "gemini-3.5-flash",
      level = "intermediate",
      priorKnowledge = "basics",
      learningGoal = "understand_concepts",
      practiceIntensity = "balanced",
      interactionMode = "explain_first",
      timeBudget = "30_mins",
      language = "hinglish",
      targetSteps = 4,
      questionsPerMilestone = 3,
      responseLength = "standard",
      learningStyle = "hands_on",
    } = req.body;

    // Sanitize and validate inputs with safe fallbacks
    const safeLevel = VALID_LEVELS.includes(level) ? level : "intermediate";
    const safePrior = VALID_PRIOR_KNOWLEDGE.includes(priorKnowledge) ? priorKnowledge : "basics";
    const safeGoal = VALID_LEARNING_GOALS.includes(learningGoal) ? learningGoal : "understand_concepts";
    const safeIntensity = VALID_INTENSITIES.includes(practiceIntensity) ? practiceIntensity : "balanced";
    const safeMode = VALID_INTERACTION_MODES.includes(interactionMode) ? interactionMode : "explain_first";
    const safeBudget = VALID_TIME_BUDGETS.includes(timeBudget) ? timeBudget : "30_mins";
    const safeLang = VALID_LANGUAGES.includes(language) ? language : "hinglish";
    const safeLength = VALID_RESPONSE_LENGTHS.includes(responseLength) ? responseLength : "standard";
    const safeStyle = VALID_LEARNING_STYLES.includes(learningStyle) ? learningStyle : "hands_on";

    // AI Tutor session create kiya knobs ke sath
    const newChat = await Chat.create({
      userId: req.user._id,
      topic: topic.trim().slice(0, 80) || "New Learning Session",
      model,
      level: safeLevel,
      priorKnowledge: safePrior,
      learningGoal: safeGoal,
      practiceIntensity: safeIntensity,
      interactionMode: safeMode,
      timeBudget: safeBudget,
      language: safeLang,
      targetSteps: Math.min(10, Math.max(1, Number(targetSteps) || 4)),
      questionsPerMilestone: Math.min(5, Math.max(1, Number(questionsPerMilestone) || 3)),
      currentStep: 1,
      responseLength: safeLength,
      learningStyle: safeStyle,
      verifyFacts: true, // Ground truth correctness is non-negotiable
    });

    res.status(201).json({
      message: "Learning session created successfully",
      chatId: newChat._id,
      userId: req.user._id,
      topic: newChat.topic,
      model: newChat.model,
      level: newChat.level,
      priorKnowledge: newChat.priorKnowledge,
      learningGoal: newChat.learningGoal,
      practiceIntensity: newChat.practiceIntensity,
      interactionMode: newChat.interactionMode,
      timeBudget: newChat.timeBudget,
      language: newChat.language,
      targetSteps: newChat.targetSteps,
      currentStep: newChat.currentStep,
      customQuestionsCount: 0,
      questionsPerMilestone: newChat.questionsPerMilestone,
      responseLength: newChat.responseLength,
      learningStyle: newChat.learningStyle,
      verifyFacts: true,
      createdAt: newChat.createdAt,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// 4. Update tutor knobs mid-session (e.g. user wants to change goal, level or pacing)
export const updateChatKnobs = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat id" });
    }

    const {
      level,
      priorKnowledge,
      learningGoal,
      practiceIntensity,
      interactionMode,
      timeBudget,
      language,
      targetSteps,
      questionsPerMilestone,
      responseLength,
      learningStyle,
    } = req.body;

    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (level && VALID_LEVELS.includes(level)) chat.level = level;
    if (priorKnowledge && VALID_PRIOR_KNOWLEDGE.includes(priorKnowledge)) chat.priorKnowledge = priorKnowledge;
    if (learningGoal && VALID_LEARNING_GOALS.includes(learningGoal)) chat.learningGoal = learningGoal;
    if (practiceIntensity && VALID_INTENSITIES.includes(practiceIntensity)) chat.practiceIntensity = practiceIntensity;
    if (interactionMode && VALID_INTERACTION_MODES.includes(interactionMode)) chat.interactionMode = interactionMode;
    if (timeBudget && VALID_TIME_BUDGETS.includes(timeBudget)) chat.timeBudget = timeBudget;
    if (language && VALID_LANGUAGES.includes(language)) chat.language = language;
    if (targetSteps) chat.targetSteps = Math.min(10, Math.max(1, Number(targetSteps)));
    if (questionsPerMilestone) chat.questionsPerMilestone = Math.min(5, Math.max(1, Number(questionsPerMilestone)));
    if (responseLength && VALID_RESPONSE_LENGTHS.includes(responseLength)) chat.responseLength = responseLength;
    if (learningStyle && VALID_LEARNING_STYLES.includes(learningStyle)) chat.learningStyle = learningStyle;
    chat.verifyFacts = true; // Strict ground truth always enforced

    await chat.save();

    res.status(200).json({
      message: "Tutor knobs updated successfully",
      chat: {
        chatId: chat._id,
        level: chat.level,
        priorKnowledge: chat.priorKnowledge,
        learningGoal: chat.learningGoal,
        practiceIntensity: chat.practiceIntensity,
        interactionMode: chat.interactionMode,
        timeBudget: chat.timeBudget,
        language: chat.language,
        targetSteps: chat.targetSteps,
        currentStep: chat.currentStep,
        customQuestionsCount: chat.customQuestionsCount || 0,
        questionsPerMilestone: chat.questionsPerMilestone || 3,
        responseLength: chat.responseLength,
        learningStyle: chat.learningStyle,
        verifyFacts: true,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 5. Delete Chat and all related messages
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat id" });
    }

    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });

    if (!chat) {
      return res.status(403).json({
        message: "You are not allowed to do this",
      });
    }

    await Message.deleteMany({
      chatId: chat._id,
    });

    await Chat.deleteOne({
      _id: chatId,
    });

    res.status(200).json({
      message: "Your chat deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// 6. Create Document Learning Session (Upload PDF, PPTX, DOCX, TXT)
export const createDocumentChat = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a document file (PDF, PPTX, DOCX, or TXT)." });
    }

    const {
      topic,
      level = "intermediate",
      priorKnowledge = "basics",
      learningGoal = "understand_concepts",
      practiceIntensity = "balanced",
      interactionMode = "explain_first",
      timeBudget = "30_mins",
      language = "hinglish",
      targetSteps = 4,
      questionsPerMilestone = 3,
      responseLength = "standard",
      learningStyle = "hands_on",
    } = req.body;

    // 1. Extract text and page count from in-memory buffer
    const { text, totalPages, fileType } = await extractTextFromBuffer(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    if (!text || text.length < 20) {
      return res.status(400).json({
        message: "Could not extract readable text from document. Please ensure it contains readable text.",
      });
    }

    // 2. Validate Knobs with safe fallbacks
    const safeLevel = VALID_LEVELS.includes(level) ? level : "intermediate";
    const safePrior = VALID_PRIOR_KNOWLEDGE.includes(priorKnowledge) ? priorKnowledge : "basics";
    const safeGoal = VALID_LEARNING_GOALS.includes(learningGoal) ? learningGoal : "understand_concepts";
    const safeIntensity = VALID_INTENSITIES.includes(practiceIntensity) ? practiceIntensity : "balanced";
    const safeMode = VALID_INTERACTION_MODES.includes(interactionMode) ? interactionMode : "explain_first";
    const safeBudget = VALID_TIME_BUDGETS.includes(timeBudget) ? timeBudget : "30_mins";
    const safeLang = VALID_LANGUAGES.includes(language) ? language : "hinglish";
    const safeLength = VALID_RESPONSE_LENGTHS.includes(responseLength) ? responseLength : "standard";
    const safeStyle = VALID_LEARNING_STYLES.includes(learningStyle) ? learningStyle : "hands_on";
    const safeTargetSteps = Math.min(10, Math.max(1, Number(targetSteps) || 4));
    const safeQuestionsCount = Math.min(5, Math.max(1, Number(questionsPerMilestone) || 3));

    // 3. Fast Milestone Roadmap Generation (<1.5s)
    const { detectedTopic, documentSummary, milestonePlan } = await generateDocumentCurriculum({
      documentText: text,
      fileName: req.file.originalname,
      targetSteps: safeTargetSteps,
    });

    const finalTopic = (topic && topic.trim() !== "") ? topic.trim().slice(0, 80) : detectedTopic.slice(0, 80);

    // 4. Create Chat in MongoDB
    const chat = await Chat.create({
      userId: req.user._id,
      topic: finalTopic,
      model: "gemini-3.5-flash",
      level: safeLevel,
      priorKnowledge: safePrior,
      learningGoal: safeGoal,
      practiceIntensity: safeIntensity,
      interactionMode: safeMode,
      timeBudget: safeBudget,
      language: safeLang,
      targetSteps: safeTargetSteps,
      questionsPerMilestone: safeQuestionsCount,
      currentStep: 1,
      customQuestionsCount: 0,
      responseLength: safeLength,
      learningStyle: safeStyle,
      verifyFacts: true,
      isDocumentSession: true,
      documentInfo: {
        fileName: req.file.originalname,
        fileType,
        fileSize: req.file.size,
        totalPages,
        documentSummary,
        documentContent: text.slice(0, 50000), // Bound to 50k chars for high speed
        milestonePlan,
      },
    });

    // 5. Generate Milestone 1 Lesson
    const m1Title = milestonePlan[0]?.title || `Milestone 1: ${finalTopic}`;
    const initialPrompt = `Start Milestone 1 of ${safeTargetSteps}: Please introduce "${m1Title}" based on the uploaded document "${req.file.originalname}".`;

    const { systemInstruction, history } = buildGeminiContext({
      chat,
      oldMessages: [],
      isCustomQuestion: false,
    });

    const { aiReply, usage } = await generateAIResponse({
      model: chat.model,
      systemInstruction,
      history,
      prompt: initialPrompt,
    });

    const userMessage = await Message.create({
      chatId: chat._id,
      role: "user",
      content: initialPrompt,
      userId: req.user._id,
      messageType: "milestone",
      milestoneStep: 1,
    });

    const assistantMessage = await Message.create({
      chatId: chat._id,
      role: "model",
      content: aiReply,
      userId: req.user._id,
      usage,
      messageType: "milestone",
      milestoneStep: 1,
    });

    chat.messageCount = 2;
    addChatTokenUsage(chat, usage);
    await addUserTokenUsage(req.user, usage.totalTokens);
    await chat.save();

    res.status(201).json({
      message: "Document learning session launched successfully",
      chatId: chat._id,
      reply: aiReply,
      usage,
      userMessage,
      assistantMessage,
      isDocumentSession: true,
      documentInfo: {
        fileName: chat.documentInfo.fileName,
        fileType: chat.documentInfo.fileType,
        fileSize: chat.documentInfo.fileSize,
        totalPages: chat.documentInfo.totalPages,
        documentSummary: chat.documentInfo.documentSummary,
        milestonePlan: chat.documentInfo.milestonePlan,
      },
      tutorKnobs: {
        topic: chat.topic,
        level: chat.level,
        priorKnowledge: chat.priorKnowledge,
        learningGoal: chat.learningGoal,
        practiceIntensity: chat.practiceIntensity,
        interactionMode: chat.interactionMode,
        timeBudget: chat.timeBudget,
        language: chat.language,
        targetSteps: chat.targetSteps,
        currentStep: 1,
        customQuestionsCount: 0,
        questionsPerMilestone: chat.questionsPerMilestone,
        responseLength: chat.responseLength,
        learningStyle: chat.learningStyle,
        verifyFacts: true,
        isDocumentSession: true,
        documentInfo: {
          fileName: chat.documentInfo.fileName,
          fileType: chat.documentInfo.fileType,
          fileSize: chat.documentInfo.fileSize,
          totalPages: chat.documentInfo.totalPages,
          documentSummary: chat.documentInfo.documentSummary,
          milestonePlan: chat.documentInfo.milestonePlan,
        },
      },
    });
  } catch (err) {
    console.error("Error in createDocumentChat:", err);
    res.status(500).json({ message: "Failed to process document and launch session: " + err.message });
  }
};