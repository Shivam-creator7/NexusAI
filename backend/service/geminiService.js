import genAI from "../config/gemini.js";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

const REQUEST_TIMEOUT_MS = 60000;

export const generateAIResponse = async ({
  model = "gemini-3.5-flash",
  systemInstruction,
  history = [],
  prompt,
}) => {
  // Deduplicate candidate models with multiple fallback options
  const candidateModels = [
    ...new Set([
      model,
      process.env.DEFAULT_AI_MODEL,
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash-lite",
      "gemini-3.7-flash",
      "gemini-flash-lite-latest",
    ].filter(Boolean)),
  ];

  let lastError;
  for (const modelName of candidateModels) {
    // Attempt model up to 2 times (with short backoff on 503/429)
    for (let attempt = 0; attempt < 2; attempt++) {
      let timeoutTimer;
      try {
        const geminiModel = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction || undefined,
          safetySettings: SAFETY_SETTINGS,
        });

        const apiCall = history.length > 0
          ? geminiModel.startChat({ history }).sendMessage(prompt)
          : geminiModel.generateContent(prompt);

        const timeoutPromise = new Promise((_, reject) => {
          timeoutTimer = setTimeout(() => {
            const timeoutErr = new Error(`AI request timed out after ${REQUEST_TIMEOUT_MS / 1000}s on model ${modelName}`);
            timeoutErr.status = 504;
            reject(timeoutErr);
          }, REQUEST_TIMEOUT_MS);
          if (typeof timeoutTimer.unref === "function") timeoutTimer.unref();
        });

        const result = await Promise.race([apiCall, timeoutPromise]);
        if (timeoutTimer) clearTimeout(timeoutTimer);

        // Resilient text extraction (handles SAFETY/RECITATION finish reasons gracefully)
        let aiReply = "";
        try {
          aiReply = result.response.text();
        } catch (extractErr) {
          const candidate = result.response?.candidates?.[0];
          const parts = candidate?.content?.parts || [];
          aiReply = parts.map((p) => p.text || "").join("").trim();

          if (!aiReply) {
            if (candidate?.finishReason) {
              aiReply = `[Response completed with finish reason: ${candidate.finishReason}. Please adjust the query.]`;
            } else {
              throw extractErr;
            }
          }
        }

        return {
          aiReply,
          usage: {
            promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
            completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
          },
        };
      } catch (err) {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        lastError = err;
        // If 503 (high demand) or 429, wait 800ms before second attempt
        if ((err.status === 503 || err.status === 429) && attempt === 0) {
          console.warn(`Model ${modelName} transient status (${err.status}), retrying in 800ms...`);
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }
        // If model is busy (503), not found (404), rate-limited (429), or timed out (504), fail over to next candidate
        if (err.status === 503 || err.status === 404 || err.status === 429 || err.status === 504) {
          console.warn(`Model ${modelName} encountered (${err.status || err.message}), attempting failover to next model...`);
          break; // break inner loop, try next modelName
        }
        throw err;
      }
    }
  }

  throw lastError;
};
