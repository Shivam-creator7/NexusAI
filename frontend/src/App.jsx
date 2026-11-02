import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { DoubtSidebar } from "./components/DoubtSidebar";
import { TutorKnobsModal } from "./components/TutorKnobsModal";
import { AuthModal } from "./components/AuthModal";
import { ProfileModal } from "./components/ProfileModal";
import { AuthLandingView } from "./components/AuthLandingView";
import { chatApi, messageApi } from "./api";

const MainApp = () => {
  const { user, loading, setAuthModalOpen, setAuthMode } = useAuth();

  const [activeChatId, setActiveChatId] = useState(null);
  const [activeTopic, setActiveTopic] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.1-flash-lite");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doubtSidebarOpen, setDoubtSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [knobsModalOpen, setKnobsModalOpen] = useState(false);
  const [queuedDoubt, setQueuedDoubt] = useState(null);
  const [launchKnobsTrigger, setLaunchKnobsTrigger] = useState(null);
  const [activeKnobs, setActiveKnobs] = useState(null);

  // Global shortcut: Ctrl+B / Cmd+B toggles sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in input or textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // If initial auth check is ongoing, show subtle loading state
  if (loading) {
    return (
      <div style={appStyles.loadingWrapper}>
        <div style={appStyles.spinner} />
      </div>
    );
  }

  // Mandatory authentication: guests land directly on the split-screen landing page
  if (!user) {
    return <AuthLandingView />;
  }

  // Trigger doubt Copilot from ChatArea predicted doubts
  const handleAutoAskDoubt = (doubtText) => {
    setDoubtSidebarOpen(true);
    setQueuedDoubt({
      text: doubtText,
      id: Date.now(),
    });
  };

  // When clicking New Chat, prompt the Tutor Knobs Studio modal!
  const handleNewChat = () => {
    setActiveChatId(null);
    setActiveTopic("");
    setActiveKnobs(null);
    setKnobsModalOpen(true);
  };

  const handleSelectChat = async (chatId) => {
    setActiveChatId(chatId);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleOpenKnobsModal = (knobs) => {
    if (knobs) {
      setActiveKnobs(knobs);
      if (knobs.topic) setActiveTopic(knobs.topic);
    }
    setKnobsModalOpen(true);
  };

  // Launch customized session from Knobs Studio
  const handleLaunchSession = (knobs) => {
    setKnobsModalOpen(false);
    setActiveChatId(null);
    setActiveTopic(knobs.topic);
    setActiveKnobs(knobs);
    setLaunchKnobsTrigger({
      knobs,
      timestamp: Date.now(),
    });
  };

  return (
    <div style={appStyles.layout}>
      {/* Left Sidebar: Recent Learning Sessions */}
      <Sidebar
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onOpenProfile={() => setProfileModalOpen(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Center Area: Active Lesson Stream */}
      <ChatArea
        activeChatId={activeChatId}
        selectedModel={selectedModel}
        onChatCreated={(newId) => setActiveChatId(newId)}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
        onOpenKnobsModal={handleOpenKnobsModal}
        onToggleDoubtSidebar={() => setDoubtSidebarOpen((prev) => !prev)}
        doubtSidebarOpen={doubtSidebarOpen}
        onAutoAskDoubt={handleAutoAskDoubt}
        launchKnobsTrigger={launchKnobsTrigger}
        onSyncSession={(knobs) => {
          if (knobs) {
            if (knobs.topic) setActiveTopic(knobs.topic);
            setActiveKnobs(knobs);
          }
        }}
      />

      {/* Right Sidebar: Contextual Doubt Solver Copilot */}
      <DoubtSidebar
        chatId={activeChatId}
        topic={activeTopic}
        isOpen={doubtSidebarOpen}
        onClose={() => setDoubtSidebarOpen(false)}
        queuedDoubt={queuedDoubt}
        activeKnobs={activeKnobs}
      />

      {/* Global Modals */}
      <TutorKnobsModal
        isOpen={knobsModalOpen}
        onClose={() => setKnobsModalOpen(false)}
        onLaunchSession={handleLaunchSession}
        initialTopic={activeTopic || activeKnobs?.topic || ""}
        initialKnobs={activeKnobs || {}}
      />
      <AuthModal />
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const appStyles = {
  layout: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "var(--bg-dark)",
  },
  loadingWrapper: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#07090e",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(99, 102, 241, 0.2)",
    borderTopColor: "var(--primary)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
