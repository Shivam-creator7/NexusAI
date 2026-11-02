import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Terminal } from "lucide-react";

/**
 * Interactive Code Block with syntax highlighting and 1-click copy
 */
const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = (language || "code").toLowerCase();

  return (
    <div style={styles.codeContainer}>
      <div style={styles.codeHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Terminal size={13} color="var(--accent-cyan)" />
          <span style={styles.langBadge}>{displayLang}</span>
        </div>
        <button style={styles.copyBtn} onClick={handleCopy} title="Copy code">
          {copied ? (
            <>
              <Check size={13} color="#10b981" />
              <span style={{ color: "#10b981", fontWeight: 600 }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={displayLang === "text" ? undefined : displayLang}
        style={vscDarkPlus}
        customStyle={styles.syntaxOverride}
        wrapLongLines={true}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

/**
 * State-of-the-Art Markdown Renderer for Nexus AI
 * Supports: GFM Tables, KaTeX Math ($inline$ & $$block$$), Syntax Highlighted Code,
 * Deep Typography, and Auto-Sanitization of residual tags.
 */
export const MarkdownRenderer = ({ content }) => {
  if (!content || typeof content !== "string") return null;

  // Preprocessor: Strictly strip any stray :::quiz, :::doubts, or internal markers
  const sanitizedContent = content
    .replace(/:::+\s*quiz[\s\S]*?(?:::+|$)/gi, "")
    .replace(/:::+\s*doubts?[\s\S]*?(?:::+|$)/gi, "")
    .replace(/^:::.*$/gm, "")
    .trim();

  if (!sanitizedContent) return null;

  return (
    <div className="nexus-markdown-body" style={styles.wrapper}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Code & Syntax Highlighting
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const isMultiLine = codeString.includes("\n");

            if (match || isMultiLine) {
              return (
                <CodeBlock
                  language={match ? match[1] : "text"}
                  value={codeString}
                />
              );
            }

            return (
              <code style={styles.inlineCode} {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <div style={{ margin: "10px 0" }}>{children}</div>;
          },

          // Headings
          h1({ children }) {
            return <h1 style={styles.h1}>{children}</h1>;
          },
          h2({ children }) {
            return <h2 style={styles.h2}>{children}</h2>;
          },
          h3({ children }) {
            return <h3 style={styles.h3}>{children}</h3>;
          },
          h4({ children }) {
            return <h4 style={styles.h4}>{children}</h4>;
          },

          // Paragraphs & Text
          p({ children }) {
            return <p style={styles.p}>{children}</p>;
          },
          strong({ children }) {
            return <strong style={styles.strong}>{children}</strong>;
          },
          em({ children }) {
            return <em style={styles.em}>{children}</em>;
          },

          // Links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                {children}
              </a>
            );
          },

          // Lists
          ul({ children }) {
            return <ul style={styles.ul}>{children}</ul>;
          },
          ol({ children }) {
            return <ol style={styles.ol}>{children}</ol>;
          },
          li({ children }) {
            return <li style={styles.li}>{children}</li>;
          },

          // Blockquotes
          blockquote({ children }) {
            return <blockquote style={styles.blockquote}>{children}</blockquote>;
          },

          // Tables
          table({ children }) {
            return (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead style={styles.thead}>{children}</thead>;
          },
          tbody({ children }) {
            return <tbody>{children}</tbody>;
          },
          tr({ children }) {
            return <tr style={styles.tr}>{children}</tr>;
          },
          th({ children }) {
            return <th style={styles.th}>{children}</th>;
          },
          td({ children }) {
            return <td style={styles.td}>{children}</td>;
          },

          // Divider
          hr() {
            return <hr style={styles.hr} />;
          },
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
};

const styles = {
  wrapper: {
    lineHeight: "1.78",
    color: "#e2e8f0",
    fontSize: "15px",
    letterSpacing: "0.15px",
    wordBreak: "break-word",
  },
  p: {
    margin: "0 0 12px 0",
    lineHeight: "1.78",
    color: "#e2e8f0",
  },
  h1: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#ffffff",
    margin: "18px 0 12px 0",
    paddingBottom: "8px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    letterSpacing: "-0.01em",
  },
  h2: {
    fontSize: "18.5px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "16px 0 10px 0",
    letterSpacing: "-0.01em",
  },
  h3: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#c7d2fe", // Soft glowing indigo for key headings
    margin: "14px 0 8px 0",
  },
  h4: {
    fontSize: "14.5px",
    fontWeight: "600",
    color: "#94a3b8",
    margin: "12px 0 6px 0",
  },
  strong: {
    color: "#ffffff",
    fontWeight: "700",
  },
  em: {
    color: "#cbd5e1",
    fontStyle: "italic",
  },
  codeContainer: {
    margin: "14px 0",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backgroundColor: "#161b22",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.45)",
  },
  codeHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 14px",
    backgroundColor: "#0d1117",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  langBadge: {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--accent-cyan)",
  },
  copyBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#94a3b8",
    fontSize: "11.5px",
    padding: "3px 9px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  syntaxOverride: {
    margin: 0,
    padding: "14px 16px",
    backgroundColor: "transparent",
    fontSize: "13px",
    fontFamily: "var(--font-mono, Consolas, Monaco, monospace)",
    lineHeight: "1.55",
  },
  inlineCode: {
    backgroundColor: "rgba(99, 102, 241, 0.14)",
    color: "#a5b4fc",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "13px",
    fontFamily: "var(--font-mono, Consolas, Monaco, monospace)",
    border: "1px solid rgba(99, 102, 241, 0.28)",
    wordBreak: "break-word",
  },
  link: {
    color: "var(--accent-cyan)",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    fontWeight: "500",
  },
  ul: {
    margin: "8px 0 14px 0",
    paddingLeft: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  ol: {
    margin: "8px 0 14px 0",
    paddingLeft: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  li: {
    color: "#e2e8f0",
    lineHeight: "1.7",
  },
  blockquote: {
    margin: "14px 0",
    padding: "10px 18px",
    borderLeft: "3.5px solid var(--primary, #6366f1)",
    backgroundColor: "rgba(99, 102, 241, 0.07)",
    borderRadius: "0 8px 8px 0",
    color: "#cbd5e1",
    fontStyle: "italic",
  },
  tableWrapper: {
    overflowX: "auto",
    margin: "16px 0",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13.5px",
    textAlign: "left",
  },
  thead: {
    backgroundColor: "rgba(30, 41, 59, 0.9)",
  },
  tr: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  },
  th: {
    padding: "10px 14px",
    fontWeight: "700",
    color: "#ffffff",
    borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
  },
  td: {
    padding: "9px 14px",
    color: "#cbd5e1",
  },
  hr: {
    border: "none",
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), transparent)",
    margin: "20px 0",
  },
};
