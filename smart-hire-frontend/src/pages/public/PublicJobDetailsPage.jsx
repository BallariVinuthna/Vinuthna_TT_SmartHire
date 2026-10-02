import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Building2, Calendar, DollarSign, Briefcase, Bookmark, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { candidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const PublicJobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await jobService.getPublicJobById(id);
      if (res.success) {
        setJob(res.data);
      }
    } catch (err) {
      setError(err.message || 'Job not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (role !== 'ROLE_CANDIDATE') return;

    try {
      if (job.savedByCurrentCandidate) {
        await candidateService.unsaveJob(job.id);
        setJob({ ...job, savedByCurrentCandidate: false });
      } else {
        await candidateService.saveJob(job.id);
        setJob({ ...job, savedByCurrentCandidate: true });
      }
    } catch (err) {
      console.error('Error toggling save job:', err);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await applicationService.applyForJob(job.id, { coverLetter });
      if (res.success) {
        setSuccessMessage('Application submitted successfully!');
        setJob({ ...job, appliedByCurrentCandidate: true });
        setTimeout(() => {
          setApplyModalOpen(false);
          setSuccessMessage('');
        }, 1500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-12"><SkeletonLoader count={6} /></div>;

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white">Job Not Found</h2>
        <p className="text-slate-400 mt-2">The job position you are looking for does not exist or has expired.</p>
        <Link to="/jobs" className="mt-6 inline-flex items-center space-x-2 text-blue-400 font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all jobs</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <Link to="/jobs" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to job listings</span>
      </Link>

      {/* Main Card */}
      <div className="p-8 glass-card rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="blue">{job.company?.name}</Badge>
              <Badge variant="purple">{job.workMode}</Badge>
              <Badge variant="indigo">{job.jobType.replace('_', ' ')}</Badge>
            </div>

            <h1 className="text-3xl font-extrabold text-white">{job.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 font-medium">
              <span className="flex items-center space-x-1">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>{job.company?.name}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{job.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>{job.experienceRequired || 0}+ yrs experience</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {role === 'ROLE_CANDIDATE' && (
              <button
                onClick={handleToggleSave}
                className={`p-3 rounded-xl border transition-colors ${
                  job.savedByCurrentCandidate
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title={job.savedByCurrentCandidate ? 'Unsave Job' : 'Save Job'}
              >
                <Bookmark className={`w-5 h-5 ${job.savedByCurrentCandidate ? 'fill-amber-400' : ''}`} />
              </button>
            )}

            {job.appliedByCurrentCandidate ? (
              <div className="px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold text-sm flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Application Submitted</span>
              </div>
            ) : isAuthenticated && role === 'ROLE_CANDIDATE' ? (
              <button
                onClick={() => setApplyModalOpen(true)}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:opacity-90 shadow-lg shadow-blue-500/25 transition-all flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Apply Now</span>
              </button>
            ) : !isAuthenticated ? (
              <Link
                to="/login"
                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25"
              >
                Sign in to Apply
              </Link>
            ) : null}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
          <div>
            <p className="text-xs text-slate-400 font-medium">Estimated Salary</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">
              {job.salaryMin ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax ? job.salaryMax.toLocaleString() : 'Max'}` : 'Competitive'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Work Mode</p>
            <p className="text-sm font-bold text-white mt-1">{job.workMode}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Experience</p>
            <p className="text-sm font-bold text-white mt-1">{job.experienceRequired || 0} Years</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Deadline</p>
            <p className="text-sm font-bold text-slate-300 mt-1">{job.applicationDeadline || 'Open until filled'}</p>
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-4 pt-2">
          <h3 className="text-lg font-bold text-white">About the Role</h3>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {/* Responsibilities */}
        {job.responsibilities && (
          <div className="space-y-3 pt-2">
            <h3 className="text-lg font-bold text-white">Key Responsibilities</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
          </div>
        )}

        {/* Requirements */}
        {job.requirements && (
          <div className="space-y-3 pt-2">
            <h3 className="text-lg font-bold text-white">Requirements & Qualifications</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{job.requirements}</p>
          </div>
        )}

        {/* Required Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-lg font-bold text-white">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span key={s.id} className="px-3 py-1 bg-slate-800 text-blue-300 rounded-lg text-xs font-medium border border-slate-700">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Application Cover Letter Modal */}
      <Modal isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)} title={`Apply for ${job.title}`}>
        {successMessage ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <p className="text-lg font-bold text-white">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleApplySubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-xl">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Cover Letter / Intro Note (Optional)
              </label>
              <textarea
                rows={5}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Share why you are a great fit for this position..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default PublicJobDetailsPage;
