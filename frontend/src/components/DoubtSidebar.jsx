import React, { useState, useEffect, useRef, useCallback } from "react";
import { doubtApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { MarkdownRenderer } from "./MarkdownRenderer";
import {
  HelpCircle,
  X,
  Send,
  Sparkles,
  BookOpen,
  MessageCircleQuestion,
  User,
  AlertCircle,
  Maximize2,
  Minimize2,
  Languages,
  Gauge,
  Sliders,
} from "lucide-react";

export const DoubtSidebar = ({
  chatId,
  topic,
  isOpen,
  onClose,
  queuedDoubt,
  activeKnobs,
}) => {
  const { updateUserUsage } = useAuth();
  const [doubts, setDoubts] = useState([]);
  const [loadingDoubts, setLoadingDoubts] = useState(false);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const [resolvedTopic, setResolvedTopic] = useState("");
  const [resolvedKnobs, setResolvedKnobs] = useState(null);

  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(390);
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);

  const doubtsEndRef = useRef(null);
  const lastProcessedDoubtId = useRef(null);
  const doubtQueueRef = useRef([]);

  // Fetch doubts for this chat with race-condition guard
  useEffect(() => {
    if (!chatId) {
      setDoubts([]);
      setResolvedTopic("");
      setResolvedKnobs(null);
      return;
    }
    if (!isOpen) return;

    let isCurrent = true;
    const loadDoubts = async () => {
      setLoadingDoubts(true);
      setError("");
      try {
        const data = await doubtApi.getDoubts(chatId);
        if (isCurrent) {
          setDoubts(data.doubts || []);
          if (data.topic) setResolvedTopic(data.topic);
          if (data.language || data.level) {
            setResolvedKnobs({ language: data.language, level: data.level });
          }
        }
      } catch (err) {
        if (isCurrent) console.error("Failed to load doubts:", err);
      } finally {
        if (isCurrent) setLoadingDoubts(false);
      }
    };

    loadDoubts();

    return () => {
      isCurrent = false;
    };
  }, [chatId, isOpen]);

  useEffect(() => {
    doubtsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [doubts, asking]);

  // Handle Drag-to-Resize on Left Edge
  const startResizing = useCallback((e) => {
    e.preventDefault();
    isResizingRef.current = true;
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = window.innerWidth - moveEvent.clientX;
      const minWidth = 320;
      const maxWidth = Math.min(850, Math.floor(window.innerWidth * 0.75));
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, []);

  // Double-click to toggle between Compact (390px) and Expanded (650px)
  const toggleExpand = () => {
    setSidebarWidth((prev) => (prev < 520 ? 650 : 390));
  };

  const executeAskDoubt = async (question) => {
    if (!question || !question.trim()) return;

    if (!chatId) {
      setError("Please start or select a lesson milestone first to resolve doubts in context.");
      return;
    }

    const trimmedQ = question.trim();

    // If already generating, queue this doubt so rapid clicks aren't lost
    if (asking) {
      if (!doubtQueueRef.current.includes(trimmedQ)) {
        doubtQueueRef.current.push(trimmedQ);
      }
      return;
    }

    setError("");

    // Optimistic UI representation
    const tempEntry = {
      doubt: trimmedQ,
      answer: "Thinking with full lesson context...",
      isOptimistic: true,
      createdAt: new Date().toISOString(),
    };
    setDoubts((prev) => [...prev, tempEntry]);
    setAsking(true);

    try {
      const activeLanguage = activeKnobs?.language || resolvedKnobs?.language || "hinglish";
      const activeLevel = activeKnobs?.level || resolvedKnobs?.level || "intermediate";
      const data = await doubtApi.askDoubt(chatId, trimmedQ, {
        language: activeLanguage,
        level: activeLevel,
      });
      setDoubts((prev) =>
        prev.map((d) => (d.isOptimistic ? data.doubt : d))
      );
      if (data.usage && updateUserUsage) {
        updateUserUsage(data.usage);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resolve doubt. Please try again.";
      setError(msg);
      // Remove failed optimistic entry
      setDoubts((prev) => prev.filter((d) => !d.isOptimistic));
    } finally {
      setAsking(false);
      // Process next queued doubt asynchronously
      if (doubtQueueRef.current.length > 0) {
        const nextQ = doubtQueueRef.current.shift();
        setTimeout(() => {
          executeAskDoubt(nextQ);
        }, 100);
      }
    }
  };

  // Auto-feed queued doubt if provided from ChatArea
  useEffect(() => {
    if (queuedDoubt && queuedDoubt.text && queuedDoubt.id !== lastProcessedDoubtId.current) {
      lastProcessedDoubtId.current = queuedDoubt.id;
      executeAskDoubt(queuedDoubt.text);
    }
  }, [queuedDoubt, chatId]);

  const handleSendDoubt = async (e) => {
    e?.preventDefault();
    if (!input.trim() || asking) return;
    const question = input.trim();
    setInput("");
    await executeAskDoubt(question);
  };

  if (!isOpen) return null;

  const currentLang = activeKnobs?.language || resolvedKnobs?.language || "hinglish";
  const currentLevel = activeKnobs?.level || resolvedKnobs?.level || "intermediate";
  const currentTopic = topic || resolvedTopic || "Current Lesson Context";
  const isExpanded = sidebarWidth >= 520;

  return (
    <aside
      style={{
        ...styles.sidebar,
        width: `${sidebarWidth}px`,
        transition: isResizing ? "none" : "width 0.2s ease",
      }}
      className="glass-panel"
    >
      {/* Draggable Resize Handle on Left Border */}
      <div
        style={{
          ...styles.resizeHandle,
          backgroundColor: isResizing ? "var(--accent-cyan)" : "transparent",
        }}
        onMouseDown={startResizing}
        onDoubleClick={toggleExpand}
        title="Drag to resize width • Double-click to expand/shrink"
      >
        <div style={styles.resizeGripLine} />
      </div>

      {/* Header Bar */}
      <div
        style={styles.header}
        onDoubleClick={toggleExpand}
        title="Double-click header to toggle wide/compact view"
      >
        <div style={styles.titleRow}>
          <div style={styles.iconBadge}>
            <HelpCircle size={16} color="#fff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={styles.title}>Doubt Copilot</span>
              {/* Active Knobs Sync Badge */}
              <span
                style={{
                  ...styles.knobBadge,
                  color: currentLang === "hinglish" ? "#fb923c" : "var(--accent-cyan)",
                  backgroundColor:
                    currentLang === "hinglish"
                      ? "rgba(234, 88, 12, 0.15)"
                      : "rgba(6, 182, 212, 0.12)",
                }}
                title={`Synced with chat knobs (${currentLang}, ${currentLevel})`}
              >
                {currentLang === "hinglish" ? "Hinglish Mode" : "English Mode"}
              </span>
            </div>
            <div style={styles.contextBadge}>
              <BookOpen size={10} color="var(--accent-cyan)" />
              <span style={styles.topicText}>{currentTopic}</span>
            </div>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.actionBtn}
            onClick={toggleExpand}
            title={isExpanded ? "Collapse to standard width" : "Expand to wide view"}
          >
            {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <button style={styles.closeBtn} onClick={onClose} title="Close Doubt Panel">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Context Banner */}
      <div style={styles.contextBanner}>
        <Sparkles size={13} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
        <span>
          Context-isolated. Answers immediately without breaking your milestone progression.
        </span>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={14} color="#f43f5e" />
          <span>{error}</span>
        </div>
      )}

      {/* Doubts History Stream */}
      <div style={styles.stream}>
        {loadingDoubts && doubts.length === 0 ? (
          <div style={styles.emptyState}>Loading previous doubts...</div>
        ) : doubts.length === 0 ? (
          <div style={styles.emptyState}>
            <MessageCircleQuestion size={36} color="var(--text-muted)" style={{ marginBottom: "10px" }} />
            <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>No doubts asked yet</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", marginBottom: "16px" }}>
              Stuck on an edge case or want a deeper intuition? Try a question below:
            </span>

            {/* Quick Starter Doubts */}
            <div style={styles.starterContainer}>
              {[
                `Why does this concept behave this way fundamentally?`,
                `What is the most insidious gotcha or failure mode with this?`,
                `Can you give a clean step-by-step worked example?`,
              ].map((qText, qIdx) => (
                <button
                  key={qIdx}
                  type="button"
                  style={styles.starterChip}
                  onClick={() => executeAskDoubt(qText)}
                  disabled={asking}
                >
                  <Sparkles size={11} color="var(--accent-cyan)" />
                  <span>{qText}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          doubts.map((item, idx) => (
            <div key={idx} style={styles.doubtCard}>
              {/* Question */}
              <div style={styles.questionRow}>
                <div style={styles.userDot}>
                  <User size={12} color="#fff" />
                </div>
                <div style={styles.questionText}>{item.doubt}</div>
              </div>

              {/* Answer */}
              <div style={styles.answerRow}>
                <div style={styles.tutorDot}>
                  <Sparkles size={12} color="#fff" />
                </div>
                <div style={styles.answerText}>
                  {item.isOptimistic ? (
                    <div style={styles.shimmerText}>
                      <span style={styles.spinnerSmall} />
                      <span>Resolving with active lesson knobs & context...</span>
                    </div>
                  ) : (
                    <MarkdownRenderer content={item.answer} />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={doubtsEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSendDoubt} style={styles.inputBar}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask a doubt in ${currentLang === "hinglish" ? "Hinglish" : "English"}...`}
          style={styles.textInput}
          disabled={asking}
        />
        <button
          type="submit"
          disabled={!input.trim() || asking}
          style={{
            ...styles.sendBtn,
            opacity: input.trim() && !asking ? 1 : 0.4,
            cursor: input.trim() && !asking ? "pointer" : "not-allowed",
          }}
          title="Send Doubt"
        >
          <Send size={15} color="#fff" />
        </button>
      </form>
    </aside>
  );
};

const styles = {
  sidebar: {
    height: "100vh",
    backgroundColor: "#0b0f19",
    borderLeft: "1px solid var(--border-subtle)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    position: "relative",
    zIndex: 90,
    boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.4)",
  },
  resizeHandle: {
    position: "absolute",
    top: 0,
    left: "-4px",
    width: "8px",
    height: "100%",
    cursor: "col-resize",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease",
  },
  resizeGripLine: {
    width: "2px",
    height: "36px",
    borderRadius: "2px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 18px 10px 18px",
    borderBottom: "none",
    backgroundColor: "rgba(11, 15, 23, 0.95)",
    userSelect: "none",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  iconBadge: {
    width: "30px",
    height: "30px",
    borderRadius: "var(--radius-md)",
    background: "linear-gradient(135deg, #06b6d4, #6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  knobBadge: {
    fontSize: "10.5px",
    fontWeight: "700",
    padding: "2px 7px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  contextBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: "var(--text-muted)",
    marginTop: "2px",
  },
  topicText: {
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  actionBtn: {
    background: "transparent",
    color: "var(--text-muted)",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "color 0.2s ease, background 0.2s ease",
  },
  closeBtn: {
    background: "transparent",
    color: "var(--text-muted)",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  contextBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 14px",
    margin: "0 14px 4px 14px",
    backgroundColor: "rgba(6, 182, 212, 0.06)",
    border: "none",
    borderBottom: "none",
    borderRadius: "8px",
    fontSize: "11.5px",
    color: "#a5f3fc",
    lineHeight: "1.4",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "8px 12px",
    padding: "8px 12px",
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    border: "1px solid rgba(244, 63, 94, 0.3)",
    borderRadius: "var(--radius-sm)",
    color: "#fecdd3",
    fontSize: "12px",
  },
  stream: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  emptyState: {
    margin: "auto 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "20px 10px",
  },
  starterContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
  },
  starterChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    color: "var(--text-secondary)",
    fontSize: "12px",
    textAlign: "left",
    cursor: "pointer",
    lineHeight: "1.4",
    transition: "all 0.2s ease",
  },
  doubtCard: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "12px",
    backgroundColor: "rgba(17, 24, 39, 0.65)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
  },
  questionRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  },
  userDot: {
    width: "20px",
    height: "20px",
    borderRadius: "6px",
    backgroundColor: "rgba(99, 102, 241, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "2px",
  },
  questionText: {
    fontSize: "12.5px",
    fontWeight: "600",
    color: "#f8fafc",
    lineHeight: "1.4",
  },
  answerRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    paddingTop: "8px",
    borderTop: "1px solid rgba(255, 255, 255, 0.04)",
  },
  tutorDot: {
    width: "20px",
    height: "20px",
    borderRadius: "6px",
    background: "linear-gradient(135deg, #06b6d4, #6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "2px",
  },
  answerText: {
    flex: 1,
    fontSize: "14px",
    color: "#e2e8f0",
    lineHeight: "1.7",
    overflowWrap: "anywhere",
  },
  shimmerText: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "var(--accent-cyan)",
    fontStyle: "italic",
  },
  spinnerSmall: {
    width: "12px",
    height: "12px",
    border: "2px solid rgba(6, 182, 212, 0.3)",
    borderTopColor: "var(--accent-cyan)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  inputBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 14px",
    borderTop: "1px solid var(--border-subtle)",
    backgroundColor: "rgba(11, 15, 23, 0.95)",
  },
  textInput: {
    flex: 1,
    padding: "9px 14px",
    borderRadius: "8px",
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    fontSize: "12.5px",
    outline: "none",
  },
  sendBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #06b6d4, #6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
  },
};
