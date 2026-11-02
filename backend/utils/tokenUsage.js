export const addChatTokenUsage = (chat, usage = {}) => {
  chat.usage = chat.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  chat.usage.promptTokens = (chat.usage.promptTokens || 0) + (usage.promptTokens || 0);
  chat.usage.completionTokens = (chat.usage.completionTokens || 0) + (usage.completionTokens || 0);
  chat.usage.totalTokens = (chat.usage.totalTokens || 0) + (usage.totalTokens || 0);
};