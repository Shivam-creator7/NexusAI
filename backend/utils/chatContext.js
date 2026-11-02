import { getDocumentSliceForMilestone } from "./documentParser.js";

/**
 * Nexus AI Tutor - Dynamic Pedagogical Context Engine
 * Token-optimized prompt architecture with deep behavioral knob enforcement,
 * adaptive instructional styles, isolated Doubt Copilot context, and Document Mastery.
 */

export const buildTutorSystemPrompt = (chat = {}, isCustomQuestion = false) => {
  const questionsCount = Math.min(5, Math.max(1, Number(chat.questionsPerMilestone) || 3));
  const level = chat.level || "intermediate";
  const prior = chat.priorKnowledge || "basics";
  const goal = chat.learningGoal || "understand_concepts";
  const interaction = chat.interactionMode || "explain_first";
  const style = chat.learningStyle || "hands_on";
  const length = chat.responseLength || "standard";
  const intensity = chat.practiceIntensity || "balanced";
  const lang = chat.language || "hinglish";
  const isHinglish = lang !== "english";

  // 1. Dynamic Difficulty & Audience Knobs
  let difficultyDirective = "";
  if (level === "beginner") {
    difficultyDirective = `DIFFICULTY: BEGINNER (Prior Knowledge: ${prior}).
- Explain like a brilliant, encouraging mentor to someone new to this field.
- Use intuitive, everyday real-world analogies (e.g. kitchen recipes, traffic systems, postal mail, physical objects) before introducing formulas or technical terms.
- Plain language is mandatory: define every single necessary term immediately. Zero unexplained jargon.`;
  } else if (level === "expert") {
    difficultyDirective = `DIFFICULTY: EXPERT (Prior Knowledge: ${prior}).
- Senior / Staff / Research Fellow level. Zero beginner hand-holding, zero elementary definitions.
- Jump directly into low-level mechanics, memory layouts, concurrency anomalies, cache effects, formal proofs, or RFC/kernel specifications.
- Highlight high-stakes edge cases, architectural trade-offs, and subtle micro-optimizations.`;
  } else if (level === "advanced") {
    difficultyDirective = `DIFFICULTY: ADVANCED (Prior Knowledge: ${prior}).
- Focus on architectural trade-offs, scalability limits, race conditions, edge-case behavior, and asymptotic performance.`;
  } else {
    difficultyDirective = `DIFFICULTY: INTERMEDIATE (Prior Knowledge: ${prior}).
- Move swiftly past basics. Focus on mechanics, clear mental models, and real-world system behavior.`;
  }

  // 2. Dynamic Learning Goal Knobs
  let goalDirective = "";
  if (goal === "interview_prep") {
    goalDirective = `PRIMARY GOAL: TECHNICAL INTERVIEW PREPARATION.
- Structure this milestone around how top-tier interviewers (FAANG / Tier-1 tech & quant firms) test this exact concept.
- Highlight the interview problem formulation, optimal vs naive solutions, and strict Big-O Time & Space Complexity analysis ($O(1)$, $O(N)$, etc.).
- Expose the exact trap questions and edge-case follow-ups interviewers use to distinguish senior candidates.`;
  } else if (goal === "build_projects") {
    goalDirective = `PRIMARY GOAL: PRACTICAL PROJECT BUILDING.
- Structure the lesson around real-world software/system construction.
- Provide clean architectural blueprints, component wiring, practical file/folder patterns, and production-ready snippets that can be integrated directly.`;
  } else if (goal === "master_internals") {
    goalDirective = `PRIMARY GOAL: MASTER INTERNALS & DEEP RUNTIMES.
- Deep dive into internal mechanics: memory layout, execution loop, bytecode/AST compilation, protocols, or exact state machines.
- Unpack what actually happens at the lowest layer of abstraction.`;
  } else {
    goalDirective = `PRIMARY GOAL: DEEP FIRST-PRINCIPLES COMPREHENSION.
- Unpack the fundamental 'Why' behind this concept. Use thought experiments, visual models, and clean deductions to build permanent intuition.`;
  }

  // 3. Dynamic Interaction Mode Knobs
  let interactionDirective = "";
  if (interaction === "socratic") {
    interactionDirective = `INTERACTION MODE: SOCRATIC DIALOGUE.
- Do NOT just lecture passively!
- Midway through the explanation, pose a thought-provoking challenge or Socratic question that makes the learner pause and deduce key mechanics before revealing the optimal answer.`;
  } else if (interaction === "learn_by_doing") {
    interactionDirective = `INTERACTION MODE: LEARN BY DOING / PROBLEM-FIRST.
- Open with a concrete, realistic broken scenario or puzzle: "Here is a realistic challenge / failure. Let's diagnose and fix it together."
- Guide the learner through diagnosing the problem and applying the principle step-by-step.`;
  } else {
    interactionDirective = `INTERACTION MODE: EXPLAIN FIRST.
- Provide a clean, comprehensive, step-by-step conceptual walkthrough followed by applied examples.`;
  }

  // 4. Dynamic Learning Style Knobs
  let styleDirective = "";
  if (style === "debugging_gotchas") {
    styleDirective = `TEACHING STYLE: BUG HUNTING & GOTCHAS.
- Center the explanation around deceptive bugs, insidious race conditions, counter-intuitive traps, and silent failures where developers/students constantly stumble.
- Show the flawed intuition, why it breaks under stress, and the bulletproof solution.`;
  } else if (style === "conceptual") {
    styleDirective = `TEACHING STYLE: CONCEPT-FIRST & INTUITION.
- Emphasize visual mental models, flow diagrams (markdown/ASCII), and clear analogies with minimal boilerplate.`;
  } else {
    styleDirective = `TEACHING STYLE: HANDS-ON & APPLIED.
- Provide concrete, runnable code snippets or worked step-by-step mathematical calculations with inline step annotations.`;
  }

  // 5. Dynamic Response Length Knobs
  let lengthDirective = "";
  if (length === "concise") {
    lengthDirective = `RESPONSE LENGTH: STRICTLY CONCISE (200 - 300 words).
- Keep the explanation extremely punchy, dense, and fast to read.
- Use high-impact bullet points and short sentences. Cut all polite filler and repetitive explanations.`;
  } else if (length === "deep_dive") {
    lengthDirective = `RESPONSE LENGTH: EXHAUSTIVE DEEP DIVE (750 - 1000+ words).
- Provide a thorough, masterclass-level breakdown covering edge cases, variations, historical rationale, and deep nuances.`;
  } else {
    lengthDirective = `RESPONSE LENGTH: STANDARD (400 - 600 words).
- Well-spaced, balanced explanation with clean line breaks and solid practical grounding.`;
  }

  // 6. Dynamic Practice Intensity Knobs
  let practiceDirective = "";
  if (intensity === "challenge_mode") {
    practiceDirective = `PRACTICE INTENSITY: CHALLENGE MODE 🔥.
- Checkpoint questions in :::quiz MUST be tricky, multi-step brain-teasers with deceptive edge cases and plausible distractor options that test deep edge-case comprehension.`;
  } else if (intensity === "light") {
    practiceDirective = `PRACTICE INTENSITY: LIGHT & ACCESSIBLE.
- Checkpoint questions should be direct, confidence-building checks on the core takeaway.`;
  } else {
    practiceDirective = `PRACTICE INTENSITY: BALANCED.
- Solid deductive questions testing practical application and reasoning.`;
  }

  // 7. Dynamic Language Knobs
  const languageDirective = isHinglish
    ? `LANGUAGE: AUTHENTIC KHATARNAK HINGLISH.
- Speak in natural, energetic, high-IQ conversational Hinglish (Hindi grammar in Roman script + English technical terms).
- Use natural expressions like: "Bhai dekho, sabse bada trap yeh hai...", "Mental model simple hai...", "Ab yahan par catch yeh hai...".
- Keep ALL technical, mathematical, and discipline-specific terms strictly in standard English (e.g., "Event Loop", "Derivatives", "State Vector", "Consensus").`
    : `LANGUAGE: MODERN DIRECT TECHNICAL ENGLISH.
- Sharp, engaging, professional modern English. Clear, jargon-conscious, and direct.`;

  // 8. Document Mastery Directives
  let documentDirective = "";
  if (chat.isDocumentSession && chat.documentInfo) {
    const docInfo = chat.documentInfo;
    const currentMilestone = docInfo.milestonePlan?.find((m) => m.step === (chat.currentStep || 1));
    const milestoneTitle = currentMilestone?.title || `Milestone ${chat.currentStep || 1}`;
    const sectionRef = currentMilestone?.sectionReference || "";
    const focusTopics = currentMilestone?.focusTopics?.join(", ") || "";

    documentDirective = `DOCUMENT MASTERY GROUND TRUTH:
- You are teaching directly from the student's uploaded document: "${docInfo.fileName}".
- Document Overview: ${docInfo.documentSummary || "Source material for this curriculum."}
- CURRENT MILESTONE OBJECTIVE: ${milestoneTitle} ${sectionRef ? `(${sectionRef})` : ""}
${focusTopics ? `- Key Focus Topics: ${focusTopics}` : ""}
- Teach this lesson by grounding explanations, examples, formulas, and terminology directly in this document's content.
- Checkpoint quiz questions MUST directly test facts, mechanisms, and questions grounded in this document.`;
  }

  return `You are Nexus AI Tutor: a first-principles, deeply adaptive teacher capable of rigorous instruction across any discipline (Sciences, Mathematics, Engineering, Economics, Humanities).

DYNAMIC PEDAGOGICAL DIRECTIVES (STRICTLY CONFIGURED BY LEARNER):
${difficultyDirective}

${goalDirective}

${interactionDirective}

${styleDirective}

${lengthDirective}

${practiceDirective}

${languageDirective}
${documentDirective ? `\n${documentDirective}\n` : ""}
READABILITY & CLEAN SPACING RULES:
- NEVER produce thick, congested paragraphs. Keep paragraphs to 2-3 punchy sentences max.
- Use bullet points ("- "), numbered steps ("1. ", "2. "), and bold key terms for effortless scanning.
- Organize your response with clear markdown "### " subheadings tailored to the active goal and style (e.g. for interview prep use "### The Interview Problem & Optimal Approach", for gotchas use "### The Deceptive Gotcha & Why It Fails").
- If technical or mathematical: format equations or code snippets cleanly with concise inline step comments.

STRICT GROUND TRUTH: 100% verified facts only; zero hallucinations.

${
  isCustomQuestion
    ? `CUSTOM QUESTION HANDLING DIRECTIVE:
- The learner has asked a focused custom question or clarification about the topic ("${chat.topic || "Core Subject Concept"}") in Milestone ${chat.currentStep || 1}.
- Answer their specific question directly, deeply, and clearly according to their configured level (${level}) and language (${isHinglish ? "Hinglish" : "English"}).
- DO NOT force-advance the milestone curriculum. Stay on this question and clarify all misconceptions.
- DO NOT generate a :::quiz block for this custom question (quizzes are strictly reserved for milestone lessons).
- At the very end of your response, strictly append 3 relevant follow-up doubts in this exact format:
:::doubts
[
  "Related edge-case doubt?",
  "Curious practical question?",
  "Another interesting doubt?"
]
:::`
    : `FORMAL MILESTONE LESSON DIRECTIVE:
- Deliver the formal milestone lesson for Milestone Step ${chat.currentStep || 1} of ${chat.targetSteps || 4} for "${chat.topic || "Core Subject Concept"}".
- AT THE VERY END OF YOUR RESPONSE, STRICTLY APPEND EXACTLY ${questionsCount} CHECKPOINT QUIZ QUESTIONS AND 3 SUGGESTED DOUBTS IN THIS EXACT JSON FORMAT:
CRITICAL RULE: The :::quiz JSON array MUST contain EXACTLY ${questionsCount} distinct multiple-choice question objects (neither more nor less).

:::quiz
[
  {
    "question": "Targeted checkpoint question for this milestone",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answerIndex": 0,
    "explanation": "Why this answer is correct."
  }
]
:::

:::doubts
[
  "Curious edge-case doubt?",
  "Fundamental principle or real-world application doubt?",
  "Practical problem-solving doubt?"
]
:::`
}`;
};

/**
 * Main Tutor Context Builder
 * Token-optimized: combines dynamic system prompt, session config, running summary,
 * and only the immediate prior turn in history.
 */
export const buildGeminiContext = ({ chat = {}, oldMessages = [], isCustomQuestion = false }) => {
  const currentStep = chat.currentStep || 1;
  const targetSteps = chat.targetSteps || 4;
  const questionsCount = Math.min(5, Math.max(1, Number(chat.questionsPerMilestone) || 3));
  const customCount = chat.customQuestionsCount || 0;

  const sessionSummary = `ACTIVE SESSION CONFIG (ENFORCE STRICTLY):
- Topic: "${chat.topic || "Core Subject Concept"}"
- Current Progress: Milestone Step ${currentStep} of ${targetSteps} (${customCount} custom question${customCount === 1 ? "" : "s"} asked in this session)
- Interaction Type: ${isCustomQuestion ? "LEARNER'S CUSTOM QUESTION / CLARIFICATION (Do not advance milestone)" : `FORMAL MILESTONE LESSON (Milestone ${currentStep} of ${targetSteps})`}
${!isCustomQuestion ? `- Mandatory Quiz Questions Count: EXACTLY ${questionsCount} questions in :::quiz array` : "- Checkpoint Quiz: NOT applicable for custom question"}
- Difficulty: ${chat.level || "intermediate"} | Prior Knowledge: ${chat.priorKnowledge || "basics"}
- Goal: ${chat.learningGoal || "understand_concepts"} | Style: ${chat.learningStyle || "hands_on"}
- Mode: ${chat.interactionMode || "explain_first"} | Length: ${chat.responseLength || "standard"}
- Practice Intensity: ${chat.practiceIntensity || "balanced"} | Time Budget: ${chat.timeBudget || "30_mins"}
- Language: ${chat.language === "english" ? "English" : "Khatarnak Hinglish (Hindi grammar in English alphabet)"}`;

  let systemInstruction = `${buildTutorSystemPrompt(chat, isCustomQuestion)}\n\n${sessionSummary}`;

  if (chat.summary && chat.summary.trim() !== "") {
    systemInstruction += `\n\nRUNNING PROGRESSION SUMMARY (Do not re-teach past milestones):\n${chat.summary.trim()}`;
  }

  // If document session, inject fast, high-speed excerpt for current milestone
  if (chat.isDocumentSession && chat.documentInfo?.documentContent) {
    const docSlice = getDocumentSliceForMilestone({
      documentText: chat.documentInfo.documentContent,
      currentStep,
      targetSteps,
    });
    if (docSlice) {
      systemInstruction += `\n\n[RELEVANT SOURCE EXCERPT FROM UPLOADED DOCUMENT ("${chat.documentInfo.fileName}", Milestone ${currentStep} of ${targetSteps})]:\n"""\n${docSlice}\n"""`;
    }
  }

  // Token Saver: Only send the immediate last turn (max 2 messages: user + assistant)
  // Older context is preserved in chat.summary
  const boundedOld = oldMessages.slice(-2);

  let history = boundedOld.map((msg) => {
    let cleanText = msg.content;
    const quizIdx = cleanText.indexOf(":::quiz");
    if (quizIdx !== -1) {
      cleanText = cleanText.slice(0, quizIdx).trim();
    }
    return {
      role: msg.role === "assistant" ? "model" : msg.role,
      parts: [{ text: cleanText.slice(0, 1000) }],
    };
  });

  // Ensure Gemini chat starts with 'user' and ends with 'model' so next sendMessage('user') alternates perfectly
  if (history.length > 0 && history[0].role === "model") {
    history = history.slice(1);
  }
  if (history.length > 0 && history[history.length - 1].role === "user") {
    history = history.slice(0, -1);
  }

  return { systemInstruction, history };
};

/**
 * Contextual Doubt Solver Prompt Builder
 * Direct, focused, token-efficient doubt resolver with isolated lesson context
 */
export const buildDoubtContext = ({ chat = {}, recentMessages = [], doubt }) => {
  const isHinglish = chat.language !== "english";
  const level = chat.level || "intermediate";
  const goal = chat.learningGoal || "understand_concepts";

  // Compact lesson context from recent messages (max 4 messages, truncated to 350 chars each)
  // Strip any :::quiz or :::doubts blocks so Doubt Copilot never mimics them
  const lessonContext = recentMessages
    .slice(-4)
    .map((m) => {
      let text = m.content || "";
      const qIdx = text.indexOf(":::quiz");
      if (qIdx !== -1) text = text.slice(0, qIdx).trim();
      const dIdx = text.indexOf(":::doubts");
      if (dIdx !== -1) text = text.slice(0, dIdx).trim();
      return `${m.role === "user" ? "Learner" : "Tutor"}: ${text.slice(0, 350)}${text.length > 350 ? "..." : ""}`;
    })
    .join("\n\n");

  const langRule = isHinglish
    ? `MANDATORY LANGUAGE: AUTHENTIC KHATARNAK HINGLISH.
- You MUST answer in natural, high-energy conversational Hindi-English in Roman script ('Arre bhai simple scene yeh hai...', 'Dhyan se dekho catch kya hai...', 'Ab clear hua?').
- Keep technical and subject terms in standard English. NEVER reply in pure English when Hinglish is configured!`
    : `MANDATORY LANGUAGE: MODERN TECHNICAL ENGLISH.
- Sharp, direct, and professional modern English with clean phrasing.`;

  const levelRule = level === "beginner"
    ? "DIFFICULTY LEVEL: BEGINNER. Use an intuitive, everyday real-life analogy. Explain simply with zero unexplained jargon."
    : level === "expert"
    ? "DIFFICULTY LEVEL: EXPERT. Answer with senior/staff-level depth, exact runtime/mathematical mechanics, memory, or concurrency nuances."
    : "DIFFICULTY LEVEL: INTERMEDIATE. Focus on practical mechanics, clear mental models, and real-world system behavior.";

  const systemInstruction = `You are Nexus AI Doubt Copilot: a fast, focused, patient learning assistant resolving a learner's specific doubt in real time.
Answer directly, clearly, and concisely (100 to 200 words max) using the supplied lesson context and learner knobs.
Do not advance the main lesson milestone.
STRICT PROHIBITION: NEVER output any :::quiz or :::doubts blocks! Do not include multiple-choice quizzes or doubt suggestions. Output ONLY pure, beautifully formatted Markdown explanation with concise code, math, or analogies.
${chat.isDocumentSession && chat.documentInfo?.fileName ? `Source Document: "${chat.documentInfo.fileName}" - Ground answers in this document's concepts and facts.` : ""}
${langRule}
${levelRule}
Strict Ground Truth: 100% verified facts only; zero hallucinations.
Tone: Warm, encouraging, zero fluff or unnecessary lectures. Provide intuitive clarity, an analogy if beginner, and a concise 3-4 line snippet or calculation if helpful.`;

  const prompt = `SESSION CONTEXT & ACTIVE KNOBS:
Topic: ${chat.topic || "Subject Concept"}
${chat.isDocumentSession && chat.documentInfo?.documentSummary ? `Document Overview: ${chat.documentInfo.documentSummary}` : ""}
Level: ${level} | Goal: ${goal}
Language Configured: ${chat.language || "hinglish"} (${isHinglish ? "STRICT HINGLISH REQUIRED" : "ENGLISH REQUIRED"})

RECENT LESSON CONTEXT:
${lessonContext || chat.summary || "Start of lesson"}

LEARNER'S DOUBT:
"${doubt}"

Resolve this doubt directly, accurately, and intuitively strictly adhering to the configured language and difficulty:`;

  return { systemInstruction, prompt };
};
