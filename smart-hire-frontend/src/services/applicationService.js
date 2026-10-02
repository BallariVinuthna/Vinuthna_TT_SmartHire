import axiosClient from '../api/axiosClient';

export const applicationService = {
  applyForJob: (jobId, data) => axiosClient.post(`/candidate/jobs/${jobId}/apply`, data),
  getCandidateApplications: (params) => axiosClient.get('/candidate/applications', { params }),
  withdrawApplication: (id) => axiosClient.patch(`/candidate/applications/${id}/withdraw`),

  getJobApplicationsForRecruiter: (jobId, params) => axiosClient.get(`/recruiter/jobs/${jobId}/applications`, { params }),
  updateApplicationStatus: (applicationId, status, notes) => axiosClient.patch(`/recruiter/applications/${applicationId}/status`, { status, notes }),
};
