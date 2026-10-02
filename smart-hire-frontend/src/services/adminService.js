import axiosClient from '../api/axiosClient';

export const adminService = {
  getDashboardStats: () => axiosClient.get('/admin/dashboard'),
  getAllUsers: (role, page, size) => axiosClient.get('/admin/users', { params: { role, page, size } }),
  updateUserStatus: (id, active) => axiosClient.patch(`/admin/users/${id}/status`, { active }),
  deleteUser: (id) => axiosClient.delete(`/admin/users/${id}`),
  getAllJobs: (status, page, size) => axiosClient.get('/admin/jobs', { params: { status, page, size } }),
  updateJobStatus: (id, status) => axiosClient.patch(`/admin/jobs/${id}/status`, { status }),
};
