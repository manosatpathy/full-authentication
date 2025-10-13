import { redisClient } from "../config/redis";

type SessionType = {
  userId: string;
  sessionId: string;
};

export const isSessionActive = async ({ userId, sessionId }: SessionType) => {
  const storedSessionId = await redisClient.get(`active_session:${userId}`);
  if (!storedSessionId) {
    return false;
  }
  return storedSessionId === sessionId;
};

export const updateSessionActivity = async (sessionId: string) => {
  const sessionData = await redisClient.get(`session:${sessionId}`);
  if (sessionData) {
    const parsed = JSON.parse(sessionData);
    parsed.lastActivity = new Date().toISOString();
    await redisClient.set(`session:${sessionId}`, JSON.stringify(parsed), {
      EX: 7 * 24 * 60 * 60,
    });
  }
};
