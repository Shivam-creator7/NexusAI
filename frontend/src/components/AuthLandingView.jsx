import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Calendar,
  AlertCircle,
  Eye,
  EyeOff,
  Sliders,
  HelpCircle,
  ShieldCheck,
  Zap,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Compass,
  Sigma,
  Cpu,
} from "lucide-react";

export const AuthLandingView = () => {
  const { login, signup } = useAuth();

  const [authMode, setAuthMode] = useState("login"); // 'login' | 'signup'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);

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
      const msg =
        err.response?.data?.message ||
        err.response?.data?.messages ||
        "Authentication failed. Please check your credentials and try again.";
      setError(msg);
      setSubmitting(false);
    }
  };

  const scrollToAuth = () => {
    const el = document.getElementById("auth-station");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const faqs = [
    {
      q: "Can I use Nexus AI for non-coding subjects like Physics, Philosophy, or Economics?",
      a: "Yes, completely. Nexus AI is built upon universal first-principles pedagogy. Whether you are exploring quantum mechanics, multi-variable calculus, macroeconomic monetary policy, game theory, or moral philosophy, the tutor breaks every concept into intuitive mental models, concrete derivations/scenarios, common misconceptions, and checkpoint quizzes.",
    },
    {
      q: "How do the Precision Tutor Knobs personalize learning?",
      a: "Tutor Knobs allow you to customize 7 pedagogical dimensions before starting or mid-session: starting difficulty (Beginner to Expert), prior knowledge baseline, pedagogical goals, time budget, milestone progression steps (1 to 10), quiz questions per step (1, 3, or 5), and language—including conversational Khatarnak Hinglish.",
    },
    {
      q: "What is the Doubt Copilot and why is it separated from the main chat?",
      a: "In conventional AI tutors, asking tangent or side questions in the main chat derails the planned curriculum and bloats tokens. The Doubt Copilot provides an isolated, parallel copilot that answers side questions and edge cases with full awareness of your current lesson context, without disrupting your milestone progress. You can even drag to resize its panel or double-click to expand it!",
    },
    {
      q: "What does the 1,000,000 token studio allowance provide?",
      a: "Each authenticated account receives a generous 1,000,000 token quota. Our token-optimized architecture uses rolling progression summaries, lean system prompts, and isolated doubt contexts so you can complete exhaustive multi-milestone deep dives without worrying about running out of headroom.",
    },
    {
      q: "How do milestone checkpoints and quizzes work?",
      a: "At the end of each milestone explanation, the tutor generates targeted checkpoint questions designed to test deductive reasoning rather than rote memory. Once answered with interactive feedback, you can review suggested doubts or click a single button to advance smoothly to the next milestone.",
    },
  ];

  return (
    <div style={styles.pageContainer}>
      {/* Background Ambient Illumination */}
      <div style={styles.glowTopCenter} />
      <div style={styles.glowMidLeft} />
      <div style={styles.glowMidRight} />

      {/* Modern Top Navigation Bar */}
      <header style={styles.topNav}>
        <div style={styles.topNavInner}>
          <div style={styles.navBrand}>
            <div style={styles.brandIconBox}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <span style={styles.brandName}>Nexus AI</span>
              <span style={styles.brandTagline}>First-Principles Tutor Studio</span>
            </div>
          </div>

          <nav style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>Capabilities</a>
            <a href="#disciplines" style={styles.navLink}>Disciplines</a>
            <a href="#methodology" style={styles.navLink}>Methodology</a>
            <a href="#faq" style={styles.navLink}>FAQ</a>
            <button onClick={scrollToAuth} style={styles.navAuthActionBtn}>
              {authMode === "login" ? "Sign In" : "Join Studio"}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section: Side-by-Side Modern Layout */}
      <section style={styles.heroSection}>
        {/* Left Column: Brand, Vision, Lead, and Core Highlights */}
        <div style={styles.heroLeftCol}>
          <div style={styles.heroBadgeRow}>
            <div style={styles.editorialPill}>
              <Sparkles size={13} color="var(--accent-cyan)" />
              <span>Universal First-Principles Learning</span>
            </div>
          </div>

          <h1 style={styles.heroHeadline}>
            Understand anything, <span style={styles.headlineHighlight}>deeply.</span>
          </h1>

          <p style={styles.heroLead}>
            A personal, adaptive AI thinking and learning partner engineered for genuine comprehension.
            Whether mastering quantum mechanics, calculus, distributed systems, macroeconomics, or moral philosophy—build
            resilient mental models, configure precision knobs, and clear doubts in real time.
          </p>

          <div style={styles.heroHighlightsGrid}>
            <div style={styles.heroHighlightPill}>
              <Sliders size={15} color="var(--accent-cyan)" />
              <span>7-Dimension Precision Knobs</span>
            </div>
            <div style={styles.heroHighlightPill}>
              <HelpCircle size={15} color="#818cf8" />
              <span>Context-Isolated Doubt Copilot</span>
            </div>
            <div style={styles.heroHighlightPill}>
              <Zap size={15} color="#fb7185" />
              <span>1,000,000 Studio Headroom</span>
            </div>
            <div style={styles.heroHighlightPill}>
              <ShieldCheck size={15} color="#34d399" />
              <span>100% Verified First Principles</span>
            </div>
          </div>
        </div>

        {/* Right Column: Centered Glassmorphic Auth Station */}
        <div id="auth-station" style={styles.heroRightCol}>
          <div style={styles.authCard} className="glass-panel">
            {/* Mode Switcher */}
            <div style={styles.tabContainer}>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setError("");
                }}
                style={{
                  ...styles.tabBtn,
                  ...(authMode === "login" ? styles.tabBtnActive : {}),
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setError("");
                }}
                style={{
                  ...styles.tabBtn,
                  ...(authMode === "signup" ? styles.tabBtnActive : {}),
                }}
              >
                Create Account
              </button>
            </div>

            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>
                {authMode === "login" ? "Sign in to Nexus AI Studio" : "Create Your Learning Workspace"}
              </h2>
              <p style={styles.formSubtitle}>
                {authMode === "login"
                  ? "Access your saved sessions, custom tutor knobs, and 1M token studio."
                  : "Join the studio to launch your personalized first-principles learning journeys."}
              </p>
            </div>

            {error && (
              <div style={styles.errorBanner}>
                <AlertCircle size={16} color="#f43f5e" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              {authMode === "signup" && (
                <div style={styles.formRow}>
                  <div style={{ ...styles.inputGroup, flex: 1.4 }}>
                    <label style={styles.label}>Full Name</label>
                    <div style={styles.inputWrapper}>
                      <User size={15} color="var(--text-muted)" style={styles.inputIcon} />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Richard Feynman"
                        style={styles.input}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ ...styles.inputGroup, flex: 0.8 }}>
                    <label style={styles.label}>Age (Optional)</label>
                    <div style={styles.inputWrapper}>
                      <Calendar size={15} color="var(--text-muted)" style={styles.inputIcon} />
                      <input
                        type="number"
                        placeholder="24"
                        min="10"
                        max="120"
                        style={styles.input}
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                  <Mail size={15} color="var(--text-muted)" style={styles.inputIcon} />
                  <input
                    type="email"
                    required
                    placeholder="learner@example.com"
                    style={styles.input}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={15} color="var(--text-muted)" style={styles.inputIcon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    style={{ ...styles.input, paddingRight: "40px" }}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    style={styles.showPassBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff size={15} color="var(--text-muted)" />
                    ) : (
                      <Eye size={15} color="var(--text-muted)" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.submitBtn,
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{authMode === "login" ? "Sign In to Studio" : "Create Account & Start Learning"}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div style={styles.authFooter}>
              <ShieldCheck size={14} color="var(--accent-emerald)" />
              <span>Strictly authenticated workspace • 1,000,000 Studio Token Capacity</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Expansive Content Body */}
      <main style={styles.mainContent}>
        {/* SECTION 1: Core Architectural Capabilities */}
        <section id="features" style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionBadge}>Pedagogical Engineering</div>
            <h2 style={styles.sectionTitle}>Precision Features Built for Serious Learners</h2>
            <p style={styles.sectionSubtitle}>
              Nexus AI moves beyond generic chatbots. Configure exact teaching parameters, build mental models,
              and resolve edge-case doubts with full context awareness.
            </p>
          </div>

          <div style={styles.featuresStripGrid}>
            <div style={styles.stripCard} className="glass-panel">
              <div style={{ ...styles.stripIcon, background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                <Sliders size={22} />
              </div>
              <h4 style={styles.stripTitle}>7-Dimension Tutor Knobs</h4>
              <p style={styles.stripDesc}>
                Customize difficulty (Beginner to Expert), prior knowledge, learning goals, time budget,
                response length, and language—including conversational Khatarnak Hinglish.
              </p>
            </div>

            <div style={styles.stripCard} className="glass-panel">
              <div style={{ ...styles.stripIcon, background: "rgba(6, 182, 212, 0.15)", color: "var(--accent-cyan)" }}>
                <HelpCircle size={22} />
              </div>
              <h4 style={styles.stripTitle}>Context-Isolated Doubt Copilot</h4>
              <p style={styles.stripDesc}>
                Explore side questions and edge cases anytime in an expandable, draggable panel without breaking
                or derailing your planned milestone curriculum.
              </p>
            </div>

            <div style={styles.stripCard} className="glass-panel">
              <div style={{ ...styles.stripIcon, background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                <ShieldCheck size={22} />
              </div>
              <h4 style={styles.stripTitle}>Strict Ground Truth</h4>
              <p style={styles.stripDesc}>
                Rigorously verified facts with zero fabricated hallucinations. Every concept, formula, and explanation
                is anchored in first-principles accuracy.
              </p>
            </div>

            <div style={styles.stripCard} className="glass-panel">
              <div style={{ ...styles.stripIcon, background: "rgba(244, 63, 94, 0.15)", color: "#fb7185" }}>
                <Zap size={22} />
              </div>
              <h4 style={styles.stripTitle}>1,000,000 Token Allowance</h4>
              <p style={styles.stripDesc}>
                Generous studio headroom with token-saving running progression summaries for exhaustive, multi-step deep dives.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: Designed for Every Discipline */}
        <section id="disciplines" style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionBadge}>Universal Scope</div>
            <h2 style={styles.sectionTitle}>Designed for every discipline, at any level</h2>
            <p style={styles.sectionSubtitle}>
              Nexus AI is not confined to coding or syntax. Its pedagogical engine deconstructs
              rigorous concepts across sciences, mathematics, humanities, and systems thinking.
            </p>
          </div>

          <div style={styles.disciplinesGrid}>
            <div style={styles.disciplineCard} className="glass-panel">
              <div style={{ ...styles.disciplineIconBox, background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                <Sigma size={24} />
              </div>
              <h3 style={styles.disciplineTitle}>Mathematics & Natural Sciences</h3>
              <p style={styles.disciplineDesc}>
                Calculus, Linear Algebra, Quantum Mechanics, Astrophysics, Biochemistry, and Thermodynamics.
              </p>
              <div style={styles.disciplineHighlights}>
                <span style={styles.bulletItem}>• Visual geometric intuition before abstract notation</span>
                <span style={styles.bulletItem}>• Step-by-step physical derivations and thought experiments</span>
                <span style={styles.bulletItem}>• Pre-empting common algebraic and dimensional errors</span>
              </div>
            </div>

            <div style={styles.disciplineCard} className="glass-panel">
              <div style={{ ...styles.disciplineIconBox, background: "rgba(6, 182, 212, 0.15)", color: "var(--accent-cyan)" }}>
                <Cpu size={24} />
              </div>
              <h3 style={styles.disciplineTitle}>Engineering & Complex Systems</h3>
              <p style={styles.disciplineDesc}>
                Distributed Systems, Microservices, Computer Architecture, Cryptography, and Signal Processing.
              </p>
              <div style={styles.disciplineHighlights}>
                <span style={styles.bulletItem}>• Architecture trade-off analysis and failure mode mapping</span>
                <span style={styles.bulletItem}>• Race conditions, split-brain scenarios, and scale limits</span>
                <span style={styles.bulletItem}>• Concise, clean step-by-step verified execution paths</span>
              </div>
            </div>

            <div style={styles.disciplineCard} className="glass-panel">
              <div style={{ ...styles.disciplineIconBox, background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                <Compass size={24} />
              </div>
              <h3 style={styles.disciplineTitle}>Humanities, Economics & Strategy</h3>
              <p style={styles.disciplineDesc}>
                Behavioral Economics, Game Theory, Moral Philosophy, Cognitive Psychology, and Macroeconomics.
              </p>
              <div style={styles.disciplineHighlights}>
                <span style={styles.bulletItem}>• Socratic inquiry and dialectical synthesis</span>
                <span style={styles.bulletItem}>• Debunking cognitive fallacies and behavioral biases</span>
                <span style={styles.bulletItem}>• Dynamic equilibrium modeling and decision trees</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: The 4-Pillar Pedagogical System */}
        <section id="methodology" style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionBadge}>Pedagogical Rigor</div>
            <h2 style={styles.sectionTitle}>The 4-Pillar Pedagogical Format</h2>
            <p style={styles.sectionSubtitle}>
              Every lesson turn follows a structured teaching methodology that builds genuine understanding
              rather than passive reading.
            </p>
          </div>

          <div style={styles.pillarsGrid}>
            <div style={styles.pillarCard} className="glass-panel">
              <div style={styles.pillarNumber}>01</div>
              <h4 style={styles.pillarCardTitle}>First-Principles Mental Model</h4>
              <p style={styles.pillarCardDesc}>
                Every topic begins with the core 'Why'—establishing intuitive analogies and the foundational
                problem this concept was invented to solve.
              </p>
            </div>

            <div style={styles.pillarCard} className="glass-panel">
              <div style={styles.pillarNumber}>02</div>
              <h4 style={styles.pillarCardTitle}>Applied Practical Scenarios</h4>
              <p style={styles.pillarCardDesc}>
                Concrete, real-world examples, step-by-step derivations, or production implementations showing
                how principles operate under true conditions.
              </p>
            </div>

            <div style={styles.pillarCard} className="glass-panel">
              <div style={styles.pillarNumber}>03</div>
              <h4 style={styles.pillarCardTitle}>Critical Misconceptions & Gotchas</h4>
              <p style={styles.pillarCardDesc}>
                Directly exposing sneaky gotchas, counter-intuitive pitfalls, and flawed student assumptions
                before bad intuition crystallizes.
              </p>
            </div>

            <div style={styles.pillarCard} className="glass-panel">
              <div style={styles.pillarNumber}>04</div>
              <h4 style={styles.pillarCardTitle}>Socratic Checkpoint Quizzes</h4>
              <p style={styles.pillarCardDesc}>
                Interactive checkpoint questions at every milestone testing deduction and practical application,
                cementing long-term mastery.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: Frequently Asked Questions (Accordion) */}
        <section id="faq" style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionBadge}>Clarity</div>
            <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p style={styles.sectionSubtitle}>
              Everything you need to know about Nexus AI Tutor Studio and our pedagogical approach.
            </p>
          </div>

          <div style={styles.faqList}>
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  style={styles.faqItem}
                  className="glass-panel"
                  onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                >
                  <div style={styles.faqQuestionRow}>
                    <span style={styles.faqQuestion}>{faq.q}</span>
                    <button style={styles.faqToggleBtn} type="button">
                      {isOpen ? <ChevronUp size={18} color="var(--accent-cyan)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                    </button>
                  </div>
                  {isOpen && <p style={styles.faqAnswer}>{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Editorial Minimal Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <Sparkles size={16} color="var(--accent-cyan)" />
            <span>Nexus AI Tutor Studio • Gemini Intelligence</span>
          </div>
          <div style={styles.footerRights}>
            First-Principles Universal Pedagogy. Strictly authenticated sessions.
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  pageContainer: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#07090e",
    color: "var(--text-primary)",
    overflowX: "hidden",
    fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
  },
  glowTopCenter: {
    position: "absolute",
    top: "-15%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "1000px",
    height: "650px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  glowMidLeft: {
    position: "absolute",
    top: "35%",
    left: "-10%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 65%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  glowMidRight: {
    position: "absolute",
    top: "55%",
    right: "-10%",
    width: "650px",
    height: "650px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 65%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  topNav: {
    position: "sticky",
    top: 0,
    zIndex: 40,
    height: "68px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
    backgroundColor: "rgba(7, 9, 14, 0.88)",
    backdropFilter: "blur(18px)",
    display: "flex",
    alignItems: "center",
  },
  topNavInner: {
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  brandIconBox: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 16px rgba(99, 102, 241, 0.4)",
  },
  brandName: {
    fontSize: "17px",
    fontWeight: "700",
    letterSpacing: "-0.4px",
    color: "#ffffff",
    display: "block",
  },
  brandTagline: {
    fontSize: "11px",
    color: "var(--accent-cyan)",
    fontWeight: "500",
    letterSpacing: "0.2px",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },
  navLink: {
    color: "var(--text-secondary)",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
    transition: "color 0.2s ease",
    cursor: "pointer",
  },
  navAuthActionBtn: {
    padding: "8px 20px",
    borderRadius: "9px",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.16)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  heroSection: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1340px",
    width: "100%",
    margin: "0 auto",
    padding: "60px 32px 50px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "56px",
    flexWrap: "wrap",
  },
  heroLeftCol: {
    flex: "1 1 540px",
    maxWidth: "680px",
    textAlign: "left",
  },
  heroBadgeRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "18px",
  },
  editorialPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 16px",
    borderRadius: "20px",
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    border: "1px solid rgba(6, 182, 212, 0.25)",
    fontSize: "12.5px",
    fontWeight: "600",
    color: "var(--accent-cyan)",
  },
  heroHeadline: {
    fontSize: "56px",
    fontWeight: "800",
    lineHeight: 1.08,
    letterSpacing: "-1.8px",
    color: "#f8fafc",
    marginBottom: "18px",
    textAlign: "left",
  },
  headlineHighlight: {
    background: "linear-gradient(135deg, #a5f3fc 0%, #818cf8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroLead: {
    fontSize: "16.5px",
    lineHeight: 1.68,
    color: "var(--text-secondary)",
    margin: "0 0 24px 0",
    textAlign: "left",
  },
  heroHighlightsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginTop: "8px",
  },
  heroHighlightPill: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 14px",
    borderRadius: "12px",
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    fontSize: "13px",
    fontWeight: "600",
    color: "#e2e8f0",
  },
  heroRightCol: {
    flex: "1 1 420px",
    maxWidth: "460px",
    width: "100%",
    margin: "0 auto",
  },
  authCard: {
    padding: "32px",
    borderRadius: "20px",
    backgroundColor: "rgba(13, 19, 36, 0.85)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6), 0 0 45px rgba(99, 102, 241, 0.15)",
    textAlign: "left",
  },
  tabContainer: {
    display: "flex",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    padding: "4px",
    borderRadius: "10px",
    marginBottom: "20px",
    border: "1px solid rgba(255, 255, 255, 0.06)",
  },
  tabBtn: {
    flex: 1,
    padding: "9px 0",
    borderRadius: "8px",
    backgroundColor: "transparent",
    border: "none",
    color: "var(--text-muted)",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
  },
  tabBtnActive: {
    backgroundColor: "rgba(99, 102, 241, 0.25)",
    color: "#ffffff",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(99, 102, 241, 0.4)",
  },
  formHeader: {
    marginBottom: "18px",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "4px",
  },
  formSubtitle: {
    fontSize: "12px",
    lineHeight: 1.45,
    color: "var(--text-muted)",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    borderRadius: "8px",
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    border: "1px solid rgba(244, 63, 94, 0.3)",
    color: "#fecdd3",
    fontSize: "12px",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  formRow: {
    display: "flex",
    gap: "12px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-secondary)",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "10px 14px 10px 38px",
    borderRadius: "9px",
    backgroundColor: "rgba(7, 10, 20, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  showPassBtn: {
    position: "absolute",
    right: "10px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
    border: "none",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 18px rgba(99, 102, 241, 0.4)",
    marginTop: "6px",
    transition: "transform 0.15s ease",
  },
  authFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    marginTop: "16px",
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  mainContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px 32px 80px 32px",
  },
  sectionContainer: {
    marginBottom: "90px",
  },
  sectionHeader: {
    textAlign: "center",
    maxWidth: "760px",
    margin: "0 auto 48px auto",
  },
  sectionBadge: {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "var(--accent-cyan)",
    marginBottom: "8px",
  },
  sectionTitle: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: "-0.8px",
    marginBottom: "12px",
  },
  sectionSubtitle: {
    fontSize: "15px",
    lineHeight: 1.6,
    color: "var(--text-secondary)",
  },
  featuresStripGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
  },
  stripCard: {
    padding: "26px 20px",
    borderRadius: "16px",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  stripIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stripTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
  },
  stripDesc: {
    fontSize: "12.5px",
    lineHeight: 1.5,
    color: "var(--text-secondary)",
    margin: 0,
  },
  disciplinesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
  },
  disciplineCard: {
    padding: "30px 26px",
    borderRadius: "18px",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  disciplineIconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  disciplineTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
  },
  disciplineDesc: {
    fontSize: "13px",
    lineHeight: 1.5,
    color: "var(--text-muted)",
    margin: 0,
  },
  disciplineHighlights: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "8px",
    paddingTop: "14px",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
  },
  bulletItem: {
    fontSize: "12px",
    lineHeight: 1.45,
    color: "var(--text-secondary)",
  },
  pillarsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
  },
  pillarCard: {
    padding: "26px 20px",
    borderRadius: "16px",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  pillarNumber: {
    fontSize: "13px",
    fontWeight: "800",
    color: "var(--accent-cyan)",
    fontFamily: "monospace",
  },
  pillarCardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
  },
  pillarCardDesc: {
    fontSize: "12px",
    lineHeight: 1.5,
    color: "var(--text-secondary)",
    margin: 0,
  },
  faqList: {
    maxWidth: "880px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  faqItem: {
    padding: "20px 24px",
    borderRadius: "14px",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    cursor: "pointer",
    transition: "border-color 0.2s ease",
  },
  faqQuestionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  faqQuestion: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#ffffff",
  },
  faqToggleBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  faqAnswer: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
    fontSize: "13px",
    lineHeight: 1.6,
    color: "var(--text-secondary)",
  },
  footer: {
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(5, 7, 12, 0.9)",
    padding: "28px 0",
  },
  footerInner: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "14px",
  },
  footerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#e2e8f0",
  },
  footerRights: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
};
