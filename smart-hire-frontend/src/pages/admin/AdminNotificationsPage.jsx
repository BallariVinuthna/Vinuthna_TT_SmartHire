import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, CheckCircle2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useNotifications } from '../../context/NotificationContext';
import Pagination from '../../components/common/Pagination';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const AdminNotificationsPage = () => {
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 0, pageSize: 10, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const { fetchUnreadCount } = useNotifications();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getUserNotifications({ page, size: 10 });
      if (res.success && res.data) {
        setItems(res.data.content || []);
        setPageInfo({
          pageNo: res.data.pageNo,
          pageSize: res.data.pageSize,
          totalElements: res.data.totalElements,
          totalPages: res.data.totalPages,
        });
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">System Admin Notifications</h1>
          <p className="text-slate-400 text-sm mt-1">Platform moderation logs and system activity alerts.</p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-blue-400" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonLoader count={4} height="h-24" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No admin notifications"
          description="You are up to date! System activity notifications will be displayed here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !n.isRead
                  ? 'glass-card border-blue-500/40 bg-blue-500/5'
                  : 'bg-slate-900/60 border-slate-800/80 opacity-80'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                  <h4 className="text-sm font-bold text-white">{n.title}</h4>
                </div>
                <p className="text-xs text-slate-300">{n.message}</p>
                <p className="text-[10px] text-slate-500 pt-1">{n.createdAt?.replace('T', ' ').substring(0, 16)}</p>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs"
                  title="Mark as read"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
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
    </div>
  );
};

export default AdminNotificationsPage;
