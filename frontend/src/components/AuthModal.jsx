import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Sparkles, Mail, Lock, User, Calendar, AlertCircle } from "lucide-react";

export const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen, authMode, setAuthMode, login, signup } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (authMode === "login") {
        await login({ email: formData.email, password: formData.password });
      } else {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        };
        if (formData.age) payload.age = Number(formData.age);
        await signup(payload);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.messages || "Something went wrong. Please check your details.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card} className="glass-panel">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.brandRow}>
            <div style={styles.iconBox}>
              <Sparkles size={18} color="#fff" />
            </div>
            <h2 style={styles.title}>
              {authMode === "login" ? "Welcome Back to Nexus AI" : "Create your Nexus Account"}
            </h2>
          </div>
          <button style={styles.closeBtn} onClick={() => setAuthModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <p style={styles.subtitle}>
          {authMode === "login"
            ? "Enter your credentials to continue intelligent conversations."
            : "Sign up to start chatting with Google Gemini models."}
        </p>

        {/* Error Banner */}
        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={16} color="#f43f5e" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {authMode === "signup" && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <div style={styles.inputWrapper}>
                  <User size={16} color="var(--text-muted)" style={styles.inputIcon} />
                  <input
                    type="text"
                    required
                    placeholder="Shivam Bhatt"
                    style={styles.input}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Age (Optional)</label>
                <div style={styles.inputWrapper}>
                  <Calendar size={16} color="var(--text-muted)" style={styles.inputIcon} />
                  <input
                    type="number"
                    min="10"
                    max="100"
                    placeholder="21"
                    style={styles.input}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} color="var(--text-muted)" style={styles.inputIcon} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                style={styles.input}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} color="var(--text-muted)" style={styles.inputIcon} />
              <input
                type="password"
                required
                placeholder={authMode === "signup" ? "8+ chars, upper, lower, number & special" : "••••••••"}
                style={styles.input}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            {authMode === "signup" && (
              <span style={styles.passwordHint}>
                Must include 1 uppercase, 1 lowercase, 1 number, and 1 symbol.
              </span>
            )}
          </div>

          <button type="submit" disabled={submitting} style={styles.submitBtn}>
            {submitting ? "Processing..." : authMode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={styles.toggleRow}>
          <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            style={styles.toggleBtn}
            onClick={() => {
              setError("");
              setAuthMode(authMode === "login" ? "signup" : "login");
            }}
          >
            {authMode === "login" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease",
    padding: "16px",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    borderRadius: "var(--radius-xl)",
    padding: "28px",
    backgroundColor: "#0d131f",
    border: "1px solid var(--border-highlight)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), var(--shadow-glow)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  iconBox: {
    width: "32px",
    height: "32px",
    borderRadius: "var(--radius-md)",
    background: "var(--gradient-brand)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: "19px",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  closeBtn: {
    background: "transparent",
    color: "var(--text-muted)",
    padding: "6px",
    borderRadius: "var(--radius-full)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    backgroundColor: "rgba(244, 63, 94, 0.12)",
    border: "1px solid rgba(244, 63, 94, 0.3)",
    borderRadius: "var(--radius-md)",
    color: "#fecdd3",
    fontSize: "13px",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
  },
  input: {
    width: "100%",
    padding: "11px 14px 11px 36px",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    fontSize: "14px",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  passwordHint: {
    fontSize: "11px",
    color: "var(--text-muted)",
    marginTop: "2px",
  },
  submitBtn: {
    marginTop: "8px",
    padding: "12px",
    borderRadius: "var(--radius-md)",
    background: "var(--gradient-brand)",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "15px",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid var(--border-subtle)",
  },
  toggleBtn: {
    background: "transparent",
    color: "var(--primary)",
    fontWeight: "600",
    fontSize: "14px",
  },
};
