import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, User, Zap, RefreshCw, Trash2, ShieldAlert } from "lucide-react";

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, deleteAccount, refreshProfile } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !user) return null;

  const usage = user.usage || { tokenUsed: 0, tokenLimit: 1000000, totalTokenUsed: 0 };
  const percentUsed = Math.min(100, Math.round((usage.tokenUsed / (usage.tokenLimit || 1000000)) * 100));

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card} className="glass-panel">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleRow}>
            <div style={styles.avatar}>
              <User size={20} color="#fff" />
            </div>
            <div>
              <h3 style={styles.name}>{user.name}</h3>
              <p style={styles.email}>{user.email}</p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Usage Card */}
        <div style={styles.usageCard}>
          <div style={styles.usageHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Zap size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                API Token Allowance
              </span>
            </div>
            <button
              style={{ ...styles.iconBtn, opacity: refreshing ? 0.6 : 1 }}
              onClick={handleRefresh}
              title="Refresh Usage"
              disabled={refreshing}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>

          <div style={styles.barContainer}>
            <div
              style={{
                ...styles.barFill,
                width: `${percentUsed}%`,
                background:
                  percentUsed > 80
                    ? "var(--accent-rose)"
                    : percentUsed > 50
                    ? "linear-gradient(90deg, #6366f1, #f59e0b)"
                    : "linear-gradient(90deg, #6366f1, #06b6d4)",
              }}
            />
          </div>

          <div style={styles.usageNumbers}>
            <span>{usage.tokenUsed?.toLocaleString()} used</span>
            <span>{usage.tokenLimit?.toLocaleString()} limit ({percentUsed}%)</span>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Lifetime Used</span>
              <span style={styles.statVal}>{(usage.totalTokenUsed || 0).toLocaleString()}</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>User Age</span>
              <span style={styles.statVal}>{user.age ? `${user.age} yrs` : "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Danger Zone: Delete Account */}
        <div style={styles.dangerZone}>
          {!confirmDelete ? (
            <button style={styles.deleteInitBtn} onClick={() => setConfirmDelete(true)}>
              <Trash2 size={15} />
              <span>Delete Account & Wipe Chats</span>
            </button>
          ) : (
            <div style={styles.confirmBox}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <ShieldAlert size={16} color="#f43f5e" />
                <span style={{ fontSize: "12px", color: "#fecdd3" }}>
                  Are you sure? This will delete all your chats and history permanently.
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button
                  style={styles.confirmYesBtn}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete Everything"}
                </button>
                <button style={styles.confirmCancelBtn} onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    borderRadius: "var(--radius-xl)",
    padding: "24px",
    backgroundColor: "#0d131f",
    border: "1px solid var(--border-highlight)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), var(--shadow-glow)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "var(--radius-full)",
    background: "var(--gradient-brand)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: "17px",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  email: {
    fontSize: "12px",
    color: "var(--text-secondary)",
  },
  closeBtn: {
    background: "transparent",
    color: "var(--text-muted)",
    padding: "6px",
  },
  usageCard: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-lg)",
    padding: "16px",
    marginBottom: "20px",
  },
  usageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  iconBtn: {
    background: "transparent",
    color: "var(--text-muted)",
    padding: "4px",
    borderRadius: "var(--radius-sm)",
  },
  barContainer: {
    height: "8px",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: "var(--radius-full)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "var(--radius-full)",
    transition: "width 0.3s ease",
  },
  usageNumbers: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "var(--text-muted)",
    marginTop: "6px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "14px",
    paddingTop: "12px",
    borderTop: "1px solid var(--border-subtle)",
  },
  statBox: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  statLabel: {
    fontSize: "11px",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  statVal: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  dangerZone: {
    paddingTop: "10px",
    borderTop: "1px solid var(--border-subtle)",
  },
  deleteInitBtn: {
    width: "100%",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "rgba(244, 63, 94, 0.1)",
    border: "1px solid rgba(244, 63, 94, 0.2)",
    color: "#fb7185",
    borderRadius: "var(--radius-md)",
    fontSize: "13px",
    fontWeight: "500",
  },
  confirmBox: {
    padding: "12px",
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    border: "1px solid rgba(244, 63, 94, 0.3)",
    borderRadius: "var(--radius-md)",
  },
  confirmYesBtn: {
    flex: 1,
    padding: "8px",
    backgroundColor: "var(--accent-rose)",
    color: "#fff",
    borderRadius: "var(--radius-sm)",
    fontSize: "12px",
    fontWeight: "600",
  },
  confirmCancelBtn: {
    padding: "8px 14px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "var(--text-secondary)",
    borderRadius: "var(--radius-sm)",
    fontSize: "12px",
  },
};
