import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GlobalChatBot from './components/common/GlobalChatBot';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CandidateLayout from './layouts/CandidateLayout';
import RecruiterLayout from './layouts/RecruiterLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import PublicJobsPage from './pages/public/PublicJobsPage';
import PublicJobDetailsPage from './pages/public/PublicJobDetailsPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import MyApplicationsPage from './pages/candidate/MyApplicationsPage';
import SavedJobsPage from './pages/candidate/SavedJobsPage';
import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import CandidateInterviewsPage from './pages/candidate/CandidateInterviewsPage';
import CandidateNotificationsPage from './pages/candidate/CandidateNotificationsPage';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterJobsPage from './pages/recruiter/RecruiterJobsPage';
import CreateJobPage from './pages/recruiter/CreateJobPage';
import JobApplicantsPage from './pages/recruiter/JobApplicantsPage';
import RecruiterInterviewsPage from './pages/recruiter/RecruiterInterviewsPage';
import RecruiterAssistantPage from './pages/recruiter/RecruiterAssistantPage';
import CompanyProfilePage from './pages/recruiter/CompanyProfilePage';
import RecruiterNotificationsPage from './pages/recruiter/RecruiterNotificationsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import JobManagementPage from './pages/admin/JobManagementPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/jobs" element={<PublicJobsPage />} />
              <Route path="/jobs/:id" element={<PublicJobDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Candidate Portal Routes */}
            <Route
              path="/candidate"
              element={
                <ProtectedRoute allowedRoles={['ROLE_CANDIDATE']}>
                  <CandidateLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<CandidateDashboard />} />
              <Route path="jobs" element={<PublicJobsPage />} />
              <Route path="applications" element={<MyApplicationsPage />} />
              <Route path="saved-jobs" element={<SavedJobsPage />} />
              <Route path="interviews" element={<CandidateInterviewsPage />} />
              <Route path="profile" element={<CandidateProfilePage />} />
              <Route path="notifications" element={<CandidateNotificationsPage />} />
            </Route>

            {/* Recruiter Portal Routes */}
            <Route
              path="/recruiter"
              element={
                <ProtectedRoute allowedRoles={['ROLE_RECRUITER']}>
                  <RecruiterLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<RecruiterDashboard />} />
              <Route path="jobs" element={<RecruiterJobsPage />} />
              <Route path="jobs/create" element={<CreateJobPage />} />
              <Route path="jobs/:jobId/applicants" element={<JobApplicantsPage />} />
              <Route path="interviews" element={<RecruiterInterviewsPage />} />
              <Route path="assistant" element={<RecruiterAssistantPage />} />
              <Route path="company" element={<CompanyProfilePage />} />
              <Route path="notifications" element={<RecruiterNotificationsPage />} />
            </Route>

            {/* Admin Portal Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="jobs" element={<JobManagementPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global AI Chatbot — visible on every page for all authenticated roles */}
          <GlobalChatBot />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
