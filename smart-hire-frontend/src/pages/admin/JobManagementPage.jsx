import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, XCircle, Ban, MapPin } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const JobManagementPage = () => {
  const [jobs, setJobs] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 0, pageSize: 10, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllJobs(statusFilter || null, page, 10);
      if (res.success && res.data) {
        setJobs(res.data.content || []);
        setPageInfo({
          pageNo: res.data.pageNo,
          pageSize: res.data.pageSize,
          totalElements: res.data.totalElements,
          totalPages: res.data.totalPages,
        });
      }
    } catch (err) {
      console.error('Error fetching admin jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, page]);

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await adminService.updateJobStatus(jobId, newStatus);
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Failed to update job status');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Job Moderation Console</h1>
          <p className="text-slate-400 text-sm mt-1">Review and approve or reject job postings created by recruiters across the platform.</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="DEACTIVATED">DEACTIVATED</option>
        </select>
      </div>

      {loading ? (
        <SkeletonLoader count={4} height="h-28" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="There are no job postings matching your selected moderation filter."
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-6 glass-card rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="blue">{job.company?.name}</Badge>
                  <Badge>{job.status}</Badge>
                  <Badge variant="purple">{job.workMode}</Badge>
                </div>
                <h3 className="text-lg font-bold text-white">{job.title}</h3>
                <p className="text-xs text-slate-400 flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>Recruiter: {job.recruiterName}</span>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {job.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus(job.id, 'APPROVED')}
                    className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}

                {job.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleUpdateStatus(job.id, 'REJECTED')}
                    className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}

                {job.status !== 'DEACTIVATED' && (
                  <button
                    onClick={() => handleUpdateStatus(job.id, 'DEACTIVATED')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
                  >
                    Deactivate
                  </button>
                )}
              </div>
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

export default JobManagementPage;
