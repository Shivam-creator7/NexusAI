import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { chatApi } from "../api";
import {
  Sparkles,
  Plus,
  MessageSquare,
  Trash2,
  LogIn,
  LogOut,
  Zap,
  Settings,
  Cpu,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  FileText,
} from "lucide-react";

export const Sidebar = ({
  activeChatId,
  onSelectChat,
  onNewChat,
  selectedModel,
  onSelectModel,
  onOpenProfile,
  isOpen,
  onClose,
  onToggle,
}) => {
  const { user, setAuthModalOpen, setAuthMode, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle Drag-to-Resize on Right Edge
  const startResizing = useCallback((e) => {
    e.preventDefault();
    isResizingRef.current = true;
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent) => {
      if (!isResizingRef.current) return;
      const currentX = moveEvent.clientX;
      if (currentX < 140) {
        if (isOpen) {
          onClose();
        }
      } else {
        if (!isOpen && onToggle) {
          onToggle();
        }
        const clampedWidth = Math.max(220, Math.min(460, currentX));
        setSidebarWidth(clampedWidth);
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
  }, [isOpen, onClose, onToggle]);

  const toggleExpand = () => {
    if (!isOpen) {
      if (onToggle) onToggle();
      else onClose();
      return;
    }
    setSidebarWidth((prev) => (prev < 320 ? 360 : 280));
  };

  const fetchChats = async () => {
    if (!user) {
      setChats([]);
      return;
    }
    setLoadingChats(true);
    try {
      const data = await chatApi.getRecentChats();
      setChats(data.chats || []);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [user, activeChatId]);

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation?")) return;
    setDeletingId(chatId);
    try {
      await chatApi.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) {
        onNewChat();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const usage = user?.usage || { tokenUsed: 0, tokenLimit: 1000000 };
  const percentUsed = Math.min(100, Math.round((usage.tokenUsed / (usage.tokenLimit || 1000000)) * 100));

  // Desktop: Seamless transition between Full (280px-460px) and Compact Dock (64px) - NEVER vanishes!
  const desktopSidebarStyle = {
    ...styles.sidebar,
    width: isOpen ? `${sidebarWidth}px` : "64px",
    minWidth: isOpen ? `${sidebarWidth}px` : "64px",
    marginLeft: "0px",
    opacity: 1,
    borderRight: "1px solid var(--border-subtle)",
    pointerEvents: "auto",
    position: "relative",
    transition: isResizing
      ? "none"
      : "width 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const mobileSidebarStyle = {
    ...styles.sidebar,
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "280px",
    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
    zIndex: 95,
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && <div style={styles.mobileBackdrop} onClick={onClose} />}

      <aside style={isMobile ? mobileSidebarStyle : desktopSidebarStyle}>
        {/* Draggable Resize Handle on Right Border for Desktop */}
        {!isMobile && (
          <div
            style={{
              ...styles.resizeHandle,
              backgroundColor: isResizing ? "var(--accent-cyan)" : "transparent",
            }}
            onMouseDown={startResizing}
            onDoubleClick={isOpen ? toggleExpand : (onToggle || onClose)}
            title={isOpen ? "Drag to resize sidebar width • Double-click to toggle width" : "Click or drag to expand sidebar"}
          >
            <div style={styles.resizeGripLine} />
          </div>
        )}

        {/* When closed on desktop: Render Sleek 64px Compact Dock */}
        {!isOpen && !isMobile ? (
          <div style={styles.compactDock}>
            {/* 1. Expand Toggle Button */}
            <button
              style={styles.dockExpandBtn}
              onClick={onToggle || onClose}
              title="Expand Sidebar (Ctrl+B)"
              aria-label="Expand Sidebar"
            >
              <PanelLeftOpen size={20} color="var(--accent-cyan)" />
            </button>

            <div style={styles.dockDivider} />

            {/* 2. Quick New Learning Session Button */}
            <button
              style={styles.dockNewBtn}
              onClick={onNewChat}
              title="New Learning Session"
              aria-label="New Session"
            >
              <Plus size={18} color="#fff" />
            </button>

            {/* 3. Recent Chats Icon Button */}
            <button
              style={styles.dockIconBtn}
              onClick={onToggle || onClose}
              title={`Recent Conversations (${chats.length}) • Click to expand`}
              aria-label="Recent Chats"
            >
              <MessageSquare size={18} color="#94a3b8" />
              {chats.length > 0 && <span style={styles.dockDot} />}
            </button>

            {/* 4. Model Indicator */}
            <div
              style={styles.dockModelBadge}
              title={`Active Model: ${selectedModel}`}
            >
              <Cpu size={16} color="#a78bfa" />
            </div>

            {/* 5. Bottom User Avatar */}
            <div style={styles.dockBottomZone}>
              {user ? (
                <button
                  style={styles.dockAvatarBtn}
                  onClick={onOpenProfile}
                  title={`${user.name || "User"} (${percentUsed}% tokens used) • Click for Profile`}
                  aria-label="User Profile"
                >
                  <span>{user.name ? user.name[0].toUpperCase() : "U"}</span>
                </button>
              ) : (
                <button
                  style={styles.dockLoginBtn}
                  onClick={() => {
                    setAuthMode("login");
                    setAuthModalOpen(true);
                  }}
                  title="Sign In"
                  aria-label="Sign In"
                >
                  <LogIn size={18} color="#fff" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Full Sidebar Content */
          <div style={{ ...styles.sidebarInner, width: `${sidebarWidth}px` }}>
        {/* Brand Header */}
        <div style={styles.brandRow}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={styles.logoBadge}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={styles.brandName}>Nexus AI</span>
              <span style={styles.brandTag}>Gemini Intelligence</span>
            </div>
          </div>
          <button
            style={styles.closeSidebarBtn}
            onClick={onClose}
            title="Close sidebar"
          >
            <PanelLeftClose size={17} />
          </button>
        </div>

        {/* New Learning Session Button */}
        <div style={{ padding: "0 14px", marginBottom: "16px" }}>
          <button style={styles.newChatBtn} onClick={onNewChat}>
            <Plus size={18} />
            <span>New Learning Session</span>
          </button>
        </div>

        {/* Chat History List */}
        <div style={styles.chatsSection}>
          <div style={styles.sectionTitle}>Recent Conversations</div>

          <div style={styles.chatsList}>
            {!user ? (
              <div style={styles.emptyPrompt}>
                <span>Sign in to save and sync your chat history across devices.</span>
              </div>
            ) : loadingChats && chats.length === 0 ? (
              <div style={styles.emptyPrompt}>Loading chats...</div>
            ) : chats.length === 0 ? (
              <div style={styles.emptyPrompt}>No chats yet. Start a new conversation!</div>
            ) : (
              chats.map((chat) => {
                const isActive = activeChatId === chat._id;
                return (
                  <div
                    key={chat._id}
                    onClick={() => onSelectChat(chat._id)}
                    style={{
                      ...styles.chatItem,
                      backgroundColor: isActive ? "rgba(99, 102, 241, 0.18)" : "transparent",
                      borderColor: isActive ? "var(--border-highlight)" : "transparent",
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    }}
                  >
                    {chat.isDocumentSession ? (
                      <FileText size={15} color="var(--accent-cyan)" style={{ flexShrink: 0, opacity: isActive ? 1 : 0.8 }} />
                    ) : (
                      <MessageSquare size={15} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />
                    )}
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                        <span style={styles.chatTitle}>{chat.topic || "Untitled Chat"}</span>
                        {chat.isDocumentSession && (
                          <span style={{ fontSize: "9px", padding: "1px 4px", borderRadius: "4px", background: "rgba(6, 182, 212, 0.15)", color: "var(--accent-cyan)", border: "1px solid rgba(6, 182, 212, 0.3)", fontWeight: 700, flexShrink: 0 }}>
                            DOC
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {chat.documentInfo?.fileName ? `${chat.documentInfo.fileName} • ` : ""}Milestone {chat.currentStep || 1}/{chat.targetSteps || 4}
                        {chat.customQuestionsCount > 0 ? ` • ${chat.customQuestionsCount} Custom Q${chat.customQuestionsCount > 1 ? "s" : ""}` : ""}
                      </span>
                    </div>
                    <button
                      style={styles.chatDeleteBtn}
                      onClick={(e) => handleDeleteChat(e, chat._id)}
                      disabled={deletingId === chat._id}
                      title="Delete chat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* User Footer Panel */}
        <div style={styles.footer}>
          {user && (
            <div style={styles.userCard}>
              {/* Mini Token Meter */}
              <div style={styles.miniTokenMeter} onClick={onOpenProfile} title="Click to view details">
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                  <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Zap size={12} color="var(--accent-cyan)" /> Studio Allowance
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>{percentUsed}%</span>
                </div>
                <div style={styles.meterTrack}>
                  <div
                    style={{
                      ...styles.meterBar,
                      width: `${percentUsed}%`,
                      background: percentUsed > 80 ? "var(--accent-rose)" : "linear-gradient(90deg, #6366f1, #06b6d4)",
                    }}
                  />
                </div>
              </div>

              {/* Profile Details & Actions */}
              <div style={styles.profileRow}>
                <div style={styles.userMeta} onClick={onOpenProfile}>
                  <div style={styles.userAvatar}>{user.name?.[0]?.toUpperCase() || "U"}</div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={styles.userName}>{user.name}</div>
                    <div style={styles.userEmail}>{user.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "2px" }}>
                  <button style={styles.iconActionBtn} onClick={onOpenProfile} title="Profile Settings">
                    <Settings size={15} />
                  </button>
                  <button style={styles.iconActionBtn} onClick={logout} title="Sign Out">
                    <LogOut size={15} color="#fb7185" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
          </div>
        )}
      </aside>
    </>
  );
};

const styles = {
  mobileBackdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 90,
  },
  sidebar: {
    height: "100vh",
    backgroundColor: "var(--bg-sidebar)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    transition: "margin-left 0.28s cubic-bezier(0.16, 1, 0.3, 1), width 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease",
  },
  sidebarInner: {
    width: "280px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 18px 16px 18px",
    userSelect: "none",
  },
  closeSidebarBtn: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "var(--text-muted)",
    padding: "6px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  resizeHandle: {
    position: "absolute",
    top: 0,
    right: "-4px",
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
  logoBadge: {
    width: "34px",
    height: "34px",
    borderRadius: "var(--radius-md)",
    background: "var(--gradient-brand)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
  },
  brandName: {
    fontSize: "17px",
    fontWeight: "800",
    fontFamily: "var(--font-heading)",
    background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  brandTag: {
    fontSize: "10px",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  newChatBtn: {
    width: "100%",
    padding: "11px 16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderRadius: "var(--radius-lg)",
    background: "var(--gradient-brand)",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
  },
  modelContainer: {
    margin: "0 14px 14px 14px",
    padding: "8px 10px",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-subtle)",
  },
  modelHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "10px",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    fontWeight: "600",
    letterSpacing: "0.05em",
    marginBottom: "4px",
  },
  modelSelect: {
    width: "100%",
    backgroundColor: "transparent",
    color: "var(--text-primary)",
    fontSize: "12px",
    fontWeight: "500",
    border: "none",
    outline: "none",
    cursor: "pointer",
  },
  chatsSection: {
    flex: 1,
    overflowY: "auto",
    padding: "0 10px",
    display: "flex",
    flexDirection: "column",
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "8px 8px 6px 8px",
  },
  chatsList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  chatItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: "13px",
    transition: "background 0.15s ease",
  },
  chatTitle: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chatDeleteBtn: {
    background: "transparent",
    color: "var(--text-muted)",
    opacity: 0.5,
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-sm)",
  },
  emptyPrompt: {
    fontSize: "12px",
    color: "var(--text-muted)",
    padding: "16px 10px",
    textAlign: "center",
    lineHeight: "1.5",
  },
  footer: {
    padding: "12px",
    borderTop: "1px solid var(--border-subtle)",
    backgroundColor: "rgba(11, 15, 23, 0.95)",
  },
  userCard: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  miniTokenMeter: {
    cursor: "pointer",
    padding: "6px 8px",
    borderRadius: "var(--radius-sm)",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    border: "1px solid var(--border-subtle)",
  },
  meterTrack: {
    width: "100%",
    height: "5px",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: "var(--radius-full)",
    overflow: "hidden",
  },
  meterBar: {
    height: "100%",
    borderRadius: "var(--radius-full)",
  },
  profileRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    overflow: "hidden",
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "var(--radius-full)",
    background: "var(--gradient-brand)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userEmail: {
    fontSize: "11px",
    color: "var(--text-muted)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  iconActionBtn: {
    background: "transparent",
    color: "var(--text-muted)",
    padding: "6px",
    borderRadius: "var(--radius-sm)",
  },
  guestCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px",
  },
  signInBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "var(--radius-md)",
    background: "var(--gradient-brand)",
    color: "#fff",
    fontWeight: "600",
    fontSize: "12px",
  },
  compactDock: {
    width: "64px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px 8px 14px 8px",
    gap: "10px",
    userSelect: "none",
    boxSizing: "border-box",
  },
  dockExpandBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    backgroundColor: "rgba(99, 102, 241, 0.14)",
    border: "1px solid rgba(99, 102, 241, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 0 12px rgba(99, 102, 241, 0.25)",
    transition: "all 0.2s ease",
  },
  dockDivider: {
    width: "32px",
    height: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    margin: "4px 0",
  },
  dockNewBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "var(--gradient-brand)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(99, 102, 241, 0.35)",
    transition: "transform 0.15s ease",
  },
  dockIconBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    transition: "all 0.15s ease",
  },
  dockDot: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "var(--accent-cyan)",
    boxShadow: "0 0 6px var(--accent-cyan)",
  },
  dockModelBadge: {
    width: "42px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dockBottomZone: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  dockAvatarBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #06b6d4)",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
  },
  dockLoginBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "var(--gradient-brand)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
};
