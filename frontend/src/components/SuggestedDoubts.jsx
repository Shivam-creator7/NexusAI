import React, { useState } from "react";
import { HelpCircle, Sparkles, ArrowUpRight, Check } from "lucide-react";

export const SuggestedDoubts = ({ doubts, onSelectDoubt }) => {
  const [clickedDoubt, setClickedDoubt] = useState(null);

  if (!doubts || !Array.isArray(doubts) || doubts.length === 0) {
    return null;
  }

  const handleClick = (doubtText) => {
    setClickedDoubt(doubtText);
    if (onSelectDoubt) {
      onSelectDoubt(doubtText);
    }
    setTimeout(() => setClickedDoubt(null), 2500);
  };

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <div style={styles.iconBadge}>
          <HelpCircle size={13} color="var(--accent-cyan)" />
        </div>
        <span style={styles.title}>Likely Doubts You Might Have</span>
        <span style={styles.subtext}>• Click to auto-solve in Doubt Copilot</span>
      </div>

      <div style={styles.chipsContainer}>
        {doubts.map((doubt, idx) => {
          const isClicked = clickedDoubt === doubt;
          return (
            <button
              key={idx}
              style={{
                ...styles.chip,
                ...(isClicked ? styles.chipActive : {}),
              }}
              onClick={() => handleClick(doubt)}
              title="Ask this doubt in Doubt Copilot"
            >
              <div style={styles.chipIcon}>
                {isClicked ? (
                  <Check size={12} color="#10b981" />
                ) : (
                  <Sparkles size={12} color="var(--accent-cyan)" />
                )}
              </div>
              <span style={styles.chipText}>{doubt}</span>
              <ArrowUpRight size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: "16px",
    padding: "14px 16px",
    borderRadius: "var(--radius-lg)",
    backgroundColor: "rgba(6, 182, 212, 0.05)",
    border: "1px solid rgba(6, 182, 212, 0.2)",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },
  iconBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: "12.5px",
    fontWeight: "700",
    color: "var(--accent-cyan)",
    letterSpacing: "0.2px",
  },
  subtext: {
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  chipsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 12px",
    borderRadius: "var(--radius-md)",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-primary)",
    fontSize: "13px",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.18s ease",
    width: "100%",
  },
  chipActive: {
    borderColor: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    boxShadow: "0 0 12px rgba(16, 185, 129, 0.25)",
  },
  chipIcon: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    flex: 1,
    lineHeight: "1.4",
  },
};
