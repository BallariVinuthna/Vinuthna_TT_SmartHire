import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Bookmark, Calendar, CheckCircle, Clock, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { candidateService } from '../../services/candidateService';
import { applicationService } from '../../services/applicationService';
import { interviewService } from '../../services/interviewService';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, appsRes, intRes] = await Promise.all([
          candidateService.getDashboardStats(),
          applicationService.getCandidateApplications({ page: 0, size: 5 }),
          interviewService.getCandidateInterviews({ page: 0, size: 3 }),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (appsRes.success) setRecentApps(appsRes.data.content || []);
        if (intRes.success) setInterviews(intRes.data.content || []);
      } catch (err) {
        console.error('Failed to load candidate dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="space-y-6"><SkeletonLoader count={4} height="h-32" /></div>;

  const chartData = [
    { name: 'Under Review', value: stats?.applicationsUnderReview || 0, color: '#3b82f6' },
    { name: 'Shortlisted', value: stats?.shortlistedApplications || 0, color: '#6366f1' },
    { name: 'Other', value: Math.max(0, (stats?.totalApplications || 0) - (stats?.applicationsUnderReview || 0) - (stats?.shortlistedApplications || 0)), color: '#64748b' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back, {user?.name}!</h1>
          <p className="text-slate-400 text-sm mt-1">Here is the current status of your job applications and upcoming interviews.</p>
        </div>
        <Link
          to="/candidate/jobs"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Explore Jobs</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 glass-card rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Applications</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats?.totalApplications || 0}</p>
          </div>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Shortlisted</p>
            <p className="text-2xl font-bold text-indigo-400 mt-0.5">{stats?.shortlistedApplications || 0}</p>
          </div>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Upcoming Interviews</p>
            <p className="text-2xl font-bold text-purple-400 mt-0.5">{stats?.upcomingInterviews || 0}</p>
          </div>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Saved Jobs</p>
            <p className="text-2xl font-bold text-amber-400 mt-0.5">{stats?.savedJobsCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Section Grid: Applications & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Applications */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Recent Applications</h2>
            <Link to="/candidate/applications" className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentApps.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">No applications submitted yet. Start applying!</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentApps.map((app) => (
                <div key={app.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white hover:text-blue-400 transition-colors">
                      <Link to={`/jobs/${app.job?.id}`}>{app.job?.title}</Link>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{app.job?.company?.name} • Applied on {app.appliedAt?.split('T')[0]}</p>
                  </div>
                  <Badge>{app.currentStatus}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Profile Completion & Status Chart */}
        <div className="space-y-6">
          {/* Profile Completion Widget */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Profile Strength</h3>
              <span className="text-sm font-bold text-blue-400">{stats?.profileCompletionPercentage || 20}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${stats?.profileCompletionPercentage || 20}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">Complete your profile to increase visibility to recruiters.</p>
            <Link
              to="/candidate/profile"
              className="inline-block text-xs font-semibold text-blue-400 hover:text-blue-300 pt-1"
            >
              Update Profile →
            </Link>
          </div>

          {/* Application Status Chart */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Status Breakdown</h3>
            {chartData.length > 0 ? (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No status data to plot yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
