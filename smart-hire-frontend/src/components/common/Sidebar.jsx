import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  FileText,
  Bookmark,
  Calendar,
  User,
  Bell,
  Briefcase,
  Users,
  Building2,
  BarChart3,
  LogOut,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Sidebar = () => {
  const { role, user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCandidateLinks = () => [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/candidate/dashboard' },
    { label: 'Find Jobs', icon: Search, path: '/candidate/jobs' },
    { label: 'Applications', icon: FileText, path: '/candidate/applications' },
    { label: 'Saved Jobs', icon: Bookmark, path: '/candidate/saved-jobs' },
    { label: 'Interviews', icon: Calendar, path: '/candidate/interviews' },
    { label: 'Profile', icon: User, path: '/candidate/profile' },
    { label: 'Notifications', icon: Bell, path: '/candidate/notifications', badge: unreadCount },
  ];

  const getRecruiterLinks = () => [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/recruiter/dashboard' },
    { label: 'My Jobs', icon: Briefcase, path: '/recruiter/jobs' },
    { label: 'Post a Job', icon: PlusCircle, path: '/recruiter/jobs/create' },
    { label: 'AI Assistant', icon: Sparkles, path: '/recruiter/assistant' },
    { label: 'Interviews', icon: Calendar, path: '/recruiter/interviews' },
    { label: 'Company Profile', icon: Building2, path: '/recruiter/company' },
    { label: 'Notifications', icon: Bell, path: '/recruiter/notifications', badge: unreadCount },
  ];

  const getAdminLinks = () => [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'User Management', icon: Users, path: '/admin/users' },
    { label: 'Job Moderation', icon: Briefcase, path: '/admin/jobs' },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { label: 'Notifications', icon: Bell, path: '/admin/notifications', badge: unreadCount },
  ];

  let links = [];
  if (role === 'ROLE_CANDIDATE') links = getCandidateLinks();
  else if (role === 'ROLE_RECRUITER') links = getRecruiterLinks();
  else if (role === 'ROLE_ADMIN') links = getAdminLinks();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Role Identity Badge */}
        <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-800">
          <p className="text-[11px] font-bold tracking-wider uppercase text-blue-400">
            {role === 'ROLE_CANDIDATE' ? 'Candidate Portal' : role === 'ROLE_RECRUITER' ? 'Employer Portal' : 'Admin Console'}
          </p>
          <p className="text-sm font-semibold text-slate-200 truncate mt-0.5">{user?.name}</p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </div>
                {link.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
