import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, ExternalLink, History, AlertCircle, Ban } from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 0, pageSize: 10, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // History Modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getCandidateApplications({ page, size: 10 });
      if (res.success && res.data) {
        setApplications(res.data.content || []);
        setPageInfo({
          pageNo: res.data.pageNo,
          pageSize: res.data.pageSize,
          totalElements: res.data.totalElements,
          totalPages: res.data.totalPages,
        });
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page]);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      const res = await applicationService.withdrawApplication(appId);
      if (res.success) {
        fetchApplications();
      }
    } catch (err) {
      alert(err.message || 'Failed to withdraw application');
    }
  };

  const openHistoryModal = (app) => {
    setSelectedApp(app);
    setHistoryModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">My Job Applications</h1>
        <p className="text-slate-400 text-sm mt-1">Track status changes and history for your submitted job applications.</p>
      </div>

      {loading ? (
        <SkeletonLoader count={4} height="h-28" />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description="You haven't submitted any job applications yet. Browse active job listings to get started."
          action={
            <Link
              to="/candidate/jobs"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              Browse Jobs
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="p-6 glass-card rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                      <Link to={`/jobs/${app.job?.id}`}>{app.job?.title}</Link>
                    </h3>
                    <Badge>{app.currentStatus}</Badge>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {app.job?.company?.name} • Applied on {app.appliedAt?.split('T')[0]}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openHistoryModal(app)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View Timeline</span>
                  </button>

                  {app.currentStatus !== 'WITHDRAWN' && app.currentStatus !== 'REJECTED' && app.currentStatus !== 'HIRED' && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-medium transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Withdraw</span>
                    </button>
                  )}
                </div>
              </div>

              {app.coverLetter && (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">Cover Letter Note:</span> "{app.coverLetter}"
                </div>
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

      {/* History Timeline Modal */}
      <Modal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} title="Application Status History">
        {selectedApp && (
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-bold text-white">{selectedApp.job?.title}</h4>
              <p className="text-xs text-slate-400">{selectedApp.job?.company?.name}</p>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
              {selectedApp.history && selectedApp.history.map((item, idx) => (
                <div key={item.id || idx} className="relative flex items-start space-x-4 pl-8">
                  <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-slate-900" />
                  <div className="p-4 glass-card rounded-xl border border-slate-800 w-full space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge>{item.status}</Badge>
                      <span className="text-[11px] text-slate-400">{item.changedAt?.replace('T', ' ').substring(0, 16)}</span>
                    </div>
                    {item.notes && <p className="text-xs text-slate-300 mt-1">{item.notes}</p>}
                    <p className="text-[10px] text-slate-500 font-medium">Updated by: {item.changedByName || 'System'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyApplicationsPage;
