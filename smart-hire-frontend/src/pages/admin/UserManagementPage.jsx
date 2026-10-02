import React, { useState, useEffect } from 'react';
import { Users, Search, ToggleLeft, ToggleRight, Trash2, Filter } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 0, pageSize: 10, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers(roleFilter || null, page, 10);
      if (res.success && res.data) {
        setUsers(res.data.content || []);
        setPageInfo({
          pageNo: res.data.pageNo,
          pageSize: res.data.pageSize,
          totalElements: res.data.totalElements,
          totalPages: res.data.totalPages,
        });
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, page]);

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await adminService.updateUserStatus(userId, !currentActive);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminService.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 text-sm mt-1">View, search, toggle active status, and manage all platform user accounts.</p>
        </div>

        {/* Filter Dropdown */}
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
          className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="ROLE_CANDIDATE">Candidates Only</option>
          <option value="ROLE_RECRUITER">Recruiters Only</option>
          <option value="ROLE_ADMIN">Admins Only</option>
        </select>
      </div>

      {loading ? (
        <SkeletonLoader count={4} height="h-20" />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="There are no user accounts matching the selected filter."
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="p-4">Name & Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-white">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant={u.role === 'ROLE_ADMIN' ? 'purple' : u.role === 'ROLE_RECRUITER' ? 'indigo' : 'blue'}>
                        {u.role.replace('ROLE_', '')}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-slate-300">{u.phone || 'N/A'}</td>
                    <td className="p-4 text-xs text-slate-400">{u.createdAt?.split('T')[0]}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${u.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                        {u.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleActive(u.id, u.active)}
                        className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${u.active ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}
                        title={u.active ? 'Deactivate User' : 'Activate User'}
                      >
                        {u.active ? <ToggleRight className="w-4 h-4 text-emerald-400 inline" /> : <ToggleLeft className="w-4 h-4 text-slate-500 inline" />}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-800">
            <Pagination
              pageNo={pageInfo.pageNo}
              totalPages={pageInfo.totalPages}
              totalElements={pageInfo.totalElements}
              pageSize={pageInfo.pageSize}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
