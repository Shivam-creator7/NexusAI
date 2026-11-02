export const resetUsageIfNeeded = async (user) => {
  if (!user.usage) {
    user.usage = {
      tokenUsed: 0,
      tokenLimit: 1000000,
      resetAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
      totalTokenUsed: 0,
    };
    await user.save();
    return;
  }

  let modified = false;

  // Upgrade token limit to 1 million (1,000,000) for all users
  if (!user.usage.tokenLimit || user.usage.tokenLimit < 1000000) {
    user.usage.tokenLimit = 1000000;
    modified = true;
  }

  const now = new Date();
  if (user.usage.resetAt && now > user.usage.resetAt) {
    user.usage.tokenUsed = 0;
    user.usage.resetAt = new Date(Date.now() + 5 * 60 * 60 * 1000);
    modified = true;
  } else if (!user.usage.resetAt) {
    user.usage.resetAt = new Date(Date.now() + 5 * 60 * 60 * 1000);
    modified = true;
  }

  if (modified) {
    await user.save();
  }
};

export const hasTokenLimitReached = (user) => {
  if (!user.usage) return false;
  const limit = user.usage.tokenLimit || 1000000;
  return (user.usage.tokenUsed || 0) >= limit;
};

export const addUserTokenUsage = async (user, totalTokens = 0) => {
  if (!user.usage) {
    user.usage = {
      tokenUsed: 0,
      tokenLimit: 1000000,
      resetAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
      totalTokenUsed: 0,
    };
  }

  user.usage.tokenUsed = (user.usage.tokenUsed || 0) + totalTokens;
  user.usage.totalTokenUsed = (user.usage.totalTokenUsed || 0) + totalTokens;

  await user.save();
};