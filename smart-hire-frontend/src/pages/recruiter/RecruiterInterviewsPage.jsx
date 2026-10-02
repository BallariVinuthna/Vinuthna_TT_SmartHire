import React, { useState, useEffect } from 'react';
import { Calendar, Video, Clock, User, ExternalLink } from 'lucide-react';
import { interviewService } from '../../services/interviewService';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const RecruiterInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 0, pageSize: 10, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await interviewService.getRecruiterInterviews({ page, size: 10 });
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
      console.error('Failed to fetch recruiter interviews:', err);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Scheduled Interview Rounds</h1>
        <p className="text-slate-400 text-sm mt-1">Manage technical rounds and interview meetings for your candidates.</p>
      </div>

      {loading ? (
        <SkeletonLoader count={3} height="h-32" />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No scheduled interviews"
          description="You haven't scheduled any interview rounds for candidate applications yet."
        />
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => (
            <div key={item.id} className="p-6 glass-card rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-white">
                      Candidate: {item.application?.candidate?.user?.name}
                    </h3>
                    <Badge>{item.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Position: <span className="text-white font-medium">{item.application?.job?.title}</span> • Round: <span className="text-purple-400 font-medium">{item.interviewType}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {item.scheduledAt?.replace('T', ' ').substring(0, 16)}
                  </span>
                </div>
              </div>

              {item.meetingLink && (
                <div className="pt-2 flex justify-end">
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Open Meeting Link</span>
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

export default RecruiterInterviewsPage;
