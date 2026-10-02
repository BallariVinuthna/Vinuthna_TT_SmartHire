import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Briefcase, Users, Edit, Trash2, MapPin } from 'lucide-react';
import { jobService } from '../../services/jobService';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const RecruiterJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 0, pageSize: 10, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobService.getRecruiterJobs({ page, size: 10 });
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
      console.error('Error fetching recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this job listing?')) return;
    try {
      await jobService.deleteJob(id);
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Failed to deactivate job');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Job Listings Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage positions posted for your company.</p>
        </div>

        <Link
          to="/recruiter/jobs/create"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {loading ? (
        <SkeletonLoader count={4} height="h-32" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job listings found"
          description="You haven't created any job openings yet."
          action={
            <Link
              to="/recruiter/jobs/create"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl"
            >
              Create First Job
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-6 glass-card rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="blue">{job.status}</Badge>
                  <Badge variant="purple">{job.workMode}</Badge>
                  <Badge variant="indigo">{job.jobType.replace('_', ' ')}</Badge>
                </div>
                <h3 className="text-lg font-bold text-white">{job.title}</h3>
                <p className="text-xs text-slate-400 flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>Posted: {job.createdAt?.split('T')[0]}</span>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  to={`/recruiter/jobs/${job.id}/applicants`}
                  className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all flex items-center space-x-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>Applicants</span>
                </Link>

                <Link
                  to={`/recruiter/jobs/${job.id}/edit`}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                  title="Edit Job"
                >
                  <Edit className="w-4 h-4" />
                </Link>

                {job.status !== 'DEACTIVATED' && (
                  <button
                    onClick={() => handleDeactivate(job.id)}
                    className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700 transition-colors"
                    title="Deactivate Job"
                  >
                    <Trash2 className="w-4 h-4" />
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

export default RecruiterJobsPage;
