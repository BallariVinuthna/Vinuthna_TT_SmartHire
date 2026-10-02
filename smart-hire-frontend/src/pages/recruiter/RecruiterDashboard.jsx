import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, CheckCircle, Calendar, PlusCircle, UserCheck, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { recruiterService } from '../../services/recruiterService';
import { jobService } from '../../services/jobService';
import Badge from '../../components/common/Badge';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const RecruiterDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, jobsRes] = await Promise.all([
          recruiterService.getDashboardStats(),
          jobService.getRecruiterJobs({ page: 0, size: 5 }),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (jobsRes.success) setRecentJobs(jobsRes.data.content || []);
      } catch (err) {
        console.error('Failed to load recruiter dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="space-y-6"><SkeletonLoader count={4} height="h-32" /></div>;

  const statusData = stats?.applicationsByStatus
    ? Object.entries(stats.applicationsByStatus).map(([status, count]) => ({
        name: status.replace('_', ' '),
        count,
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Employer Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage active listings, review applicants, and schedule technical interviews.</p>
        </div>
        <Link
          to="/recruiter/jobs/create"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 glass-card rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Jobs</span>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.activeJobs || 0}</p>
        </div>

        <div className="p-4 glass-card rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Applicants</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-400">{stats?.totalApplicants || 0}</p>
        </div>

        <div className="p-4 glass-card rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Shortlisted</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats?.shortlistedCandidates || 0}</p>
        </div>

        <div className="p-4 glass-card rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Interviews</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">{stats?.scheduledInterviews || 0}</p>
        </div>

        <div className="p-4 glass-card rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Hired</span>
            <UserCheck className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-bold text-teal-400">{stats?.hiredCandidates || 0}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Posted Jobs */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">My Active Listings</h2>
            <Link to="/recruiter/jobs" className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1">
              <span>View all jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">No active job listings yet. Create your first job post!</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentJobs.map((job) => (
                <div key={job.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white hover:text-blue-400 transition-colors">
                      <Link to={`/recruiter/jobs/${job.id}/applicants`}>{job.title}</Link>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {job.location} • {job.workMode} • Posted {job.createdAt?.split('T')[0]}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge>{job.status}</Badge>
                    <Link
                      to={`/recruiter/jobs/${job.id}/applicants`}
                      className="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Review Applicants
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Application Pipeline Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Application Pipeline</h3>
          {statusData.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">No applicant analytics available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
