import axiosClient from '../api/axiosClient';

/**
 * Global AI chatbot service — works for all authenticated roles.
 * Routes through /api/ai/chat (AiController, now open to all roles).
 */
export const globalAiService = {
  /**
   * Send a chat message. Pass conversationId=null to start a new session.
   */
  chat: (message, conversationId = null) =>
    axiosClient.post('/ai/chat', { message, conversationId, documentId: null }),
};
