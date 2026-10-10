import API from './axios';

export const sendChatbotMessageApi = async (
  message,
  sessionId,
) => {
  const payload = {
    message,
  };

  if (sessionId !== undefined && sessionId !== null) {
    payload.sessionId = sessionId;
  }

  const response = await API.post(
    '/chatbot/messages',
    payload,
  );

  return response.data;
};
