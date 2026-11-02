import React, { useState } from "react";
import {
  X,
  Sliders,
  Sparkles,
  BookOpen,
  Gauge,
  Layers,
  FileText,
  ShieldCheck,
  Zap,
  Target,
  BrainCircuit,
  Flame,
  Clock,
  Compass,
  Code2,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Languages,
  UploadCloud,
} from "lucide-react";

export const TutorKnobsModal = ({
  isOpen,
  onClose,
  onLaunchSession,
  initialTopic = "",
  initialKnobs = {},
}) => {
  const [activeTab, setActiveTab] = useState("curriculum"); // "curriculum" | "pedagogy"
  const [sourceMode, setSourceMode] = useState("topic"); // "topic" | "document"
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);
  const [topic, setTopic] = useState(initialTopic || "Node.js Event Loop & Libuv Architecture");

  // Core Knobs
  const [level, setLevel] = useState(initialKnobs.level || "intermediate");
  const [priorKnowledge, setPriorKnowledge] = useState(initialKnobs.priorKnowledge || "basics");
  const [learningGoal, setLearningGoal] = useState(initialKnobs.learningGoal || "understand_concepts");
  const [language, setLanguage] = useState(initialKnobs.language || "hinglish");
  const [targetSteps, setTargetSteps] = useState(initialKnobs.targetSteps || 4);
  const [timeBudget, setTimeBudget] = useState(initialKnobs.timeBudget || "30_mins");
  const [interactionMode, setInteractionMode] = useState(initialKnobs.interactionMode || "explain_first");
  const [practiceIntensity, setPracticeIntensity] = useState(initialKnobs.practiceIntensity || "balanced");
  const [questionsPerMilestone, setQuestionsPerMilestone] = useState(Number(initialKnobs.questionsPerMilestone) || 3);
  const [responseLength, setResponseLength] = useState(initialKnobs.responseLength || "standard");
  const [learningStyle, setLearningStyle] = useState(initialKnobs.learningStyle || "hands_on");

  // Sync state whenever modal opens or initialKnobs change
  React.useEffect(() => {
    if (isOpen) {
      if (initialKnobs.initialSourceMode) setSourceMode(initialKnobs.initialSourceMode);
      if (initialTopic) setTopic(initialTopic);
      if (initialKnobs.level) setLevel(initialKnobs.level);
      if (initialKnobs.priorKnowledge) setPriorKnowledge(initialKnobs.priorKnowledge);
      if (initialKnobs.learningGoal) setLearningGoal(initialKnobs.learningGoal);
      if (initialKnobs.language) setLanguage(initialKnobs.language);
      if (initialKnobs.targetSteps) setTargetSteps(Number(initialKnobs.targetSteps));
      if (initialKnobs.timeBudget) setTimeBudget(initialKnobs.timeBudget);
      if (initialKnobs.interactionMode) setInteractionMode(initialKnobs.interactionMode);
      if (initialKnobs.practiceIntensity) setPracticeIntensity(initialKnobs.practiceIntensity);
      if (initialKnobs.questionsPerMilestone) setQuestionsPerMilestone(Number(initialKnobs.questionsPerMilestone));
      if (initialKnobs.responseLength) setResponseLength(initialKnobs.responseLength);
      if (initialKnobs.learningStyle) setLearningStyle(initialKnobs.learningStyle);
    }
  }, [isOpen, initialTopic, initialKnobs]);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("File size exceeds 15MB limit. Please choose a smaller file.");
      return;
    }
    setSelectedFile(file);
    const guessedTopic = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
    if (guessedTopic) {
      setTopic(guessedTopic);
    }
  };

  if (!isOpen) return null;

  const handleLaunch = (e) => {
    e.preventDefault();
    if (sourceMode === "document" && !selectedFile) {
      alert("Please select or drop a study document (PDF, PPTX, DOCX, or TXT) first.");
      return;
    }

    const finalTopic = topic.trim() || (initialTopic && initialTopic.trim()) || (selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : "Quantum Superposition");

    onLaunchSession({
      topic: finalTopic,
      sourceMode,
      documentFile: sourceMode === "document" ? selectedFile : null,
      level,
      priorKnowledge,
      learningGoal,
      practiceIntensity,
      interactionMode,
      timeBudget,
      language,
      targetSteps: Number(targetSteps),
      questionsPerMilestone: Number(questionsPerMilestone) || 3,
      responseLength,
      learningStyle,
      verifyFacts: true, // Strict Ground Truth always enforced
    });
    onClose();
  };

  // 0. Language Options
  const languageOptions = [
    {
      id: "hinglish",
      label: "Hinglish (Khatarnak Teacher)",
      badge: "🔥 Recommended",
      icon: <Languages size={17} color="var(--accent-cyan)" />,
    },
    {
      id: "english",
      label: "English (Direct & Modern)",
      badge: "🌐 Global",
      icon: <Languages size={17} color="var(--primary)" />,
    },
  ];

  // 1. Prior Knowledge Options
  const priorKnowledgeOptions = [
    {
      id: "zero",
      label: "Starting from Zero",
      icon: <BrainCircuit size={17} color="var(--accent-cyan)" />,
    },
    {
      id: "basics",
      label: "Know the Basics",
      icon: <BookOpen size={17} color="var(--primary)" />,
    },
    {
      id: "experienced",
      label: "Some Experience",
      icon: <Zap size={17} color="var(--accent-purple)" />,
    },
  ];

  // 2. Learning Goal Options
  const learningGoalOptions = [
    {
      id: "understand_concepts",
      label: "Understand Concepts",
      icon: <Compass size={17} color="var(--accent-cyan)" />,
    },
    {
      id: "build_projects",
      label: "Build Projects",
      icon: <Code2 size={17} color="var(--accent-emerald)" />,
    },
    {
      id: "interview_prep",
      label: "Interview Preparation",
      icon: <Target size={17} color="#f59e0b" />,
    },
    {
      id: "master_internals",
      label: "Master Internals",
      icon: <BrainCircuit size={17} color="var(--accent-purple)" />,
    },
  ];

  // 3. Difficulty Level Options
  const levelOptions = [
    { id: "beginner", label: "Beginner", icon: <Gauge size={16} color="var(--accent-emerald)" /> },
    { id: "intermediate", label: "Intermediate", icon: <Gauge size={16} color="var(--accent-cyan)" /> },
    { id: "advanced", label: "Advanced", icon: <Gauge size={16} color="var(--accent-purple)" /> },
    { id: "expert", label: "Expert", icon: <Gauge size={16} color="#f43f5e" /> },
  ];

  // 4. Time Budget Options
  const timeBudgetOptions = [
    { id: "15_mins", label: "15 Minutes", icon: <Clock size={16} color="var(--accent-cyan)" /> },
    { id: "30_mins", label: "30 Minutes", icon: <Clock size={16} color="var(--primary)" /> },
    { id: "60_mins", label: "60 Minutes", icon: <Clock size={16} color="var(--accent-purple)" /> },
    { id: "no_limit", label: "No Limit", icon: <Clock size={16} color="var(--accent-emerald)" /> },
  ];

  // 5. Interaction Mode Options
  const interactionModeOptions = [
    {
      id: "explain_first",
      label: "Explain First",
      icon: <BookOpen size={17} color="var(--accent-cyan)" />,
    },
    {
      id: "socratic",
      label: "Interactive Socratic",
      icon: <HelpCircle size={17} color="var(--primary)" />,
    },
    {
      id: "learn_by_doing",
      label: "Learn by Doing",
      icon: <Code2 size={17} color="var(--accent-emerald)" />,
    },
  ];

  // 6. Practice Intensity Options
  const practiceIntensityOptions = [
    {
      id: "light",
      label: "Light",
      icon: <CheckCircle2 size={17} color="var(--accent-cyan)" />,
    },
    {
      id: "balanced",
      label: "Balanced",
      icon: <Zap size={17} color="var(--primary)" />,
    },
    {
      id: "challenge_mode",
      label: "Challenge Mode 🔥",
      icon: <Flame size={17} color="#f43f5e" />,
    },
  ];

  // 6b. Questions Per Milestone Options
  const questionsPerMilestoneOptions = [
    { id: 1, label: "1 Question", icon: <HelpCircle size={17} color="var(--accent-cyan)" /> },
    { id: 3, label: "3 Questions", badge: "Recommended", icon: <HelpCircle size={17} color="var(--primary)" /> },
    { id: 5, label: "5 Questions", icon: <HelpCircle size={17} color="var(--accent-purple)" /> },
  ];

  // 7. Response Length Options
  const lengthOptions = [
    { id: "concise", label: "Concise", icon: <FileText size={16} /> },
    { id: "standard", label: "Standard", icon: <FileText size={16} /> },
    { id: "deep_dive", label: "Deep Dive", icon: <FileText size={16} /> },
  ];

  // 8. Style Options
  const styleOptions = [
    { id: "hands_on", label: "Hands-on Code", icon: <Layers size={16} color="var(--accent-emerald)" /> },
    { id: "conceptual", label: "Concept First", icon: <BookOpen size={16} color="var(--accent-cyan)" /> },
    { id: "debugging_gotchas", label: "Bug Hunting & Gotchas", icon: <Zap size={16} color="#f43f5e" /> },
  ];

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="glass-panel">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleRow}>
            <div style={styles.iconBadge}>
              <Sliders size={18} color="#fff" />
            </div>
            <div>
              <h2 style={styles.title}>Nexus AI Tutor Studio</h2>
              <p style={styles.subtitle}>Configure your custom learning session & pedagogical knobs</p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose} title="Close Studio">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation Pill Bar (Prevents overcrowding) */}
        <div style={styles.tabBar}>
          <button
            type="button"
            onClick={() => setActiveTab("curriculum")}
            style={{
              ...styles.tabBtn,
              backgroundColor: activeTab === "curriculum" ? "rgba(99, 102, 241, 0.2)" : "transparent",
              color: activeTab === "curriculum" ? "#ffffff" : "var(--text-muted)",
              borderColor: activeTab === "curriculum" ? "var(--primary)" : "transparent",
            }}
          >
            <BookOpen size={14} />
            <span>1. Curriculum & Goals</span>
            <span style={styles.tabBadge}>5 Knobs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pedagogy")}
            style={{
              ...styles.tabBtn,
              backgroundColor: activeTab === "pedagogy" ? "rgba(99, 102, 241, 0.2)" : "transparent",
              color: activeTab === "pedagogy" ? "#ffffff" : "var(--text-muted)",
              borderColor: activeTab === "pedagogy" ? "var(--primary)" : "transparent",
            }}
          >
            <Gauge size={14} />
            <span>2. Pedagogy & Dynamics</span>
            <span style={styles.tabBadge}>6 Knobs</span>
          </button>
        </div>

        <form onSubmit={handleLaunch} style={styles.form}>
          {/* =================================================== */}
          {/* TAB 1: CURRICULUM & GOALS */}
          {/* =================================================== */}
          {activeTab === "curriculum" && (
            <div style={styles.tabContent}>
              {/* SOURCE SELECTOR: TOPIC VS DOCUMENT */}
              <div style={styles.sourceSelectorRow}>
                <button
                  type="button"
                  onClick={() => setSourceMode("topic")}
                  style={{
                    ...styles.sourceBtn,
                    backgroundColor: sourceMode === "topic" ? "rgba(99, 102, 241, 0.22)" : "rgba(255, 255, 255, 0.03)",
                    borderColor: sourceMode === "topic" ? "var(--primary)" : "rgba(255, 255, 255, 0.08)",
                    color: sourceMode === "topic" ? "#ffffff" : "var(--text-muted)",
                  }}
                >
                  <BookOpen size={15} color={sourceMode === "topic" ? "var(--accent-cyan)" : "currentColor"} />
                  <span>Topic Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceMode("document")}
                  style={{
                    ...styles.sourceBtn,
                    backgroundColor: sourceMode === "document" ? "rgba(6, 182, 212, 0.2)" : "rgba(255, 255, 255, 0.03)",
                    borderColor: sourceMode === "document" ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.08)",
                    color: sourceMode === "document" ? "#ffffff" : "var(--text-muted)",
                  }}
                >
                  <UploadCloud size={15} color={sourceMode === "document" ? "var(--accent-cyan)" : "currentColor"} />
                  <span>Upload Document (PDF, PPT, DOC)</span>
                  <span style={styles.newFeatureBadge}>New ✨</span>
                </button>
              </div>

              {sourceMode === "document" ? (
                /* DOCUMENT UPLOAD DROPZONE */
                <div style={styles.section}>
                  <label style={styles.sectionLabel}>
                    <UploadCloud size={14} color="var(--accent-cyan)" />
                    <span>Upload Study Document</span>
                  </label>

                  {!selectedFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileSelect(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        ...styles.dropzone,
                        borderColor: isDragging ? "var(--accent-cyan)" : "rgba(6, 182, 212, 0.35)",
                        backgroundColor: isDragging ? "rgba(6, 182, 212, 0.12)" : "rgba(6, 182, 212, 0.04)",
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.pptx,.ppt,.docx,.doc,.txt,.md"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelect(e.target.files[0]);
                          }
                        }}
                        style={{ display: "none" }}
                      />
                      <div style={styles.dropzoneIcon}>
                        <UploadCloud size={24} color="var(--accent-cyan)" />
                      </div>
                      <div style={styles.dropzoneTitle}>
                        Drag & Drop or <span style={{ color: "var(--accent-cyan)", textDecoration: "underline" }}>Browse</span>
                      </div>
                      <div style={styles.dropzoneSub}>
                        Supports PDF, PPTX, DOCX, TXT, MD (Max 15MB)
                      </div>
                    </div>
                  ) : (
                    <div style={styles.filePreviewCard}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                        <div style={styles.fileIconBadge}>
                          <FileText size={18} color="var(--accent-cyan)" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                          <span style={styles.fileName}>{selectedFile.name}</span>
                          <span style={styles.fileMeta}>
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI Curriculum Deconstruction
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        style={styles.fileRemoveBtn}
                        title="Remove file"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  )}

                  {/* Optional Topic override */}
                  <div style={{ marginTop: "12px" }}>
                    <label style={{ ...styles.sectionLabel, fontSize: "12px", marginBottom: "6px" }}>
                      <span>Session Topic Title (Auto-inferred from document, editable)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Operating Systems - Memory Management"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      style={styles.topicInput}
                    />
                  </div>
                </div>
              ) : (
                /* 1. TOPIC INPUT */
                <div style={styles.section}>
                  <label style={styles.sectionLabel}>
                    <BookOpen size={14} color="var(--accent-cyan)" />
                    <span>Topic or Concept to Master</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Write here any topic which you want to master"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    style={styles.topicInput}
                    autoFocus
                  />
                </div>
              )}

              {/* 2. LANGUAGE & TEACHER PERSONA KNOB */}
              <div style={styles.section}>
                <label style={styles.sectionLabel}>
                  <Languages size={15} color="var(--accent-cyan)" />
                  <span>Teaching Language & Persona</span>
                </label>
                <div style={styles.grid2}>
                  {languageOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setLanguage(opt.id)}
                      style={{
                        ...styles.knobCard,
                        borderColor: language === opt.id ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.08)",
                        backgroundColor:
                          language === opt.id
                            ? "rgba(6, 182, 212, 0.2)"
                            : "rgba(15, 23, 42, 0.6)",
                        boxShadow:
                          language === opt.id ? "0 0 20px rgba(6, 182, 212, 0.35)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                        {opt.icon}
                        <span style={styles.knobCardTitle}>{opt.label}</span>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "var(--radius-full)",
                          backgroundColor:
                            language === opt.id ? "rgba(6, 182, 212, 0.3)" : "rgba(255, 255, 255, 0.06)",
                          color: language === opt.id ? "#a5f3fc" : "var(--text-muted)",
                          fontWeight: "600",
                        }}
                      >
                        {opt.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. PRIOR KNOWLEDGE KNOB */}
              <div style={styles.section}>
                <label style={styles.sectionLabel}>
                  <BrainCircuit size={15} color="var(--primary)" />
                  <span>Prior Knowledge Baseline</span>
                </label>
                <div style={styles.grid3}>
                  {priorKnowledgeOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setPriorKnowledge(opt.id)}
                      style={{
                        ...styles.knobCard,
                        borderColor: priorKnowledge === opt.id ? "var(--primary)" : "rgba(255, 255, 255, 0.08)",
                        backgroundColor:
                          priorKnowledge === opt.id
                            ? "rgba(99, 102, 241, 0.22)"
                            : "rgba(15, 23, 42, 0.6)",
                        boxShadow:
                          priorKnowledge === opt.id ? "0 0 20px rgba(99, 102, 241, 0.35)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {opt.icon}
                        <span style={styles.knobCardTitle}>{opt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. LEARNING GOAL KNOB */}
              <div style={styles.section}>
                <label style={styles.sectionLabel}>
                  <Target size={15} color="#f59e0b" />
                  <span>Target Learning Goal</span>
                </label>
                <div style={styles.grid4}>
                  {learningGoalOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setLearningGoal(opt.id)}
                      style={{
                        ...styles.knobCard,
                        borderColor: learningGoal === opt.id ? "#f59e0b" : "rgba(255, 255, 255, 0.08)",
                        backgroundColor:
                          learningGoal === opt.id
                            ? "rgba(245, 158, 11, 0.2)"
                            : "rgba(15, 23, 42, 0.6)",
                        boxShadow:
                          learningGoal === opt.id ? "0 0 20px rgba(245, 158, 11, 0.35)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {opt.icon}
                        <span style={styles.knobCardTitle}>{opt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. LEVEL / DIFFICULTY RATING */}
              <div style={styles.section}>
                <label style={styles.sectionLabel}>
                  <Gauge size={15} color="var(--accent-purple)" />
                  <span>Depth & Difficulty Rating</span>
                </label>
                <div style={styles.grid4}>
                  {levelOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setLevel(opt.id)}
                      style={{
                        ...styles.knobCard,
                        borderColor: level === opt.id ? "var(--accent-purple)" : "rgba(255, 255, 255, 0.08)",
                        backgroundColor:
                          level === opt.id
                            ? "rgba(168, 85, 247, 0.22)"
                            : "rgba(15, 23, 42, 0.6)",
                        boxShadow:
                          level === opt.id ? "0 0 20px rgba(168, 85, 247, 0.35)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {opt.icon}
                        <span style={styles.knobCardTitle}>{opt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Tab Prompt Button */}
              <button
                type="button"
                onClick={() => setActiveTab("pedagogy")}
                style={styles.nextTabBtn}
              >
                <span>Tune Pedagogy, Pacing & Intensity</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* =================================================== */}
          {/* TAB 2: PEDAGOGY, DYNAMICS & PACING */}
          {/* =================================================== */}
          {activeTab === "pedagogy" && (
            <div style={styles.tabContent}>
              {/* 5. MILESTONE COUNT & TIME BUDGET */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {/* Milestones count */}
                <div style={styles.section}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={styles.sectionLabel}>
                      <Layers size={14} color="var(--accent-purple)" />
                      <span>Milestones Count</span>
                    </label>
                    <span style={styles.stepBadge}>{targetSteps} Steps</span>
                  </div>
                  <div style={styles.sliderRow}>
                    {[3, 5, 8, 10].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setTargetSteps(num)}
                        style={{
                          ...styles.stepBtn,
                          backgroundColor:
                            targetSteps === num ? "var(--primary)" : "rgba(255, 255, 255, 0.05)",
                          color: targetSteps === num ? "#fff" : "var(--text-secondary)",
                          borderColor:
                            targetSteps === num ? "var(--border-highlight)" : "var(--border-subtle)",
                        }}
                      >
                        {num} Steps
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Budget */}
                <div style={styles.section}>
                  <label style={styles.sectionLabel}>
                    <Clock size={15} color="var(--accent-cyan)" />
                    <span>Time Budget</span>
                  </label>
                  <div style={styles.grid2}>
                    {timeBudgetOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setTimeBudget(opt.id)}
                        style={{
                          ...styles.knobCard,
                          borderColor: timeBudget === opt.id ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.08)",
                          backgroundColor:
                            timeBudget === opt.id
                              ? "rgba(6, 182, 212, 0.2)"
                              : "rgba(15, 23, 42, 0.6)",
                          boxShadow:
                            timeBudget === opt.id ? "0 0 16px rgba(6, 182, 212, 0.3)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {opt.icon}
                          <span style={styles.knobCardTitle}>{opt.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6. INTERACTION MODE */}
              <div style={styles.section}>
                <label style={styles.sectionLabel}>
                  <HelpCircle size={15} color="var(--accent-cyan)" />
                  <span>Interaction Mode</span>
                </label>
                <div style={styles.grid3}>
                  {interactionModeOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setInteractionMode(opt.id)}
                      style={{
                        ...styles.knobCard,
                        borderColor:
                          interactionMode === opt.id ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.08)",
                        backgroundColor:
                          interactionMode === opt.id
                            ? "rgba(6, 182, 212, 0.2)"
                            : "rgba(15, 23, 42, 0.6)",
                        boxShadow:
                          interactionMode === opt.id ? "0 0 16px rgba(6, 182, 212, 0.3)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {opt.icon}
                        <span style={styles.knobCardTitle}>{opt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. PRACTICE INTENSITY */}
              <div style={styles.section}>
                <label style={styles.sectionLabel}>
                  <Flame size={15} color="#f43f5e" />
                  <span>Practice Intensity</span>
                </label>
                <div style={styles.grid3}>
                  {practiceIntensityOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setPracticeIntensity(opt.id)}
                      style={{
                        ...styles.knobCard,
                        borderColor:
                          practiceIntensity === opt.id ? "#f43f5e" : "rgba(255, 255, 255, 0.08)",
                        backgroundColor:
                          practiceIntensity === opt.id
                            ? "rgba(244, 63, 94, 0.2)"
                            : "rgba(15, 23, 42, 0.6)",
                        boxShadow:
                          practiceIntensity === opt.id ? "0 0 16px rgba(244, 63, 94, 0.35)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {opt.icon}
                        <span style={styles.knobCardTitle}>{opt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 8. CHECKPOINT QUIZ QUESTIONS PER MILESTONE */}
              <div style={styles.section}>
                <label style={styles.sectionLabel}>
                  <HelpCircle size={15} color="var(--accent-cyan)" />
                  <span>Checkpoint Quiz Questions per Milestone</span>
                </label>
                <div style={styles.grid3}>
                  {questionsPerMilestoneOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setQuestionsPerMilestone(opt.id)}
                      style={{
                        ...styles.knobCard,
                        borderColor:
                          questionsPerMilestone === opt.id ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.08)",
                        backgroundColor:
                          questionsPerMilestone === opt.id
                            ? "rgba(6, 182, 212, 0.2)"
                            : "rgba(15, 23, 42, 0.6)",
                        boxShadow:
                          questionsPerMilestone === opt.id ? "0 0 16px rgba(6, 182, 212, 0.3)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                        {opt.icon}
                        <span style={styles.knobCardTitle}>{opt.label}</span>
                      </div>
                      {opt.badge && (
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 7px",
                            borderRadius: "var(--radius-full)",
                            backgroundColor:
                              questionsPerMilestone === opt.id
                                ? "rgba(6, 182, 212, 0.3)"
                                : "rgba(255, 255, 255, 0.06)",
                            color: questionsPerMilestone === opt.id ? "#a5f3fc" : "var(--text-muted)",
                            fontWeight: "600",
                          }}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 9. RESPONSE SIZE & LEARNING STYLE */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {/* Length */}
                <div style={styles.section}>
                  <label style={styles.sectionLabel}>
                    <FileText size={15} color="var(--accent-emerald)" />
                    <span>Response Depth</span>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {lengthOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setResponseLength(opt.id)}
                        style={{
                          ...styles.knobCard,
                          borderColor:
                            responseLength === opt.id ? "var(--accent-emerald)" : "rgba(255, 255, 255, 0.08)",
                          backgroundColor:
                            responseLength === opt.id
                              ? "rgba(16, 185, 129, 0.2)"
                              : "rgba(15, 23, 42, 0.6)",
                          boxShadow:
                            responseLength === opt.id ? "0 0 16px rgba(16, 185, 129, 0.3)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {opt.icon}
                          <span style={styles.knobCardTitle}>{opt.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div style={styles.section}>
                  <label style={styles.sectionLabel}>
                    <Layers size={15} color="var(--primary)" />
                    <span>Pedagogical Style</span>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {styleOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setLearningStyle(opt.id)}
                        style={{
                          ...styles.knobCard,
                          borderColor:
                            learningStyle === opt.id ? "var(--primary)" : "rgba(255, 255, 255, 0.08)",
                          backgroundColor:
                            learningStyle === opt.id
                              ? "rgba(99, 102, 241, 0.22)"
                              : "rgba(15, 23, 42, 0.6)",
                          boxShadow:
                            learningStyle === opt.id ? "0 0 16px rgba(99, 102, 241, 0.35)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {opt.icon}
                          <span style={styles.knobCardTitle}>{opt.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Back to Tab 1 Button */}
              <button
                type="button"
                onClick={() => setActiveTab("curriculum")}
                style={styles.backTabBtn}
              >
                <ArrowLeft size={14} />
                <span>Review Curriculum & Goals</span>
              </button>
            </div>
          )}

          {/* =================================================== */}
          {/* PERSISTENT GROUND TRUTH & ACTIVE CONFIG RIBBON */}
          {/* =================================================== */}
          <div style={styles.groundTruthBar}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#a5f3fc" }}>
                Strict Ground Truth: ALWAYS ACTIVE
              </span>
            </div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Zero Hallucinations • Syntactic Verification • Specification Checks Enforced
            </span>
          </div>

          {/* LAUNCH BUTTON */}
          <button type="submit" style={styles.launchBtn}>
            <Sparkles size={18} />
            <span>
              {sourceMode === "document" && selectedFile
                ? `Launch Document Studio (${selectedFile.name.slice(0, 24)}...)`
                : "Launch Personalized Learning Studio"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
    animation: "fadeIn 0.2s ease",
  },
  modal: {
    width: "100%",
    maxWidth: "760px",
    maxHeight: "92vh",
    overflowY: "auto",
    borderRadius: "var(--radius-xl)",
    backgroundColor: "#0b0f19",
    border: "1px solid var(--border-highlight)",
    boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), var(--shadow-glow)",
    padding: "24px 28px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  iconBadge: {
    width: "38px",
    height: "38px",
    borderRadius: "var(--radius-md)",
    background: "var(--gradient-brand)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
  },
  title: {
    fontSize: "19px",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  subtitle: {
    fontSize: "12px",
    color: "var(--text-muted)",
    marginTop: "2px",
  },
  closeBtn: {
    background: "transparent",
    color: "var(--text-muted)",
    padding: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    display: "flex",
    gap: "8px",
    padding: "4px",
    borderRadius: "var(--radius-lg)",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    border: "1px solid var(--border-subtle)",
    marginBottom: "18px",
  },
  tabBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "var(--radius-md)",
    border: "1px solid transparent",
    fontSize: "12.5px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tabBadge: {
    fontSize: "10.5px",
    padding: "2px 6px",
    borderRadius: "var(--radius-full)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  tabContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  sectionLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#f8fafc",
    letterSpacing: "0.1px",
  },
  topicInput: {
    width: "100%",
    padding: "14px 18px",
    backgroundColor: "rgba(11, 18, 33, 0.95)",
    border: "1.5px solid rgba(99, 102, 241, 0.4)",
    borderRadius: "14px",
    color: "#ffffff",
    fontSize: "14.5px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.4), inset 0 1px 3px rgba(0,0,0,0.5)",
    transition: "all 0.2s ease",
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "10px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  knobCard: {
    padding: "14px 18px",
    borderRadius: "14px",
    border: "1.5px solid rgba(255, 255, 255, 0.08)",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "54px",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    outline: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  knobCardTitle: {
    fontSize: "13.5px",
    fontWeight: "600",
    color: "#f8fafc",
    letterSpacing: "-0.2px",
  },
  stepBadge: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--accent-purple)",
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    padding: "2px 8px",
    borderRadius: "var(--radius-full)",
  },
  sliderRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "6px",
  },
  stepBtn: {
    padding: "8px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-subtle)",
    fontSize: "11.5px",
    fontWeight: "600",
    cursor: "pointer",
  },
  styleBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-subtle)",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
  },
  nextTabBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "10px",
    borderRadius: "var(--radius-md)",
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    color: "#c7d2fe",
    fontSize: "12.5px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "4px",
  },
  backTabBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px",
    borderRadius: "var(--radius-md)",
    backgroundColor: "transparent",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-muted)",
    fontSize: "12px",
    cursor: "pointer",
  },
  groundTruthBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 18px",
    borderRadius: "12px",
    backgroundColor: "rgba(6, 182, 212, 0.06)",
    border: "1px solid rgba(6, 182, 212, 0.22)",
  },
  launchBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "14px 20px",
    borderRadius: "14px",
    background: "var(--gradient-brand)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    boxShadow: "0 4px 22px rgba(99, 102, 241, 0.45)",
    cursor: "pointer",
    letterSpacing: "0.2px",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  sourceSelectorRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "18px",
  },
  sourceBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "11px 16px",
    borderRadius: "12px",
    border: "1px solid",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.18s ease",
  },
  newFeatureBadge: {
    fontSize: "10px",
    padding: "2px 6px",
    borderRadius: "6px",
    backgroundColor: "rgba(6, 182, 212, 0.2)",
    color: "var(--accent-cyan)",
    fontWeight: "700",
    marginLeft: "4px",
  },
  dropzone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "26px 16px",
    borderRadius: "14px",
    border: "1.5px dashed",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s ease",
  },
  dropzoneIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "rgba(6, 182, 212, 0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10px",
  },
  dropzoneTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "4px",
  },
  dropzoneSub: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  filePreviewCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    borderRadius: "12px",
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    border: "1px solid rgba(6, 182, 212, 0.3)",
    gap: "10px",
  },
  fileIconBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "rgba(6, 182, 212, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fileName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#ffffff",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  fileMeta: {
    fontSize: "11px",
    color: "var(--accent-cyan)",
    marginTop: "2px",
  },
  fileRemoveBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

