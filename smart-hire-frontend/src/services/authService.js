import axiosClient from '../api/axiosClient';

export const authService = {
  registerCandidate: (data) => axiosClient.post('/auth/register/candidate', data),
  registerRecruiter: (data) => axiosClient.post('/auth/register/recruiter', data),
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  getMe: () => axiosClient.get('/auth/me'),
  forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => axiosClient.post('/auth/reset-password', { token, newPassword }),
};
