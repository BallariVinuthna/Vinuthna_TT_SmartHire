import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Building2, FileText, CheckCircle, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { adminService } from '../../services/adminService';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        const res = await adminService.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) return <div className="space-y-6"><SkeletonLoader count={4} height="h-32" /></div>;

  const rolePieData = stats?.userRegistrationsByRole
    ? [
        { name: 'Candidates', value: stats.userRegistrationsByRole.CANDIDATES || 0, color: '#3b82f6' },
        { name: 'Recruiters', value: stats.userRegistrationsByRole.RECRUITERS || 0, color: '#6366f1' },
        { name: 'Admins', value: stats.userRegistrationsByRole.ADMINS || 0, color: '#a855f7' },
      ]
    : [];

  const appStatusData = stats?.applicationsByStatus
    ? Object.entries(stats.applicationsByStatus).map(([status, count]) => ({
        name: status.replace('_', ' '),
        count,
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">SmartHire Admin Control Center</h1>
          <p className="text-slate-400 text-sm mt-1">Platform overview, user moderation, job compliance, and hiring analytics.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-4 glass-card rounded-xl border border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">Total Users</p>
          <p className="text-2xl font-bold text-white mt-1">{stats?.totalUsers || 0}</p>
        </div>
        <div className="p-4 glass-card rounded-xl border border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">Candidates</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{stats?.totalCandidates || 0}</p>
        </div>
        <div className="p-4 glass-card rounded-xl border border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">Recruiters</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{stats?.totalRecruiters || 0}</p>
        </div>
        <div className="p-4 glass-card rounded-xl border border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">Companies</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{stats?.totalCompanies || 0}</p>
        </div>
        <div className="p-4 glass-card rounded-xl border border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">Total Jobs</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats?.totalJobs || 0}</p>
        </div>
        <div className="p-4 glass-card rounded-xl border border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">Applications</p>
          <p className="text-2xl font-bold text-teal-400 mt-1">{stats?.totalApplications || 0}</p>
        </div>
        <div className="p-4 glass-card rounded-xl border border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">Total Hires</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats?.totalHires || 0}</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: User Roles Breakdown */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">User Demographic Breakdown</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rolePieData} innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                  {rolePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Application Status Overview */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Platform-Wide Application Funnel</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appStatusData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Action Portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/users"
          className="p-6 glass-card rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">User Management Portal</h3>
            <p className="text-xs text-slate-400">Search users, inspect accounts, toggle active status, or delete accounts.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
        </Link>

        <Link
          to="/admin/jobs"
          className="p-6 glass-card rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Job Moderation Console</h3>
            <p className="text-xs text-slate-400">Review all platform job postings, approve, reject, or deactivate non-compliant listings.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
