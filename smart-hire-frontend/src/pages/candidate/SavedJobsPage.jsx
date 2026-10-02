import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Building2, Trash2, ChevronRight } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 0, pageSize: 10, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const res = await candidateService.getSavedJobs({ page, size: 10 });
      if (res.success && res.data) {
        setSavedJobs(res.data.content || []);
        setPageInfo({
          pageNo: res.data.pageNo,
          pageSize: res.data.pageSize,
          totalElements: res.data.totalElements,
          totalPages: res.data.totalPages,
        });
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [page]);

  const handleUnsave = async (jobId) => {
    try {
      await candidateService.unsaveJob(jobId);
      fetchSavedJobs();
    } catch (err) {
      console.error('Failed to unsave job:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Saved Job Bookmarks</h1>
        <p className="text-slate-400 text-sm mt-1">Quick access to positions you have bookmarked for later application.</p>
      </div>

      {loading ? (
        <SkeletonLoader count={3} height="h-28" />
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs"
          description="Bookmark positions you are interested in to review and apply to them later."
          action={
            <Link
              to="/candidate/jobs"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all"
            >
              Browse Jobs
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {savedJobs.map((job) => (
            <div key={job.id} className="p-6 glass-card rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="blue">{job.company?.name}</Badge>
                  <Badge variant="purple">{job.workMode}</Badge>
                </div>
                <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                  <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                </h3>
                <p className="text-xs text-slate-400 flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{job.location}</span>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleUnsave(job.id)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link
                  to={`/jobs/${job.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all flex items-center space-x-1"
                >
                  <span>Apply Now</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
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

export default SavedJobsPage;
