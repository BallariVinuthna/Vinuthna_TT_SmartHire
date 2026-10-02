import React, { useState, useEffect } from 'react';
import { Calendar, Video, Clock, Building2, ExternalLink } from 'lucide-react';
import { interviewService } from '../../services/interviewService';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const CandidateInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 0, pageSize: 10, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await interviewService.getCandidateInterviews({ page, size: 10 });
      if (res.success && res.data) {
        setInterviews(res.data.content || []);
        setPageInfo({
          pageNo: res.data.pageNo,
          pageSize: res.data.pageSize,
          totalElements: res.data.totalElements,
          totalPages: res.data.totalPages,
        });
      }
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [page]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Scheduled Interviews</h1>
        <p className="text-slate-400 text-sm mt-1">View upcoming and past interview schedules with meeting links.</p>
      </div>

      {loading ? (
        <SkeletonLoader count={3} height="h-32" />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No interviews scheduled"
          description="When recruiters schedule an interview round for your job application, it will appear here."
        />
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => (
            <div key={item.id} className="p-6 glass-card rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-white">{item.application?.job?.title}</h3>
                    <Badge>{item.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-400 mt-1 flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span>{item.application?.job?.company?.name}</span>
                    <span>•</span>
                    <span className="font-semibold text-purple-400">{item.interviewType}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {item.scheduledAt?.replace('T', ' ').substring(0, 16)}
                  </span>
                </div>
              </div>

              {item.notes && (
                <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-slate-400">Recruiter Notes:</span> {item.notes}
                </p>
              )}

              {item.meetingLink && (
                <div className="pt-2 flex justify-end">
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Meeting</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
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
    </div>
  );
};

export default CandidateInterviewsPage;
