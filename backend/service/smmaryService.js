import Chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";
import User from "../model/userSchema.js";
import { generateAIResponse } from "./geminiService.js";

const SUMMARY_CHUNK_SIZE = 2; // Summarize after every 1 turn (user + model response)

export const updateSummaryIfNeeded = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return;

    const unsummarizedCount =
      (chat.messageCount || 0) - (chat.summarizedTillMessageNumber || 0);

    if (unsummarizedCount < SUMMARY_CHUNK_SIZE) {
      return;
    }

    const messagesToSummarize = await Message.find({
      chatId: chat._id,
    })
      .sort({ createdAt: 1 })
      .skip(chat.summarizedTillMessageNumber || 0)
      .limit(SUMMARY_CHUNK_SIZE);

    if (messagesToSummarize.length === 0) return;

    // Fast, ultra-lean prompt for running summary
    const prompt = `Previous Context: ${chat.summary || "Start of session."}
New Turn:
${messagesToSummarize.map((msg) => `${msg.role === "user" ? "Learner" : "Tutor"}: ${msg.content.slice(0, 350)}`).join("\n")}

Task: Update running summary in 2 brief bullet points (max 50 words): concepts covered and active milestone.`;

    const { aiReply, usage } = await generateAIResponse({
      model: chat.model,
      systemInstruction: "You are a concise summarizer. Maintain a tight 50-word running summary of technical concepts mastered.",
      prompt,
    });

    const newSummarizedCount = (chat.summarizedTillMessageNumber || 0) + messagesToSummarize.length;

    // Atomic update to avoid Mongoose VersionError conflicts with concurrent messages
    await Chat.findByIdAndUpdate(chatId, {
      $set: {
        summary: aiReply.trim(),
        summaryUpdatedAt: new Date(),
        summarizedTillMessageNumber: newSummarizedCount,
      },
      $inc: {
        "usage.promptTokens": usage.promptTokens || 0,
        "usage.completionTokens": usage.completionTokens || 0,
        "usage.totalTokens": usage.totalTokens || 0,
      },
    });

    const user = await User.findById(chat.userId);
    if (user) {
      user.usage = user.usage || { tokenUsed: 0, totalTokenUsed: 0, tokenLimit: 1000000 };
      user.usage.tokenUsed = (user.usage.tokenUsed || 0) + (usage.totalTokens || 0);
      user.usage.totalTokenUsed = (user.usage.totalTokenUsed || 0) + (usage.totalTokens || 0);
      await user.save();
    }
  } catch (err) {
    console.error(`Background auto-summary caught safely for chat ${chatId}:`, err.message);
  }
};

