import axiosClient from '../api/axiosClient';

export const interviewService = {
  scheduleInterview: (data) => axiosClient.post('/interviews', data),
  getCandidateInterviews: (params) => axiosClient.get('/interviews/candidate', { params }),
  getRecruiterInterviews: (params) => axiosClient.get('/interviews/recruiter', { params }),
};
