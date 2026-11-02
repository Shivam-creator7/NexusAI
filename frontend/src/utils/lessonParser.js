/**
 * Ultra-resilient JSON extractor that handles code fences, trailing commas,
 * single quotes, and unescaped characters from LLM outputs.
 */
const safeParseJSON = (rawStr) => {
  if (!rawStr || typeof rawStr !== "string") return null;

  let cleaned = rawStr.trim();
  // Strip markdown code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  // 1. Direct parse attempt
  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    // 2. Extract first valid JSON object or array substring if wrapped in extra text
    const jsonMatch = cleaned.match(/(\{|\[)[\s\S]*(\}|\])/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    // 3. Remove trailing commas before closing braces/brackets
    try {
      const sanitized = cleaned.replace(/,\s*([\]}])/g, "$1");
      return JSON.parse(sanitized);
    } catch (e2) {
      // 4. Fallback: try converting unescaped single quotes
      try {
        const doubleQuoted = cleaned
          .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"')
          .replace(/,\s*([\]}])/g, "$1");
        return JSON.parse(doubleQuoted);
      } catch (e3) {
        return null;
      }
    }
  }
};

/**
 * Strips redundant prefixes from option strings (e.g. "A) ", "B. ", "1. ")
 */
const cleanOptionText = (opt) => {
  if (typeof opt !== "string") return String(opt || "");
  return opt.replace(/^(?:[A-D]|\d+)[\).\:\-\s]+\s*/i, "").trim();
};

/**
 * Normalizes answer index from number, string index, option text, or letter ("A", "B", "C", "D", "Option B")
 */
const normalizeAnswerIndex = (rawAnswer, options = []) => {
  const optionsCount = Array.isArray(options) ? options.length : 4;
  if (typeof rawAnswer === "number" && rawAnswer >= 0 && rawAnswer < optionsCount) {
    return rawAnswer;
  }
  if (typeof rawAnswer === "string" && Array.isArray(options)) {
    const trimmed = rawAnswer.trim();
    // 1. Exact match with option text (case-insensitive)
    const exactIdx = options.findIndex((opt) => opt.trim().toLowerCase() === trimmed.toLowerCase());
    if (exactIdx !== -1) return exactIdx;

    // 2. Partial match if option text contains answer string or vice-versa
    const partialIdx = options.findIndex((opt) => 
      opt.trim().toLowerCase().includes(trimmed.toLowerCase()) || 
      trimmed.toLowerCase().includes(opt.trim().toLowerCase())
    );
    if (partialIdx !== -1) return partialIdx;

    // 3. Letter match like "Option A", "A", "B", "C", "D"
    const letterMatch = trimmed.match(/^(?:Option\s*)?([A-D])\b/i);
    if (letterMatch) {
      const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < optionsCount) return idx;
    }

    // 4. Numeric string match (supports 0-indexed and 1-indexed fallback)
    const num = parseInt(trimmed, 10);
    if (!isNaN(num)) {
      if (num >= 0 && num < optionsCount) return num;
      if (num >= 1 && num <= optionsCount) return num - 1;
    }
  }
  return 0; // Safe default
};

/**
 * Resilient parser for Nexus AI Tutor lesson messages.
 * Extracts structured interactive quiz and suggested doubts,
 * while stripping all internal directive tags from markdown for pristine rendering.
 */
export const parseLessonContent = (rawContent, topic = "the concept") => {
  if (!rawContent || typeof rawContent !== "string") {
    return { cleanMarkdown: "", quiz: null, doubts: [] };
  }

  let cleanMarkdown = rawContent;
  let quiz = null;
  let doubts = [];

  // 1. Extract and parse :::quiz block (supports closed and unclosed trailing blocks)
  const quizExtractRegex = /:::+\s*quiz\s*([\s\S]*?)(?:::+|$)/i;
  const quizMatch = cleanMarkdown.match(quizExtractRegex);

  if (quizMatch) {
    const parsed = safeParseJSON(quizMatch[1]);
    let rawQuestions = [];
    if (Array.isArray(parsed)) {
      rawQuestions = parsed;
    } else if (parsed && Array.isArray(parsed.questions)) {
      rawQuestions = parsed.questions;
    } else if (parsed && parsed.question) {
      rawQuestions = [parsed];
    }

    const validQuestions = rawQuestions
      .filter((q) => q && q.question && Array.isArray(q.options) && q.options.length >= 2)
      .map((q) => {
        const cleanedOptions = q.options.map(cleanOptionText);
        const rawAns = q.answerIndex !== undefined
          ? q.answerIndex
          : (q.answer !== undefined ? q.answer : (q.correctAnswer || q.correct_answer || q.answer_index));
        return {
          question: q.question,
          options: cleanedOptions,
          answerIndex: normalizeAnswerIndex(rawAns, cleanedOptions),
          explanation: q.explanation || "Correct! That directly aligns with the core mental model.",
        };
      });

    if (validQuestions.length > 0) {
      quiz = {
        questions: validQuestions,
        question: validQuestions[0].question,
        options: validQuestions[0].options,
        answerIndex: validQuestions[0].answerIndex,
        explanation: validQuestions[0].explanation,
      };
    }
  }

  // 2. Extract and parse :::doubts block (supports closed and unclosed trailing blocks)
  const doubtsExtractRegex = /:::+\s*doubts?\s*([\s\S]*?)(?:::+|$)/i;
  const doubtsMatch = cleanMarkdown.match(doubtsExtractRegex);

  if (doubtsMatch) {
    const parsed = safeParseJSON(doubtsMatch[1]);
    if (Array.isArray(parsed) && parsed.length > 0) {
      doubts = parsed
        .filter((d) => typeof d === "string" && d.trim().length > 0)
        .map((d) => d.replace(/^(?:\d+[\.\)]\s*|[-*]\s*)/, "").trim());
    }
  }

  // 3. Strictly clean out all :::quiz, :::doubts, and stray ::: markers from rendered markdown globally
  cleanMarkdown = cleanMarkdown
    .replace(/:::+\s*quiz[\s\S]*?(?:::+|$)/gi, "")
    .replace(/:::+\s*doubts?[\s\S]*?(?:::+|$)/gi, "")
    .replace(/^:::.*$/gm, "")
    .trim();

  // 4. Fallback smart doubts if none returned (guarantees interactive buttons)
  if (doubts.length === 0 && cleanMarkdown.trim().length > 0) {
    doubts = [
      `What are the most dangerous edge-cases or silent bugs with ${topic}?`,
      `How does ${topic} behave under heavy production traffic or scale?`,
      `Can you give a minimal 5-line debugging snippet for this?`,
    ];
  }

  return {
    cleanMarkdown,
    quiz,
    doubts,
  };
};
