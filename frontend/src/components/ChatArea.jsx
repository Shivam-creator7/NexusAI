import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { messageApi, chatApi } from "../api";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { parseLessonContent } from "../utils/lessonParser";
import { InteractiveQuizCard } from "./InteractiveQuizCard";
import { SuggestedDoubts } from "./SuggestedDoubts";
import {
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  Zap,
  Menu,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Terminal,
  Compass,
  Code2,
  FileText,
  AlertTriangle,
  Sliders,
  HelpCircle,
  Gauge,
  Layers,
  ShieldCheck,
  Target,
  Clock,
  Flame,
  Languages,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

const buildDynamicMilestonePrompt = (step, targetSteps, topic, knobs = {}) => {
  const parts = [];
  const questionsCount = Math.min(5, Math.max(1, Number(knobs.questionsPerMilestone) || 3));

  // 1. Language Enforcement
  if (knobs.language === "english") {
    parts.push("Language: Strict modern technical English. Clear, jargon-conscious, and direct.");
  } else {
    parts.push("Language: Authentic Khatarnak Hinglish (high-energy conversational Hindi in Roman English script + English technical terms).");
  }

  // 2. Exact Checkpoint Quiz Count Enforcement
  parts.push(`Checkpoint Quiz: STRICTLY generate EXACTLY ${questionsCount} multiple-choice question objects inside the :::quiz JSON block.`);

  // 3. Difficulty Level & Prior Knowledge
  if (knobs.level === "beginner") {
    parts.push(`Audience Level: Beginner (Prior Knowledge: ${knobs.priorKnowledge || "zero"}). Use intuitive real-world analogies before equations.`);
  } else if (knobs.level === "expert") {
    parts.push(`Audience Level: Expert (Prior Knowledge: ${knobs.priorKnowledge || "experienced"}). Zero basic definitions; jump straight into low-level mechanics, memory layouts, and edge-case anomalies.`);
  } else if (knobs.level === "advanced") {
    parts.push(`Audience Level: Advanced. Focus on scalability limits, concurrency race conditions, and architectural trade-offs.`);
  } else {
    parts.push(`Audience Level: Intermediate. Move swiftly past basics to core mechanisms.`);
  }

  // 4. Learning Goal
  if (knobs.learningGoal === "interview_prep") {
    parts.push("Primary Goal: Technical Interview Prep (highlight FAANG/Tier-1 interview formulations, Big-O complexity analysis, and interviewer trap questions).");
  } else if (knobs.learningGoal === "build_projects") {
    parts.push("Primary Goal: Practical Project Building (provide clean architecture, component wiring, and production patterns).");
  } else if (knobs.learningGoal === "master_internals") {
    parts.push("Primary Goal: Master Low-Level Internals & Runtime Execution Mechanics.");
  } else {
    parts.push("Primary Goal: First-Principles Comprehension & Intuitive Mental Models.");
  }

  // 5. Interaction Mode
  if (knobs.interactionMode === "socratic") {
    parts.push("Interaction: Socratic Challenge (pose a thought-provoking challenge midway before revealing the optimal path).");
  } else if (knobs.interactionMode === "learn_by_doing") {
    parts.push("Interaction: Problem-First Challenge (start with a concrete broken puzzle or failure scenario to solve together).");
  }

  // 6. Learning Style
  if (knobs.learningStyle === "debugging_gotchas") {
    parts.push("Teaching Style: Deceptive Gotchas & Bug Hunting (focus on counter-intuitive traps and silent bugs).");
  } else if (knobs.learningStyle === "conceptual") {
    parts.push("Teaching Style: Concept-First & Visual Intuition.");
  } else {
    parts.push("Teaching Style: Hands-on & Applied Code/Calculations.");
  }

  // 7. Practice Intensity
  if (knobs.practiceIntensity === "challenge_mode") {
    parts.push("Practice Intensity: Challenge Mode 🔥 (quiz questions must be tricky brain-teasers testing subtle edge cases).");
  } else if (knobs.practiceIntensity === "light") {
    parts.push("Practice Intensity: Light & Accessible.");
  }

  // 8. Time Budget & Length
  if (knobs.timeBudget === "15_mins") {
    parts.push("Time Budget: Paced for a brisk 15-minute high-yield breakdown.");
  } else if (knobs.timeBudget === "60_mins") {
    parts.push("Time Budget: Paced for an exhaustive 60-minute masterclass.");
  }

  if (knobs.responseLength === "concise") {
    parts.push("Response Length: Strictly concise (250-350 words, dense bullet points).");
  } else if (knobs.responseLength === "deep_dive") {
    parts.push("Response Length: Exhaustive deep dive (750-1000+ words).");
  }

  const directives = parts.length > 0 ? `\n\n[ACTIVE LEARNING DIRECTIVES:\n- ${parts.join("\n- ")}]` : "";

  return step === 1
    ? `Start Milestone 1 of ${targetSteps}: Please introduce "${topic}".${directives}`
    : `Let's proceed to Milestone ${step} of ${targetSteps} for "${topic}".${directives}`;
};

export const ChatArea = ({
  activeChatId,
  selectedModel,
  onChatCreated,
  onToggleSidebar,
  sidebarOpen,
  onOpenKnobsModal,
  onToggleDoubtSidebar,
  doubtSidebarOpen,
  onAutoAskDoubt,
  launchKnobsTrigger,
  onSyncSession,
}) => {
  const { user, setAuthModalOpen, setAuthMode, updateUserUsage } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [errorBanner, setErrorBanner] = useState("");
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [sessionKnobs, setSessionKnobs] = useState({
    topic: "Nexus AI Tutor",
    level: "intermediate",
    priorKnowledge: "basics",
    learningGoal: "understand_concepts",
    practiceIntensity: "balanced",
    interactionMode: "explain_first",
    timeBudget: "30_mins",
    language: "hinglish",
    currentStep: 1,
    targetSteps: 4,
    customQuestionsCount: 0,
    questionsPerMilestone: 3,
    responseLength: "standard",
    learningStyle: "hands_on",
    verifyFacts: true,
    isDocumentSession: false,
    documentInfo: null,
  });

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const activeChatIdRef = useRef(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages and chat metadata when activeChatId changes
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      setSessionKnobs({
        topic: "New Learning Session",
        level: "intermediate",
        priorKnowledge: "basics",
        learningGoal: "understand_concepts",
        practiceIntensity: "balanced",
        interactionMode: "explain_first",
        timeBudget: "30_mins",
        language: "hinglish",
        currentStep: 1,
        targetSteps: 4,
        customQuestionsCount: 0,
        questionsPerMilestone: 3,
        responseLength: "standard",
        learningStyle: "hands_on",
        verifyFacts: true,
        isDocumentSession: false,
        documentInfo: null,
      });
      return;
    }

    const loadMessagesAndDetails = async () => {
      setLoadingMessages(true);
      setErrorBanner("");
      try {
        const [msgData, chatData] = await Promise.all([
          messageApi.getMessages(activeChatId),
          chatApi.getSingleChat(activeChatId),
        ]);

        setMessages(msgData.msg || []);
        if (chatData) {
          const loadedKnobs = {
            topic: chatData.topic || "Learning Session",
            level: chatData.level || "intermediate",
            priorKnowledge: chatData.priorKnowledge || "basics",
            learningGoal: chatData.learningGoal || "understand_concepts",
            practiceIntensity: chatData.practiceIntensity || "balanced",
            interactionMode: chatData.interactionMode || "explain_first",
            timeBudget: chatData.timeBudget || "30_mins",
            language: chatData.language || "hinglish",
            currentStep: chatData.currentStep || 1,
            targetSteps: chatData.targetSteps || 4,
            customQuestionsCount: chatData.customQuestionsCount || 0,
            questionsPerMilestone: chatData.questionsPerMilestone || 3,
            responseLength: chatData.responseLength || "standard",
            learningStyle: chatData.learningStyle || "hands_on",
            verifyFacts: true,
            isDocumentSession: chatData.isDocumentSession || false,
            documentInfo: chatData.documentInfo || null,
          };
          setSessionKnobs(loadedKnobs);
          if (onSyncSession) {
            onSyncSession(loadedKnobs);
          }
        }
      } catch (err) {
        console.error("Failed to load session details:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessagesAndDetails();
  }, [activeChatId]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleSend = async (customPrompt, customKnobs, isMilestoneParam) => {
    const textToSend = typeof customPrompt === "string" ? customPrompt : input;
    if (!textToSend.trim() || sending) return;

    if (!user) {
      setAuthMode("login");
      setAuthModalOpen(true);
      return;
    }

    // Check token limit
    const tokenLimit = user.usage?.tokenLimit || 1000000;
    if ((user.usage?.tokenUsed || 0) >= tokenLimit) {
      setErrorBanner("Token limit reached. Please wait for quota reset or upgrade allowance.");
      return;
    }

    setErrorBanner("");
    const promptText = textToSend.trim();
    const originatingChatId = activeChatId;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Detect if this is a curriculum milestone advancement or a standalone custom question
    const isMilestone =
      typeof isMilestoneParam === "boolean"
        ? isMilestoneParam
        : (promptText.startsWith("Start Milestone ") || promptText.startsWith("Let's proceed to Milestone "));

    let milestoneStep = undefined;
    if (isMilestone) {
      const stepMatch = promptText.match(/Milestone (\d+)/i);
      milestoneStep = stepMatch ? Number(stepMatch[1]) : (sessionKnobs.currentStep || 1);
    }

    // Optimistic UI update with messageType and milestoneStep
    const tempUserMsg = {
      role: "user",
      content: promptText,
      messageType: isMilestone ? "milestone" : "custom_question",
      milestoneStep: isMilestone ? milestoneStep : sessionKnobs.currentStep,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const activeKnobs = customKnobs || sessionKnobs;

      const data = await messageApi.sendMessage({
        chatId: originatingChatId,
        content: promptText,
        model: selectedModel,
        topic: activeKnobs.topic || promptText.slice(0, 50),
        level: activeKnobs.level,
        priorKnowledge: activeKnobs.priorKnowledge,
        learningGoal: activeKnobs.learningGoal,
        practiceIntensity: activeKnobs.practiceIntensity,
        interactionMode: activeKnobs.interactionMode,
        timeBudget: activeKnobs.timeBudget,
        language: activeKnobs.language || "hinglish",
        targetSteps: activeKnobs.targetSteps,
        questionsPerMilestone: activeKnobs.questionsPerMilestone || 3,
        responseLength: activeKnobs.responseLength,
        learningStyle: activeKnobs.learningStyle,
        verifyFacts: true,
        isMilestone,
        milestoneStep,
      });

      // Race-condition guard: check if user switched chats while waiting
      const isStillSameChat = activeChatIdRef.current === originatingChatId;

      if (!originatingChatId && data.chatId) {
        // New chat creation
        onChatCreated(data.chatId);
        const assistantMsg = {
          role: "model",
          content: data.reply,
          usage: data.usage,
          messageType: data.messageType || (isMilestone ? "milestone" : "custom_question"),
          milestoneStep: data.tutorKnobs?.currentStep || sessionKnobs.currentStep,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (data.tutorKnobs) {
          setSessionKnobs((prev) => ({
            ...prev,
            ...data.tutorKnobs,
          }));
          if (onSyncSession) {
            onSyncSession(data.tutorKnobs);
          }
        }
      } else if (isStillSameChat) {
        // Append assistant reply for current chat
        const assistantMsg = {
          role: "model",
          content: data.reply,
          usage: data.usage,
          messageType: data.messageType || (isMilestone ? "milestone" : "custom_question"),
          milestoneStep: data.tutorKnobs?.currentStep || sessionKnobs.currentStep,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // If knobs returned from backend, update sessionKnobs
        if (data.tutorKnobs) {
          setSessionKnobs((prev) => ({
            ...prev,
            ...data.tutorKnobs,
          }));
          if (onSyncSession) {
            onSyncSession(data.tutorKnobs);
          }
        }
      }

      // Update token usage in context
      if (data.usage) {
        updateUserUsage(data.usage);
      }
    } catch (err) {
      if (activeChatIdRef.current === originatingChatId) {
        const errMsg = err.response?.data?.message || "Failed to generate response. Please try again.";
        setErrorBanner(errMsg);
      }
    } finally {
      setSending(false);
    }
  };

  const lastLaunchRef = useRef(null);

  // Automatically start chat session when Launch button in TutorKnobsModal is clicked
  useEffect(() => {
    if (launchKnobsTrigger && launchKnobsTrigger.timestamp !== lastLaunchRef.current) {
      lastLaunchRef.current = launchKnobsTrigger.timestamp;
      const { knobs } = launchKnobsTrigger;

      // CASE A: User uploaded a document!
      if (knobs.documentFile) {
        const finalTopic = knobs.topic || knobs.documentFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

        setMessages([]);
        setSending(true);
        setErrorBanner("");

        setSessionKnobs({
          topic: finalTopic,
          level: knobs.level || "intermediate",
          priorKnowledge: knobs.priorKnowledge || "basics",
          learningGoal: knobs.learningGoal || "understand_concepts",
          practiceIntensity: knobs.practiceIntensity || "balanced",
          interactionMode: knobs.interactionMode || "explain_first",
          timeBudget: knobs.timeBudget || "30_mins",
          language: knobs.language || "hinglish",
          currentStep: 1,
          targetSteps: Number(knobs.targetSteps) || 4,
          customQuestionsCount: 0,
          questionsPerMilestone: Number(knobs.questionsPerMilestone) || 3,
          responseLength: knobs.responseLength || "standard",
          learningStyle: knobs.learningStyle || "hands_on",
          verifyFacts: true,
          isDocumentSession: true,
          documentInfo: {
            fileName: knobs.documentFile.name,
            fileSize: knobs.documentFile.size,
          },
        });

        const initialUserMsg = {
          role: "user",
          content: `Start Milestone 1 of ${knobs.targetSteps || 4}: Please introduce "${finalTopic}" from "${knobs.documentFile.name}".`,
          messageType: "milestone",
          milestoneStep: 1,
          createdAt: new Date().toISOString(),
        };
        setMessages([initialUserMsg]);

        const formData = new FormData();
        formData.append("file", knobs.documentFile);
        formData.append("topic", finalTopic);
        formData.append("level", knobs.level || "intermediate");
        formData.append("priorKnowledge", knobs.priorKnowledge || "basics");
        formData.append("learningGoal", knobs.learningGoal || "understand_concepts");
        formData.append("practiceIntensity", knobs.practiceIntensity || "balanced");
        formData.append("interactionMode", knobs.interactionMode || "explain_first");
        formData.append("timeBudget", knobs.timeBudget || "30_mins");
        formData.append("language", knobs.language || "hinglish");
        formData.append("targetSteps", Number(knobs.targetSteps) || 4);
        formData.append("questionsPerMilestone", Number(knobs.questionsPerMilestone) || 3);
        formData.append("responseLength", knobs.responseLength || "standard");
        formData.append("learningStyle", knobs.learningStyle || "hands_on");

        chatApi
          .createChatWithDocument(formData)
          .then((data) => {
            if (data.chatId) {
              onChatCreated(data.chatId);
            }
            const assistantMsg = {
              role: "model",
              content: data.reply,
              usage: data.usage,
              messageType: "milestone",
              milestoneStep: 1,
              createdAt: new Date().toISOString(),
            };
            setMessages([initialUserMsg, assistantMsg]);
            if (data.tutorKnobs) {
              setSessionKnobs((prev) => ({
                ...prev,
                ...data.tutorKnobs,
              }));
              if (onSyncSession) onSyncSession(data.tutorKnobs);
            }
            if (data.usage) updateUserUsage(data.usage);
          })
          .catch((err) => {
            console.error("Document upload failed:", err);
            const errMsg = err.response?.data?.message || "Failed to process document and launch session.";
            setErrorBanner(errMsg);
          })
          .finally(() => {
            setSending(false);
          });

        return;
      }

      // CASE B: Standard Topic Mode
      const finalTopic = knobs.topic || "Node.js Event Loop & Libuv Architecture";

      setMessages([]);
      setSessionKnobs({
        topic: finalTopic,
        level: knobs.level || "intermediate",
        priorKnowledge: knobs.priorKnowledge || "basics",
        learningGoal: knobs.learningGoal || "understand_concepts",
        practiceIntensity: knobs.practiceIntensity || "balanced",
        interactionMode: knobs.interactionMode || "explain_first",
        timeBudget: knobs.timeBudget || "30_mins",
        language: knobs.language || "hinglish",
        currentStep: 1,
        targetSteps: Number(knobs.targetSteps) || 4,
        questionsPerMilestone: Number(knobs.questionsPerMilestone) || 3,
        responseLength: knobs.responseLength || "standard",
        learningStyle: knobs.learningStyle || "hands_on",
        verifyFacts: true,
        isDocumentSession: false,
        documentInfo: null,
      });

      const initialPrompt = buildDynamicMilestonePrompt(
        1,
        Number(knobs.targetSteps) || 4,
        finalTopic,
        knobs
      );
      handleSend(initialPrompt, knobs, true);
    }
  }, [launchKnobsTrigger]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !sending) {
        handleSend(input, sessionKnobs, false);
        setShowCustomPrompt(false);
      }
    }
  };

  const handleProceedMilestone = () => {
    if (sending) return;
    const currentStep = sessionKnobs.currentStep || 1;
    const targetSteps = sessionKnobs.targetSteps || 4;
    if (currentStep >= targetSteps) return;
    const nextStep = currentStep + 1;
    const promptText = buildDynamicMilestonePrompt(
      nextStep,
      targetSteps,
      sessionKnobs.topic,
      sessionKnobs
    );
    handleSend(promptText, sessionKnobs, true);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const samplePrompts = [
    {
      topic: "Quantum Superposition & Wave-Particle Duality",
      level: "intermediate",
      priorKnowledge: "basics",
      learningGoal: "understand_concepts",
      practiceIntensity: "balanced",
      interactionMode: "explain_first",
      timeBudget: "30_mins",
      language: "hinglish",
      targetSteps: 4,
      responseLength: "deep_dive",
      learningStyle: "conceptual",
      title: "Quantum Superposition & Duality",
      desc: "Unpack the double-slit thought experiment, state vectors, and physical intuition without confusing jargon.",
      icon: <Sparkles size={18} color="var(--accent-cyan)" />,
    },
    {
      topic: "Distributed Consensus: Raft & Paxos",
      level: "advanced",
      priorKnowledge: "basics",
      learningGoal: "master_internals",
      practiceIntensity: "challenge_mode",
      interactionMode: "learn_by_doing",
      timeBudget: "45_mins",
      language: "hinglish",
      targetSteps: 4,
      responseLength: "deep_dive",
      learningStyle: "hands_on",
      title: "Distributed Consensus (Raft)",
      desc: "Leader election, log replication, split-brain resolution, and quorum heartbeats across cluster nodes.",
      icon: <Terminal size={18} color="var(--primary)" />,
    },
    {
      topic: "Behavioral Economics & Nash Equilibrium",
      level: "intermediate",
      priorKnowledge: "basics",
      learningGoal: "understand_concepts",
      practiceIntensity: "balanced",
      interactionMode: "socratic",
      timeBudget: "30_mins",
      language: "hinglish",
      targetSteps: 4,
      responseLength: "standard",
      learningStyle: "conceptual",
      title: "Game Theory & Strategic Equilibrium",
      desc: "Prisoner's dilemma, dominant strategies, cognitive biases, and real-world market auction dynamics.",
      icon: <Compass size={18} color="var(--accent-purple)" />,
    },
    {
      topic: "Neuroscience of Memory & Long-Term Potentiation",
      level: "intermediate",
      priorKnowledge: "basics",
      learningGoal: "deep_understanding",
      practiceIntensity: "balanced",
      interactionMode: "explain_first",
      timeBudget: "30_mins",
      language: "english",
      targetSteps: 4,
      responseLength: "deep_dive",
      learningStyle: "conceptual",
      title: "Neuroscience of Memory Consolidation",
      desc: "Synaptic plasticity, hippocampal indexing, sleep replay mechanisms, and forgetting curves.",
      icon: <FileText size={18} color="var(--accent-emerald)" />,
    },
  ];

  const percentProgress = Math.min(
    100,
    Math.round(((sessionKnobs.currentStep || 1) / (sessionKnobs.targetSteps || 5)) * 100)
  );

  return (
    <div style={styles.container}>
      {/* Top Navbar with Unified Topic and Pedagogy Badges (No Awkward Gap) */}
      <header style={styles.topbar}>
        {/* Left Zone: Menu Toggle & Active Topic / Step + Connected Badges */}
        <div style={styles.navLeft}>
          <button
            style={{
              ...styles.menuToggle,
              backgroundColor: !sidebarOpen ? "rgba(99, 102, 241, 0.16)" : "rgba(255, 255, 255, 0.04)",
              borderColor: !sidebarOpen ? "rgba(99, 102, 241, 0.35)" : "rgba(255, 255, 255, 0.08)",
              color: !sidebarOpen ? "#c7d2fe" : "var(--text-secondary)",
              gap: !sidebarOpen ? "7px" : "0",
              padding: !sidebarOpen ? "7px 12px" : "8px",
            }}
            onClick={onToggleSidebar}
            title={sidebarOpen ? "Collapse sidebar (Ctrl+B)" : "Open sidebar (Ctrl+B)"}
          >
            {sidebarOpen ? (
              <PanelLeftClose size={18} />
            ) : (
              <>
                <PanelLeftOpen size={18} color="var(--accent-cyan)" />
                <span style={{ fontSize: "12px", fontWeight: "600", letterSpacing: "0.2px" }}>Chats</span>
              </>
            )}
          </button>

          {!sidebarOpen && (
            <button
              style={styles.quickNewBtn}
              onClick={() => onOpenKnobsModal()}
              title="New Learning Session"
            >
              <Plus size={15} color="#fff" />
            </button>
          )}

          <div style={styles.topicInfoGroup}>
            <div style={styles.topicIconBadge}>
              <Sparkles size={14} color="#fff" />
            </div>
            <div style={styles.topicTextContainer}>
              <span style={styles.sessionTopic} title={sessionKnobs.topic}>
                {sessionKnobs.topic || "Nexus AI Tutor Studio"}
              </span>
              <span style={styles.topicSubStep}>
                Milestone {sessionKnobs.currentStep || 1} of {sessionKnobs.targetSteps || 4}
                {sessionKnobs.customQuestionsCount > 0 && (
                  <span style={{ marginLeft: "7px", color: "var(--accent-cyan)", fontWeight: "600" }}>
                    • {sessionKnobs.customQuestionsCount} Custom Q{sessionKnobs.customQuestionsCount > 1 ? "s" : ""}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div style={styles.navDivider} />

          <div style={styles.badgesCluster}>
            {sessionKnobs.isDocumentSession && sessionKnobs.documentInfo?.fileName && (
              <span
                style={{
                  ...styles.levelBadge,
                  backgroundColor: "rgba(6, 182, 212, 0.16)",
                  borderColor: "rgba(6, 182, 212, 0.4)",
                  color: "var(--accent-cyan)",
                }}
                title={`Uploaded Document: ${sessionKnobs.documentInfo.fileName} (${sessionKnobs.documentInfo.totalPages || 1} pages)`}
              >
                <FileText size={13} />
                <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {sessionKnobs.documentInfo.fileName}
                </span>
              </span>
            )}

            <span style={styles.levelBadge} title={`Level: ${sessionKnobs.level}`}>
              <Gauge size={13} />
              <span style={{ textTransform: "capitalize" }}>{sessionKnobs.level}</span>
            </span>

            {sessionKnobs.customQuestionsCount > 0 && (
              <span
                style={{
                  ...styles.levelBadge,
                  backgroundColor: "rgba(6, 182, 212, 0.14)",
                  borderColor: "rgba(6, 182, 212, 0.35)",
                  color: "var(--accent-cyan)",
                }}
                title={`${sessionKnobs.customQuestionsCount} Custom questions addressed (counted separately from milestone curriculum)`}
              >
                <MessageCircle size={13} />
                <span>{sessionKnobs.customQuestionsCount} Custom Q{sessionKnobs.customQuestionsCount > 1 ? "s" : ""}</span>
              </span>
            )}

            {sessionKnobs.language && (
              <span
                style={{
                  ...styles.langBadge,
                  backgroundColor:
                    sessionKnobs.language === "hinglish"
                      ? "rgba(234, 88, 12, 0.15)"
                      : "rgba(6, 182, 212, 0.12)",
                  color: sessionKnobs.language === "hinglish" ? "#fb923c" : "var(--accent-cyan)",
                  borderColor:
                    sessionKnobs.language === "hinglish"
                      ? "rgba(234, 88, 12, 0.35)"
                      : "rgba(6, 182, 212, 0.3)",
                }}
                title={`Language: ${sessionKnobs.language === "hinglish" ? "Hinglish (Khatarnak Teacher)" : "English"}`}
              >
                <Languages size={13} />
                <span>{sessionKnobs.language === "hinglish" ? "Hinglish" : "English"}</span>
              </span>
            )}

            {sessionKnobs.learningGoal && (
              <span style={styles.goalBadge} title={`Goal: ${sessionKnobs.learningGoal.replace(/_/g, " ")}`}>
                <Target size={13} />
                <span style={{ textTransform: "capitalize" }}>{sessionKnobs.learningGoal.replace(/_/g, " ")}</span>
              </span>
            )}

            {sessionKnobs.timeBudget && (
              <span style={styles.timeBadge} title={`Time Budget: ${sessionKnobs.timeBudget.replace(/_/g, " ")}`}>
                <Clock size={13} />
                <span>{sessionKnobs.timeBudget.replace(/_/g, " ")}</span>
              </span>
            )}

            {sessionKnobs.questionsPerMilestone && (
              <span style={styles.quizBadge} title={`Checkpoint Questions: ${sessionKnobs.questionsPerMilestone} per milestone`}>
                <HelpCircle size={13} />
                <span>{sessionKnobs.questionsPerMilestone} Qs/Step</span>
              </span>
            )}

            <span style={styles.verifiedTag} title="Strict Ground Truth Verification Active">
              <ShieldCheck size={13} color="var(--accent-emerald)" />
              <span>Verified</span>
            </span>
          </div>
        </div>

        {/* Right Zone: Tutor Knobs + Doubt Copilot + Studio Tokens */}
        <div style={styles.navRight}>
          <button
            style={styles.knobConfigBtn}
            onClick={() => onOpenKnobsModal(sessionKnobs)}
            title="Configure Tutor Knobs (Difficulty, Steps, Style)"
          >
            <Sliders size={14} color="var(--accent-purple)" />
            <span>Knobs</span>
          </button>

          <button
            style={{
              ...styles.doubtCopilotBtn,
              backgroundColor: doubtSidebarOpen
                ? "rgba(6, 182, 212, 0.22)"
                : "rgba(6, 182, 212, 0.1)",
              borderColor: doubtSidebarOpen
                ? "var(--accent-cyan)"
                : "rgba(6, 182, 212, 0.3)",
              boxShadow: doubtSidebarOpen ? "0 0 16px rgba(6, 182, 212, 0.25)" : "none",
            }}
            onClick={onToggleDoubtSidebar}
            title="Open Contextual Doubt Solver Copilot"
          >
            <HelpCircle size={15} color="var(--accent-cyan)" />
            <span>Doubt Copilot</span>
          </button>

          {user && (
            <div style={styles.tokenPill} title="Studio Token Quota">
              <Zap size={13} color="var(--accent-cyan)" />
              <span>{(user.usage?.tokenUsed || 0).toLocaleString()} / 1M</span>
            </div>
          )}
        </div>
      </header>

      {/* Milestone Progress Bar Line */}
      {activeChatId && (
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressBar, width: `${percentProgress}%` }} />
        </div>
      )}

      {/* Error alert banner */}
      {errorBanner && (
        <div style={styles.errorBanner}>
          <AlertTriangle size={16} color="#f43f5e" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Messages Feed or Hero Tutor Studio view */}
      <div style={styles.scrollArea}>
        {messages.length === 0 && !loadingMessages ? (
          <div style={styles.heroContainer}>
            <div style={styles.heroBadge}>
              <Sparkles size={26} color="#ffffff" />
            </div>
            <h1 style={styles.heroTitle}>Nexus AI Tutor Studio</h1>
            <p style={styles.heroSubtitle}>
              Structured, in-depth mastery across any subject—built on first-principles mental models, practical scenarios, critical misconceptions, and real-time doubt solving.
            </p>

            {/* Dual Studio Launch Callouts */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px", width: "100%", maxWidth: "800px", marginBottom: "28px" }}>
              <div style={styles.launchCallout} onClick={() => onOpenKnobsModal(sessionKnobs)}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={styles.calloutIcon}>
                    <Sliders size={18} color="#fff" />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>
                      Topic Studio
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Configure custom subject topics with difficulty knobs & milestones.
                    </div>
                  </div>
                </div>
                <button style={styles.calloutBtn}>Configure ➔</button>
              </div>

              <div
                style={{
                  ...styles.launchCallout,
                  borderColor: "rgba(6, 182, 212, 0.35)",
                  backgroundColor: "rgba(6, 182, 212, 0.08)",
                }}
                onClick={() => onOpenKnobsModal({ ...sessionKnobs, initialSourceMode: "document" })}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ ...styles.calloutIcon, background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
                    <FileText size={18} color="#fff" />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>
                      Document Studio <span style={{ fontSize: "10px", padding: "1px 5px", borderRadius: "5px", backgroundColor: "rgba(6, 182, 212, 0.3)", color: "var(--accent-cyan)", marginLeft: "4px" }}>New ✨</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Upload PDF, PPTX, or DOCX for instant AI curriculum deconstruction.
                    </div>
                  </div>
                </div>
                <button style={{ ...styles.calloutBtn, backgroundColor: "rgba(6, 182, 212, 0.25)", color: "#a5f3fc" }}>Upload ➔</button>
              </div>
            </div>

            {/* Preconfigured Curated Sessions */}
            <div style={styles.cardsGrid}>
              {samplePrompts.map((p, idx) => (
                <div
                  key={idx}
                  style={styles.promptCard}
                  onClick={() => {
                    const customKnobs = {
                      topic: p.topic,
                      level: p.level,
                      priorKnowledge: p.priorKnowledge,
                      learningGoal: p.learningGoal,
                      practiceIntensity: p.practiceIntensity,
                      interactionMode: p.interactionMode,
                      timeBudget: p.timeBudget,
                      language: p.language || "hinglish",
                      targetSteps: p.targetSteps,
                      responseLength: p.responseLength,
                      learningStyle: p.learningStyle,
                      verifyFacts: true,
                    };
                    const dynamicPrompt = buildDynamicMilestonePrompt(
                      1,
                      p.targetSteps,
                      p.topic,
                      customKnobs
                    );
                    handleSend(dynamicPrompt, customKnobs, true);
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={styles.promptIcon}>{p.icon}</div>
                    <span style={styles.cardLevelBadge}>{p.level}</span>
                  </div>
                  <div style={styles.promptTitle}>{p.title}</div>
                  <div style={styles.promptDesc}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.messagesList}>
            {(() => {
              const lastAssistantIdx = messages.reduce(
                (lastIdx, m, i) =>
                  m.role === "model" || m.role === "assistant" ? i : lastIdx,
                -1
              );

              return messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                const isLatestAssistant = idx === lastAssistantIdx;

                return (
                  <div
                    key={idx}
                    style={{
                      ...styles.messageRow,
                      justifyContent: isUser ? "flex-end" : "flex-start",
                    }}
                  >
                    {!isUser && (
                      <div style={styles.botAvatar}>
                        <Sparkles size={16} color="#ffffff" />
                      </div>
                    )}

                    <div
                      style={{
                        ...styles.messageBubble,
                        ...(isUser ? styles.userBubble : styles.botBubble),
                      }}
                    >
                      {isUser ? (
                        <div>
                          {msg.messageType === "custom_question" && (
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "11px",
                                fontWeight: "600",
                                color: "var(--accent-cyan)",
                                backgroundColor: "rgba(6, 182, 212, 0.12)",
                                border: "1px solid rgba(6, 182, 212, 0.25)",
                                borderRadius: "4px",
                                padding: "2px 7px",
                                marginBottom: "7px",
                              }}
                            >
                              <MessageCircle size={11} />
                              Custom Question
                            </div>
                          )}
                          <div style={styles.messageContent}>{msg.content}</div>
                        </div>
                      ) : (
                        (() => {
                          const { cleanMarkdown, quiz, doubts } = parseLessonContent(
                            msg.content,
                            sessionKnobs.topic
                          );

                          return (
                            <>
                              <MarkdownRenderer content={cleanMarkdown} />

                              {/* Dynamic Interactive Quiz Checkpoint */}
                              {quiz && (
                                <InteractiveQuizCard
                                  quiz={quiz}
                                  currentStep={sessionKnobs.currentStep}
                                  targetSteps={sessionKnobs.targetSteps}
                                  onProceedNext={handleProceedMilestone}
                                />
                              )}

                              {/* Dynamic Predicted Doubts Buttons */}
                              {isLatestAssistant && doubts && doubts.length > 0 && (
                                <SuggestedDoubts
                                  doubts={doubts}
                                  onSelectDoubt={onAutoAskDoubt}
                                />
                              )}
                            </>
                          );
                        })()
                      )}

                      {!isUser && (
                        <div style={styles.bubbleFooter}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            {msg.messageType === "custom_question" ? (
                              <span
                                style={{
                                  ...styles.tokenTag,
                                  backgroundColor: "rgba(6, 182, 212, 0.14)",
                                  borderColor: "rgba(6, 182, 212, 0.35)",
                                  color: "var(--accent-cyan)",
                                }}
                              >
                                <MessageCircle size={10} />
                                Custom Q Clarification
                              </span>
                            ) : (
                              <span
                                style={{
                                  ...styles.tokenTag,
                                  backgroundColor: "rgba(99, 102, 241, 0.15)",
                                  borderColor: "rgba(99, 102, 241, 0.35)",
                                  color: "#a5b4fc",
                                }}
                              >
                                <Compass size={10} />
                                Milestone {msg.milestoneStep || sessionKnobs.currentStep}
                              </span>
                            )}
                            {msg.usage && (
                              <span style={styles.tokenTag}>
                                {msg.usage.totalTokens || 0} tokens
                              </span>
                            )}
                            <span style={styles.verifiedTagSmall}>
                              <ShieldCheck size={11} color="var(--accent-cyan)" />
                              Ground Truth Verified
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              style={styles.doubtInlineBtn}
                              onClick={onToggleDoubtSidebar}
                              title="Ask a doubt about this lesson"
                            >
                              <HelpCircle size={12} color="var(--accent-cyan)" />
                              <span>Ask Doubt</span>
                            </button>
                            <button
                              style={styles.copyBtn}
                              onClick={() => handleCopy(msg.content, idx)}
                              title="Copy text"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check size={12} color="#10b981" />
                                  <span style={{ color: "#10b981" }}>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div style={styles.userAvatar}>
                        <User size={16} color="#ffffff" />
                      </div>
                    )}
                  </div>
                );
              });
            })()}

            {/* Shimmer generating indicator */}
            {sending && (
              <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
                <div style={styles.botAvatar}>
                  <Sparkles size={16} color="#ffffff" />
                </div>
                <div style={{ ...styles.messageBubble, ...styles.botBubble }}>
                  <div style={styles.thinkingShimmer}>
                    <div style={styles.dot} />
                    <div style={{ ...styles.dot, animationDelay: "0.2s" }} />
                    <div style={{ ...styles.dot, animationDelay: "0.4s" }} />
                    <span style={{ fontSize: "13px", color: "var(--text-muted)", marginLeft: "4px" }}>
                      Nexus AI Tutor is structuring your lesson (Mental Model ➔ Scenarios ➔ Gotchas ➔ Checkpoint)...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Knob-Driven Milestone Action Center: strictly appears at the end of the chat ONLY after the assistant has completed its response */}
            {!sending && messages.length > 0 && (messages[messages.length - 1]?.role === "model" || messages[messages.length - 1]?.role === "assistant") && (
              <div style={styles.milestoneActionCard} className="glass-panel">
                <div style={styles.milestoneStatusRow}>
                  <div
                    style={{
                      ...styles.milestoneProgressPill,
                      ...(sessionKnobs.currentStep >= sessionKnobs.targetSteps
                        ? {
                            backgroundColor: "rgba(16, 185, 129, 0.15)",
                            borderColor: "rgba(16, 185, 129, 0.4)",
                            color: "#34d399",
                          }
                        : {}),
                    }}
                  >
                    {sessionKnobs.currentStep >= sessionKnobs.targetSteps ? (
                      <Sparkles size={14} color="#10b981" />
                    ) : (
                      <Compass size={14} color="var(--accent-cyan)" />
                    )}
                    <span>
                      {sessionKnobs.currentStep >= sessionKnobs.targetSteps
                        ? `🎉 Curriculum Mastery Complete (${sessionKnobs.targetSteps} / ${sessionKnobs.targetSteps})`
                        : `Curriculum Milestone ${sessionKnobs.currentStep} of ${sessionKnobs.targetSteps}`}
                    </span>
                  </div>
                  <span style={styles.milestoneHint}>
                    {sessionKnobs.currentStep < sessionKnobs.targetSteps
                      ? `Active Knobs: ${sessionKnobs.level} • ${sessionKnobs.learningStyle} • ${sessionKnobs.language}`
                      : `Conquered all planned milestones for "${sessionKnobs.topic}"! Explore production edge-cases or launch your next topic.`}
                  </span>
                </div>

                {/* Primary Action Buttons */}
                <div style={styles.actionButtonGroup}>
                  {sessionKnobs.currentStep < sessionKnobs.targetSteps ? (
                    <button
                      style={styles.primaryMilestoneBtn}
                      onClick={handleProceedMilestone}
                      disabled={sending}
                    >
                      <Zap size={15} color="#fff" />
                      <span>Continue to Milestone {sessionKnobs.currentStep + 1} ➔</span>
                    </button>
                  ) : (
                    <>
                      <button
                        style={styles.primaryMilestoneBtn}
                        onClick={() => onOpenKnobsModal(sessionKnobs)}
                        disabled={sending}
                      >
                        <Sparkles size={15} color="#fff" />
                        <span>Launch Next Topic in Knobs Studio ➔</span>
                      </button>
                      <button
                        style={{
                          ...styles.tuneKnobsBtn,
                          borderColor: "rgba(6, 182, 212, 0.4)",
                          color: "var(--accent-cyan)",
                        }}
                        onClick={onToggleDoubtSidebar}
                        title="Review or ask deep doubts"
                      >
                        <HelpCircle size={14} color="var(--accent-cyan)" />
                        <span>Explore Doubts</span>
                      </button>
                    </>
                  )}

                  {/* Expandable Custom Question / Reply Toggle */}
                  <button
                    style={{
                      ...styles.customQuestionToggleBtn,
                      ...(showCustomPrompt ? styles.customQuestionToggleBtnActive : {}),
                    }}
                    onClick={() => setShowCustomPrompt((prev) => !prev)}
                    title="Ask a custom question or explore a tangent without advancing milestone"
                  >
                    <MessageCircle size={14} />
                    <span>{showCustomPrompt ? "Close Custom Question" : "Ask Custom Question"}</span>
                    {sessionKnobs.customQuestionsCount > 0 && (
                      <span
                        style={{
                          marginLeft: "4px",
                          backgroundColor: "rgba(6, 182, 212, 0.2)",
                          color: "var(--accent-cyan)",
                          padding: "1px 6px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {sessionKnobs.customQuestionsCount}
                      </span>
                    )}
                  </button>

                  {/* Tune Knobs */}
                  <button
                    style={styles.tuneKnobsBtn}
                    onClick={() => onOpenKnobsModal(sessionKnobs)}
                    title="Fine-tune learning parameters"
                  >
                    <Sliders size={13} />
                    <span>Tune Knobs</span>
                  </button>
                </div>

                {/* Expandable Custom Prompt Drawer */}
                {showCustomPrompt && (
                  <div style={styles.customPromptDrawer}>
                    <div style={styles.customPromptInputBox}>
                      <textarea
                        ref={textareaRef}
                        rows={2}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ask a custom question on milestone ${sessionKnobs.currentStep} (won't skip milestone, counted separately)...`}
                        style={styles.customTextarea}
                      />
                      <button
                        onClick={() => {
                          if (input.trim() && !sending) {
                            handleSend(input, sessionKnobs, false);
                            setShowCustomPrompt(false);
                          }
                        }}
                        disabled={!input.trim() || sending}
                        style={{
                          ...styles.customSendBtn,
                          opacity: input.trim() && !sending ? 1 : 0.4,
                          cursor: input.trim() && !sending ? "pointer" : "not-allowed",
                        }}
                      >
                        <Send size={15} color="#ffffff" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--bg-dark)",
    position: "relative",
    overflow: "hidden",
  },
  topbar: {
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 22px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(10, 15, 29, 0.88)",
    backdropFilter: "blur(16px)",
    zIndex: 10,
    gap: "16px",
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },
  menuToggle: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "var(--text-secondary)",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    cursor: "pointer",
    flexShrink: 0,
  },
  topicInfoGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  topicIconBadge: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #6366f1, #06b6d4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 12px rgba(99, 102, 241, 0.4)",
    flexShrink: 0,
  },
  topicTextContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flexShrink: 0,
  },
  sessionTopic: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#ffffff",
    maxWidth: "220px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  topicSubStep: {
    fontSize: "11px",
    color: "var(--accent-cyan)",
    fontWeight: "600",
    letterSpacing: "0.2px",
  },
  navDivider: {
    width: "1px",
    height: "22px",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    margin: "0 4px",
    flexShrink: 0,
  },
  badgesCluster: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "nowrap",
    overflowX: "auto",
    scrollbarWidth: "none",
    minWidth: 0,
  },
  levelBadge: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#c084fc",
    backgroundColor: "rgba(168, 85, 247, 0.12)",
    border: "1px solid rgba(168, 85, 247, 0.25)",
    padding: "5px 10px",
    borderRadius: "20px",
  },
  langBadge: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    fontWeight: "600",
    padding: "5px 10px",
    borderRadius: "20px",
  },
  goalBadge: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#fbbf24",
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    border: "1px solid rgba(245, 158, 11, 0.25)",
    padding: "5px 10px",
    borderRadius: "20px",
  },
  timeBadge: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--accent-cyan)",
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    border: "1px solid rgba(6, 182, 212, 0.25)",
    padding: "5px 10px",
    borderRadius: "20px",
  },
  quizBadge: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#a78bfa",
    backgroundColor: "rgba(167, 139, 250, 0.12)",
    border: "1px solid rgba(167, 139, 250, 0.25)",
    padding: "5px 10px",
    borderRadius: "20px",
  },
  stepBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--accent-emerald)",
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    padding: "4px 8px",
    borderRadius: "20px",
  },
  verifiedTag: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#34d399",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.25)",
    padding: "5px 10px",
    borderRadius: "20px",
  },
  progressTrack: {
    width: "100%",
    height: "3px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, #6366f1, #06b6d4)",
    transition: "width 0.4s ease",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  knobConfigBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "9px",
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    border: "1px solid rgba(99, 102, 241, 0.35)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  doubtCopilotBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 14px",
    borderRadius: "9px",
    border: "1px solid",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tokenPill: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 12px",
    borderRadius: "20px",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-secondary)",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 20px",
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    borderBottom: "1px solid rgba(244, 63, 94, 0.3)",
    color: "#fecdd3",
    fontSize: "13px",
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 0 40px 0",
  },
  heroContainer: {
    maxWidth: "980px",
    margin: "0 auto",
    padding: "36px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  heroBadge: {
    width: "60px",
    height: "60px",
    borderRadius: "var(--radius-xl)",
    background: "var(--gradient-brand)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
    boxShadow: "0 0 35px rgba(99, 102, 241, 0.5)",
  },
  heroTitle: {
    fontSize: "34px",
    fontWeight: "800",
    color: "var(--text-primary)",
    marginBottom: "10px",
    background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #818cf8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "14.5px",
    color: "var(--text-secondary)",
    maxWidth: "580px",
    lineHeight: "1.6",
    marginBottom: "24px",
  },
  launchCallout: {
    width: "100%",
    padding: "16px 20px",
    borderRadius: "var(--radius-lg)",
    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(6, 182, 212, 0.18) 100%)",
    border: "1px solid var(--border-highlight)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    marginBottom: "28px",
    boxShadow: "var(--shadow-glow)",
  },
  calloutIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "var(--radius-md)",
    background: "var(--gradient-brand)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  calloutBtn: {
    padding: "8px 16px",
    borderRadius: "var(--radius-md)",
    background: "var(--gradient-brand)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "14px",
    width: "100%",
  },
  promptCard: {
    padding: "18px",
    borderRadius: "var(--radius-lg)",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    border: "1px solid var(--border-subtle)",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  cardLevelBadge: {
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--accent-purple)",
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    padding: "2px 6px",
    borderRadius: "var(--radius-sm)",
  },
  promptIcon: {
    marginBottom: "4px",
  },
  promptTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-primary)",
    marginBottom: "4px",
  },
  promptDesc: {
    fontSize: "12px",
    color: "var(--text-muted)",
    lineHeight: "1.45",
  },
  messagesList: {
    maxWidth: "1020px",
    margin: "0 auto",
    padding: "0 28px",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    width: "100%",
  },
  messageRow: {
    display: "flex",
    gap: "14px",
    width: "100%",
    animation: "fadeIn 0.25s ease",
  },
  botAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "var(--radius-md)",
    background: "var(--gradient-brand)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "2px",
  },
  userAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "var(--radius-md)",
    background: "linear-gradient(135deg, #334155, #475569)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "2px",
  },
  messageBubble: {
    borderRadius: "18px",
    fontSize: "15px",
    lineHeight: "1.8",
  },
  userBubble: {
    maxWidth: "82%",
    padding: "16px 22px",
    background: "var(--gradient-bubble-user)",
    color: "#ffffff",
    borderBottomRightRadius: "4px",
    boxShadow: "0 4px 18px rgba(99, 102, 241, 0.28)",
  },
  botBubble: {
    width: "100%",
    maxWidth: "100%",
    padding: "24px 28px",
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "var(--text-primary)",
    borderBottomLeftRadius: "4px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
  },
  messageContent: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  bubbleFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "12px",
    paddingTop: "10px",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  tokenTag: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: "2px 6px",
    borderRadius: "var(--radius-sm)",
  },
  verifiedTagSmall: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    color: "var(--accent-cyan)",
    fontSize: "11px",
  },
  doubtInlineBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "rgba(6, 182, 212, 0.12)",
    color: "var(--accent-cyan)",
    padding: "3px 8px",
    borderRadius: "var(--radius-sm)",
    fontSize: "11px",
    fontWeight: "600",
  },
  copyBtn: {
    background: "transparent",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
  },
  thinkingShimmer: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 0",
  },
  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "var(--primary)",
    animation: "pulseGlow 1.4s infinite ease-in-out",
  },
  milestoneActionCard: {
    margin: "24px 0 10px 0",
    padding: "16px 20px",
    borderRadius: "var(--radius-xl)",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    border: "1px solid var(--border-highlight)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4), var(--shadow-glow)",
  },
  milestoneStatusRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },
  milestoneProgressPill: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "var(--radius-full)",
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    border: "1px solid rgba(6, 182, 212, 0.3)",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--accent-cyan)",
  },
  milestoneHint: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  actionButtonGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryMilestoneBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderRadius: "var(--radius-md)",
    background: "var(--gradient-brand)",
    color: "#ffffff",
    fontSize: "13.5px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(99, 102, 241, 0.4)",
    transition: "all 0.2s ease",
  },
  customQuestionToggleBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 15px",
    borderRadius: "var(--radius-md)",
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  customQuestionToggleBtnActive: {
    backgroundColor: "rgba(99, 102, 241, 0.18)",
    borderColor: "var(--primary)",
    color: "var(--text-primary)",
  },
  tuneKnobsBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-muted)",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    marginLeft: "auto",
  },
  customPromptDrawer: {
    marginTop: "14px",
    paddingTop: "14px",
    borderTop: "1px solid var(--border-subtle)",
  },
  customPromptInputBox: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    backgroundColor: "rgba(11, 15, 23, 0.9)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border-subtle)",
    padding: "10px 14px",
  },
  customTextarea: {
    flex: 1,
    background: "transparent",
    color: "var(--text-primary)",
    fontSize: "13.5px",
    lineHeight: "1.5",
    resize: "none",
    maxHeight: "120px",
    padding: "4px",
  },
  customSendBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "var(--radius-md)",
    background: "var(--gradient-brand)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginBottom: "2px",
    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)",
  },
  quickNewBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "var(--gradient-brand)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.35)",
    transition: "transform 0.15s ease",
    flexShrink: 0,
  },
  floatingSidebarTab: {
    position: "absolute",
    left: "0",
    top: "76px",
    zIndex: 25,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 12px 7px 9px",
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    border: "1px solid rgba(99, 102, 241, 0.35)",
    borderLeft: "none",
    borderRadius: "0 10px 10px 0",
    boxShadow: "0 4px 18px rgba(0, 0, 0, 0.45), 0 0 12px rgba(99, 102, 241, 0.25)",
    cursor: "pointer",
    backdropFilter: "blur(12px)",
    color: "#e2e8f0",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  floatingSidebarText: {
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.3px",
    color: "#cbd5e1",
  },
};
