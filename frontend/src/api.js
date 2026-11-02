import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= USER API =================
export const userApi = {
  signup: async (userData) => {
    const res = await api.post("/user/signup", userData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await api.post("/user/login", credentials);
    return res.data;
  },
  logout: async () => {
    const res = await api.post("/user/logout");
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get("/user/profile");
    return res.data;
  },
  deleteAccount: async () => {
    const res = await api.delete("/user/delete");
    return res.data;
  },
};

// ================= CHAT & LEARNING SESSION API =================
export const chatApi = {
  createChat: async (knobs = {}) => {
    const res = await api.post("/chat/createChat", knobs);
    return res.data;
  },
  createChatWithDocument: async (formData) => {
    const res = await api.post("/chat/upload-document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
  getRecentChats: async () => {
    const res = await api.get("/chat/getRecentChat");
    return res.data;
  },
  getSingleChat: async (chatId) => {
    const res = await api.get(`/chat/${chatId}`);
    return res.data;
  },
  updateKnobs: async (chatId, knobs) => {
    const res = await api.patch(`/chat/${chatId}/knobs`, knobs);
    return res.data;
  },
  deleteChat: async (chatId) => {
    const res = await api.delete(`/chat/${chatId}`);
    return res.data;
  },
};

// ================= MESSAGE & LESSON API =================
export const messageApi = {
  getMessages: async (chatId) => {
    const res = await api.get(`/msg/${chatId}`);
    return res.data;
  },
  sendMessage: async ({
    chatId,
    content,
    model = "gemini-3.1-flash-lite",
    topic,
    level,
    priorKnowledge,
    learningGoal,
    practiceIntensity,
    interactionMode,
    timeBudget,
    language = "hinglish",
    targetSteps,
    questionsPerMilestone = 3,
    responseLength,
    learningStyle,
    verifyFacts = true,
    isMilestone,
    milestoneStep,
  }) => {
    const payload = {
      content,
      model,
      topic,
      level,
      priorKnowledge,
      learningGoal,
      practiceIntensity,
      interactionMode,
      timeBudget,
      language,
      targetSteps,
      questionsPerMilestone: Number(questionsPerMilestone) || 3,
      responseLength,
      learningStyle,
      verifyFacts: true,
      isMilestone,
      milestoneStep,
    };

    if (chatId) {
      const res = await api.post(`/msg/${chatId}`, payload);
      return res.data;
    } else {
      const res = await api.post("/msg", payload);
      return res.data;
    }
  },
};

// ================= CONTEXTUAL DOUBT SOLVER API =================
export const doubtApi = {
  askDoubt: async (chatId, doubt, knobs = {}) => {
    const res = await api.post(`/msg/doubt/${chatId}`, {
      doubt,
      language: knobs.language,
      level: knobs.level,
    });
    return res.data;
  },
  getDoubts: async (chatId) => {
    const res = await api.get(`/msg/doubt/${chatId}`);
    return res.data;
  },
};

export default api;
