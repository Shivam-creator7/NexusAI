import React, { useState } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Lightbulb,
} from "lucide-react";

export const InteractiveQuizCard = ({ quiz, currentStep, targetSteps, onProceedNext }) => {
  const questions = Array.isArray(quiz?.questions) && quiz.questions.length > 0
    ? quiz.questions
    : quiz?.question
      ? [quiz]
      : [];

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  if (questions.length === 0) {
    return null;
  }

  const activeQuestion = questions[currentQIndex] || questions[0];
  if (!activeQuestion || !activeQuestion.question || !activeQuestion.options || activeQuestion.options.length < 2) {
    return null;
  }

  const isCorrect = selectedOption === activeQuestion.answerIndex;

  const handleSelect = (index) => {
    if (hasSubmitted && isCorrect) return; // Locked once correctly solved
    setSelectedOption(index);
    setHasSubmitted(true);
    setShowExplanation(true);
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setShowExplanation(false);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setShowExplanation(false);
    setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1));
  };

  const isLastQuestion = currentQIndex >= questions.length - 1;

  return (
    <div style={styles.card} className="glass-panel">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.badgeRow}>
          <div style={styles.checkpointBadge}>
            <Sparkles size={13} color="var(--accent-purple)" />
            <span>Interactive Milestone Checkpoint</span>
          </div>
          <span style={styles.stepIndicator}>
            {questions.length > 1
              ? `Question ${currentQIndex + 1} of ${questions.length} • Milestone ${currentStep}`
              : `Milestone ${currentStep} Knowledge Check`}
          </span>
        </div>
      </div>

      {/* Question */}
      <div style={styles.questionText}>{activeQuestion.question}</div>

      {/* Options List */}
      <div style={styles.optionsList}>
        {activeQuestion.options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          const isSelected = selectedOption === idx;
          const isActualAnswer = idx === activeQuestion.answerIndex;

          let btnStyle = { ...styles.optionBtn };

          if (hasSubmitted) {
            if (isSelected) {
              if (isCorrect) {
                btnStyle = { ...btnStyle, ...styles.optionCorrect };
              } else {
                btnStyle = { ...btnStyle, ...styles.optionIncorrect };
              }
            } else if (showExplanation && isActualAnswer) {
              btnStyle = { ...btnStyle, ...styles.optionAnswerHighlight };
            }
          }

          return (
            <button
              key={idx}
              style={btnStyle}
              onClick={() => handleSelect(idx)}
              disabled={hasSubmitted && isCorrect}
            >
              <div style={styles.optionLetterBadge}>{letter}</div>
              <div style={styles.optionContent}>{option}</div>
              {hasSubmitted && isSelected && (
                <div style={styles.statusIcon}>
                  {isCorrect ? (
                    <CheckCircle2 size={18} color="#10b981" />
                  ) : (
                    <XCircle size={18} color="#f43f5e" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback & Explanation Box */}
      {hasSubmitted && (
        <div
          style={{
            ...styles.feedbackBox,
            borderColor: isCorrect ? "rgba(16, 185, 129, 0.4)" : "rgba(244, 63, 94, 0.4)",
            backgroundColor: isCorrect ? "rgba(16, 185, 129, 0.08)" : "rgba(244, 63, 94, 0.08)",
          }}
        >
          <div style={styles.feedbackTitleRow}>
            {isCorrect ? (
              <>
                <CheckCircle2 size={16} color="#10b981" />
                <span style={{ ...styles.feedbackTitle, color: "#34d399" }}>
                  Spot on! Concept Mastered 🎉
                </span>
              </>
            ) : (
              <>
                <HelpCircle size={16} color="#fb7185" />
                <span style={{ ...styles.feedbackTitle, color: "#fb7185" }}>
                  Not quite — let's review the mental model:
                </span>
              </>
            )}
          </div>

          <div style={styles.explanationText}>
            <Lightbulb size={14} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{activeQuestion.explanation}</span>
          </div>

          {/* Action Row */}
          <div style={styles.feedbackActions}>
            {!isCorrect ? (
              <button style={styles.retryBtn} onClick={handleRetry}>
                <RotateCcw size={13} />
                <span>Try Another Option</span>
              </button>
            ) : !isLastQuestion ? (
              <button
                style={styles.proceedBtn}
                onClick={handleNextQuestion}
              >
                <span>Next Question ({currentQIndex + 2}/{questions.length})</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              currentStep < targetSteps && (
                <button
                  style={styles.proceedBtn}
                  onClick={() => onProceedNext && onProceedNext()}
                >
                  <span>Ready for Milestone {currentStep + 1}</span>
                  <ArrowRight size={14} />
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    marginTop: "20px",
    padding: "18px 20px",
    borderRadius: "var(--radius-lg)",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    border: "1px solid rgba(168, 85, 247, 0.28)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px rgba(168, 85, 247, 0.12)",
  },
  header: {
    marginBottom: "12px",
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap",
  },
  checkpointBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11.5px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "var(--accent-purple)",
    backgroundColor: "rgba(168, 85, 247, 0.14)",
    padding: "3px 10px",
    borderRadius: "var(--radius-full)",
    border: "1px solid rgba(168, 85, 247, 0.3)",
  },
  stepIndicator: {
    fontSize: "11.5px",
    color: "var(--text-muted)",
    fontWeight: "600",
  },
  questionText: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--text-primary)",
    lineHeight: "1.55",
    marginBottom: "14px",
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },
  optionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 14px",
    borderRadius: "var(--radius-md)",
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-primary)",
    fontSize: "13.5px",
    lineHeight: "1.4",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.18s ease",
    width: "100%",
  },
  optionLetterBadge: {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--accent-cyan)",
    flexShrink: 0,
  },
  optionContent: {
    flex: 1,
  },
  statusIcon: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
  },
  optionCorrect: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10b981",
    color: "#ffffff",
    boxShadow: "0 0 14px rgba(16, 185, 129, 0.2)",
  },
  optionIncorrect: {
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    borderColor: "#f43f5e",
    color: "#ffffff",
  },
  optionAnswerHighlight: {
    borderColor: "rgba(16, 185, 129, 0.6)",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  feedbackBox: {
    marginTop: "14px",
    padding: "12px 14px",
    borderRadius: "var(--radius-md)",
    border: "1px solid",
  },
  feedbackTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  feedbackTitle: {
    fontSize: "13.5px",
    fontWeight: "700",
  },
  explanationText: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.5",
    marginTop: "4px",
  },
  feedbackActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "12px",
  },
  retryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "var(--radius-sm)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-primary)",
    fontSize: "12px",
    fontWeight: "600",
  },
  proceedBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "var(--radius-md)",
    background: "var(--gradient-brand)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "700",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
    cursor: "pointer",
  },
};
