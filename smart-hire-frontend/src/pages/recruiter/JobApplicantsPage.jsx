import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Calendar, CheckCircle2, User, FileText, ArrowLeft, Send } from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { interviewService } from '../../services/interviewService';
import { jobService } from '../../services/jobService';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const JobApplicantsPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 0, pageSize: 10, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Candidate Profile Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Schedule Interview Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [interviewType, setInterviewType] = useState('Technical Round');
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const fetchApplicantsData = async () => {
    setLoading(true);
    try {
      const [jobRes, appsRes] = await Promise.all([
        jobService.getPublicJobById(jobId),
        applicationService.getJobApplicationsForRecruiter(jobId, { page, size: 10 }),
      ]);

      if (jobRes.success) setJob(jobRes.data);
      if (appsRes.success && appsRes.data) {
        setApplications(appsRes.data.content || []);
        setPageInfo({
          pageNo: appsRes.data.pageNo,
          pageSize: appsRes.data.pageSize,
          totalElements: appsRes.data.totalElements,
          totalPages: appsRes.data.totalPages,
        });
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicantsData();
  }, [jobId, page]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await applicationService.updateApplicationStatus(appId, newStatus, `Status updated to ${newStatus}`);
      if (res.success) {
        fetchApplicantsData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update application status');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduling(true);
    try {
      const res = await interviewService.scheduleInterview({
        applicationId: selectedApp.id,
        scheduledAt,
        interviewType,
        meetingLink,
        notes: interviewNotes,
      });

      if (res.success) {
        setInterviewModalOpen(false);
        fetchApplicantsData();
      }
    } catch (err) {
      alert(err.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  const openProfileModal = (candidate) => {
    setSelectedCandidate(candidate);
    setProfileModalOpen(true);
  };

  const openInterviewModal = (app) => {
    setSelectedApp(app);
    setInterviewModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <Link to="/recruiter/jobs" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to my job listings</span>
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Applicants for {job?.title || 'Position'}</h1>
        <p className="text-slate-400 text-sm mt-1">Review candidate profiles, update status, and schedule interview rounds.</p>
      </div>

      {loading ? (
        <SkeletonLoader count={4} height="h-28" />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates applied yet"
          description="There are currently no candidates who have applied for this position."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="p-6 glass-card rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h3
                      onClick={() => openProfileModal(app.candidate)}
                      className="text-lg font-bold text-white hover:text-blue-400 cursor-pointer transition-colors"
                    >
                      {app.candidate?.user?.name}
                    </h3>
                    <Badge>{app.currentStatus}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    {app.candidate?.title} • {app.candidate?.location} • {app.candidate?.user?.email}
                  </p>
                  <p className="text-[11px] text-slate-500">Applied: {app.appliedAt?.split('T')[0]}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openProfileModal(app.candidate)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => openInterviewModal(app)}
                    className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center space-x-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Interview</span>
                  </button>

                  <select
                    value={app.currentStatus}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="APPLIED">APPLIED</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="SHORTLISTED">SHORTLISTED</option>
                    <option value="INTERVIEW">INTERVIEW</option>
                    <option value="HIRED">HIRED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              {app.coverLetter && (
                <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-slate-400">Cover Letter:</span> "{app.coverLetter}"
                </p>
              )}
            </div>
          ))}

          <Pagination
            pageNo={pageInfo.pageNo}
            totalPages={pageInfo.totalPages}
            totalElements={pageInfo.totalElements}
            pageSize={pageInfo.pageSize}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Profile Inspect Modal */}
      <Modal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} title="Candidate Profile Details">
        {selectedCandidate && (
          <div className="space-y-4 text-slate-200">
            <div>
              <h3 className="text-xl font-bold text-white">{selectedCandidate.user?.name}</h3>
              <p className="text-xs text-blue-400">{selectedCandidate.title}</p>
              <p className="text-xs text-slate-400 mt-1">{selectedCandidate.location} • {selectedCandidate.user?.email}</p>
            </div>

            {selectedCandidate.bio && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase">Bio</h4>
                <p className="text-sm text-slate-300 mt-0.5">{selectedCandidate.bio}</p>
              </div>
            )}

            {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map((s) => (
                    <span key={s.id} className="px-2.5 py-0.5 bg-slate-800 text-xs text-slate-300 rounded-lg">
                      {s.skillName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedCandidate.education && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase">Education</h4>
                <p className="text-sm text-slate-300">{selectedCandidate.education}</p>
              </div>
            )}

            {selectedCandidate.experience && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase">Experience</h4>
                <p className="text-sm text-slate-300">{selectedCandidate.experience}</p>
              </div>
            )}

            {selectedCandidate.resumeUrl && (
              <div className="pt-2">
                <a
                  href={selectedCandidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-xs text-blue-400 font-semibold underline"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Candidate Resume</span>
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal isOpen={interviewModalOpen} onClose={() => setInterviewModalOpen(false)} title="Schedule Technical Interview">
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Interview Type / Title
            </label>
            <input
              type="text"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              placeholder="e.g. Technical Coding Round"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Meeting Link (Google Meet / Zoom)
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Interview Notes for Candidate
            </label>
            <textarea
              rows={3}
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="Instructions or topics to prepare..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setInterviewModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={scheduling}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-purple-500/20 disabled:opacity-50"
            >
              {scheduling ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobApplicantsPage;
