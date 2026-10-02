import axiosClient from '../api/axiosClient';

export const candidateService = {
  getProfile: () => axiosClient.get('/candidate/profile'),
  updateProfile: (data) => axiosClient.put('/candidate/profile', data),
  saveJob: (jobId) => axiosClient.post(`/candidate/jobs/${jobId}/save`),
  unsaveJob: (jobId) => axiosClient.delete(`/candidate/jobs/${jobId}/save`),
  getSavedJobs: (params) => axiosClient.get('/candidate/saved-jobs', { params }),
  getDashboardStats: () => axiosClient.get('/candidate/dashboard'),
};
