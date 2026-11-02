import Chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";
import mongoose from "mongoose";
import { generateAIResponse } from "../service/geminiService.js";
import { buildGeminiContext, buildDoubtContext } from "../utils/chatContext.js";
import {
  resetUsageIfNeeded,
  hasTokenLimitReached,
  addUserTokenUsage,
} from "../utils/userUsage.js";
import { updateSummaryIfNeeded } from "../service/smmaryService.js";
import { addChatTokenUsage } from "../utils/tokenUsage.js";

// ==========================================
// MESSAGE & TUTOR LEARNING CONTROLLER
// Handles Lesson Dialogues & Contextual Doubts
// ==========================================

// 1. Get all messages for a specific chat
export const getMessage = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        message: "Invalid chat id",
        messages: "Invalid chat id",
      });
    }

    // Verify chat belongs to this user
    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
        messages: "Chat Not found",
      });
    }

    const messages = await Message.find({
      chatId: chatId,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      message: "Your all messages are here",
      messages: "Your all messages are here",
      msg: messages,
      chatInfo: {
        topic: chat.topic,
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
        verifyFacts: true,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
      messages: "Internal server error",
    });
  }
};

// 2. Send message in learning session (Generates structured milestone response)
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const {
      content,
      model = "gemini-3.5-flash",
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

    // Validate message content
    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    // Token limit checks
    await resetUsageIfNeeded(req.user);

    if (hasTokenLimitReached(req.user)) {
      return res.status(429).json({
        message: "Token limit reached. Please try after some time.",
        usage: req.user.usage,
      });
    }

    let chat;

    // Existing chat case
    if (chatId) {
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ message: "Invalid chat id" });
      }

      chat = await Chat.findOne({
        _id: chatId,
        userId: req.user._id,
      });

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      // Synchronize any updated tutor knobs passed mid-session
      if (req.body.level) chat.level = level;
      if (req.body.priorKnowledge) chat.priorKnowledge = priorKnowledge;
      if (req.body.learningGoal) chat.learningGoal = learningGoal;
      if (req.body.practiceIntensity) chat.practiceIntensity = practiceIntensity;
      if (req.body.interactionMode) chat.interactionMode = interactionMode;
      if (req.body.timeBudget) chat.timeBudget = timeBudget;
      if (req.body.language) chat.language = language;
      if (req.body.responseLength) chat.responseLength = responseLength;
      if (req.body.learningStyle) chat.learningStyle = learningStyle;
      if (req.body.targetSteps) chat.targetSteps = Math.min(10, Math.max(1, Number(targetSteps) || 4));
      if (req.body.questionsPerMilestone) chat.questionsPerMilestone = Math.min(5, Math.max(1, Number(questionsPerMilestone) || 3));
    } else {
      // New chat case with tutor knobs
      const finalTopic = topic && topic.trim() !== "" ? topic.trim() : content.trim().slice(0, 50);

      chat = await Chat.create({
        userId: req.user._id,
        model: model || "gemini-3.5-flash",
        topic: finalTopic,
        level,
        priorKnowledge,
        learningGoal,
        practiceIntensity,
        interactionMode,
        timeBudget,
        language,
        targetSteps: Math.min(10, Math.max(1, Number(targetSteps) || 4)),
        questionsPerMilestone: Math.min(5, Math.max(1, Number(questionsPerMilestone) || 3)),
        currentStep: 1,
        responseLength,
        learningStyle,
        verifyFacts: true, // Ground truth always active
      });
    }

    // Separate Custom Questions from Formal Milestone Progression
    const trimmedContent = content.trim();
    const isExplicitMilestone =
      req.body.isMilestone === true ||
      trimmedContent.startsWith("Start Milestone ") ||
      trimmedContent.startsWith("Let's proceed to Milestone ");

    const isCustomQuestion = !isExplicitMilestone;

    if (isExplicitMilestone) {
      const stepMatch = trimmedContent.match(/Milestone (\d+)/i);
      const requestedStep = req.body.milestoneStep
        ? Number(req.body.milestoneStep)
        : (stepMatch ? Number(stepMatch[1]) : (chat.currentStep || 1));
      chat.currentStep = Math.min(chat.targetSteps, Math.max(1, requestedStep));
    } else {
      // Custom questions do NOT advance currentStep; track count separately
      chat.customQuestionsCount = (chat.customQuestionsCount || 0) + 1;
    }

    // Bounded active conversation window (last 2 messages / 1 turn) to radically cut input tokens
    // Full prior context is dynamically preserved in chat.summary
    const MAX_ACTIVE_TURNS = 2;
    const oldMessages = await Message.find({
      chatId: chat._id,
    })
      .sort({ createdAt: -1 })
      .limit(MAX_ACTIVE_TURNS);
    oldMessages.reverse();

    // Build pedagogical instruction using knobs and custom question flag
    const { systemInstruction, history } = buildGeminiContext({
      chat,
      oldMessages,
      isCustomQuestion,
    });

    // Call Gemini with robust fallback
    const { aiReply, usage } = await generateAIResponse({
      model: chat.model,
      systemInstruction,
      history,
      prompt: trimmedContent,
    });

    // Store user message
    const userMessage = await Message.create({
      chatId: chat._id,
      role: "user",
      content: trimmedContent,
      userId: req.user._id,
      messageType: isCustomQuestion ? "custom_question" : "milestone",
      milestoneStep: chat.currentStep,
    });

    // Store AI tutor message
    const assistantMessage = await Message.create({
      chatId: chat._id,
      role: "model",
      content: aiReply,
      userId: req.user._id,
      usage,
      messageType: isCustomQuestion ? "custom_question" : "milestone",
      milestoneStep: chat.currentStep,
    });

    chat.messageCount = (chat.messageCount || 0) + 2;

    if (chat.topic === "New Chat" || chat.topic === "New Learning Session") {
      chat.topic = trimmedContent.slice(0, 50);
    }

    addChatTokenUsage(chat, usage);
    await addUserTokenUsage(req.user, usage.totalTokens);
    await chat.save();

    res.status(201).json({
      message: "Message sent successfully",
      chatId: chat._id,
      reply: aiReply,
      usage,
      userMessage,
      assistantMessage,
      messageType: isCustomQuestion ? "custom_question" : "milestone",
      tutorKnobs: {
        topic: chat.topic,
        level: chat.level,
        priorKnowledge: chat.priorKnowledge,
        learningGoal: chat.learningGoal,
        practiceIntensity: chat.practiceIntensity,
        interactionMode: chat.interactionMode,
        timeBudget: chat.timeBudget,
        language: chat.language,
        currentStep: chat.currentStep,
        targetSteps: chat.targetSteps,
        customQuestionsCount: chat.customQuestionsCount || 0,
        questionsPerMilestone: chat.questionsPerMilestone || 3,
        responseLength: chat.responseLength,
        learningStyle: chat.learningStyle,
        verifyFacts: true,
        isDocumentSession: chat.isDocumentSession || false,
        documentInfo: chat.documentInfo ? {
          fileName: chat.documentInfo.fileName,
          fileType: chat.documentInfo.fileType,
          fileSize: chat.documentInfo.fileSize,
          totalPages: chat.documentInfo.totalPages,
          documentSummary: chat.documentInfo.documentSummary,
          milestonePlan: chat.documentInfo.milestonePlan || [],
        } : null,
      },
    });

    // Background auto-summary (with safe rejection guard)
    updateSummaryIfNeeded(chat._id).catch((summaryErr) => {
      console.warn("Background auto-summary caught warning:", summaryErr.message);
    });
  } catch (err) {
    console.log("Error in sendMessage:", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// 3. Ask a contextual doubt (Right-Side Doubt Area)
export const askDoubt = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { doubt } = req.body;

    if (!doubt || doubt.trim() === "") {
      return res.status(400).json({ message: "Doubt question cannot be empty" });
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat id" });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat session not found" });
    }

    // Token limit checks
    await resetUsageIfNeeded(req.user);
    if (hasTokenLimitReached(req.user)) {
      return res.status(429).json({ message: "Token limit reached" });
    }

    // Get recent 4 messages to provide concise lesson context without token bloat
    const recentMessages = await Message.find({ chatId: chat._id })
      .sort({ createdAt: -1 })
      .limit(4);
    recentMessages.reverse();

    // Build context-aware doubt prompt with active knob synchronization
    const activeChatKnobs = {
      ...(chat.toObject ? chat.toObject() : chat),
      language: req.body.language || chat.language || "hinglish",
      level: req.body.level || chat.level || "intermediate",
    };

    const { systemInstruction, prompt } = buildDoubtContext({
      chat: activeChatKnobs,
      recentMessages,
      doubt: doubt.trim(),
    });

    // Generate AI explanation
    const { aiReply, usage } = await generateAIResponse({
      model: chat.model,
      systemInstruction,
      prompt,
    });

    // Save doubt to chat doubt history
    const doubtEntry = {
      doubt: doubt.trim(),
      answer: aiReply,
      createdAt: new Date(),
    };

    chat.doubts = chat.doubts || [];
    chat.doubts.push(doubtEntry);
    await addChatTokenUsage(chat, usage);
    await addUserTokenUsage(req.user, usage.totalTokens);
    await chat.save();

    res.status(200).json({
      message: "Doubt answered successfully",
      doubt: doubtEntry,
      usage,
    });
  } catch (err) {
    console.log("Error in askDoubt:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 4. Get all doubts for a specific chat
export const getDoubts = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat id" });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.user._id,
    }).select("doubts topic level language");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({
      message: "Doubts fetched successfully",
      doubts: chat.doubts || [],
      topic: chat.topic,
      level: chat.level,
      language: chat.language || "hinglish",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};