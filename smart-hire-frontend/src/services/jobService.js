import axiosClient from '../api/axiosClient';

export const jobService = {
  getPublicJobs: (params) => axiosClient.get('/jobs/public', { params }),
  getPublicJobById: (id) => axiosClient.get(`/jobs/public/${id}`),
  
  createJob: (data) => axiosClient.post('/recruiter/jobs', data),
  getRecruiterJobs: (params) => axiosClient.get('/recruiter/jobs', { params }),
  updateJob: (id, data) => axiosClient.put(`/recruiter/jobs/${id}`, data),
  deleteJob: (id) => axiosClient.delete(`/recruiter/jobs/${id}`),
};
