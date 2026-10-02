import axiosClient from '../api/axiosClient';

export const recruiterService = {
  getProfile: () => axiosClient.get('/recruiter/profile'),
  updateCompany: (data) => axiosClient.put('/recruiter/company', data),
  getDashboardStats: () => axiosClient.get('/recruiter/dashboard'),

  getAIConversations: () => axiosClient.get('/recruiter/ai/conversations'),
  createAIConversation: (title) => axiosClient.post('/recruiter/ai/conversations', title ? { title } : undefined),
  deleteAIConversation: (id) => axiosClient.delete(`/recruiter/ai/conversations/${id}`),
  sendAIMessage: (conversationId, message, documentId) => axiosClient.post('/recruiter/ai/chat', { conversationId, message, documentId }),
  getAIDocuments: () => axiosClient.get('/recruiter/ai/documents'),
  deleteAIDocument: (id) => axiosClient.delete(`/recruiter/ai/documents/${id}`),
  uploadAIDocument: (file, documentType = 'OTHER') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return axiosClient.post('/recruiter/ai/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  analyzeResume: (documentId, rawText) => axiosClient.post('/recruiter/ai/resume/analyze', { documentId, rawText }),
  matchResume: (resumeDocumentId, jobDescriptionDocumentId, customJobDescription) =>
    axiosClient.post('/recruiter/ai/resume/match', { resumeDocumentId, jobDescriptionDocumentId, customJobDescription }),
};
