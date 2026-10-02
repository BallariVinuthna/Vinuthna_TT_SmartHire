import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Filter, Building2, Briefcase, ChevronRight, X } from 'lucide-react';
import { jobService } from '../../services/jobService';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const PublicJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 0, pageSize: 10, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || '');
  const [skill, setSkill] = useState(searchParams.get('skill') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0'));

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 10,
        query: query || undefined,
        location: location || undefined,
        jobType: jobType || undefined,
        workMode: workMode || undefined,
        skill: skill || undefined,
      };

      const res = await jobService.getPublicJobs(params);
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
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, jobType, workMode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchJobs();
  };

  const handleClearFilters = () => {
    setQuery('');
    setLocation('');
    setJobType('');
    setWorkMode('');
    setSkill('');
    setPage(0);
    setSearchParams({});
    fetchJobs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Explore Career Opportunities</h1>
        <p className="text-slate-400 text-sm mt-1">Discover tech jobs matching your skills and work preferences.</p>
      </div>

      {/* Filter & Search Bar */}
      <form onSubmit={handleSearchSubmit} className="p-4 glass-card rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Title or keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
            />
          </div>

          <div className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <MapPin className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="City, state, or country..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
            />
          </div>

          <div className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <Briefcase className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Skill (e.g. Java, React)..."
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={jobType}
              onChange={(e) => { setJobType(e.target.value); setPage(0); }}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Job Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>

            <select
              value={workMode}
              onChange={(e) => { setWorkMode(e.target.value); setPage(0); }}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Work Modes</option>
              <option value="ON_SITE">On-Site</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </select>

            {(query || location || jobType || workMode || skill) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center space-x-1 px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800/60 rounded-xl transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {/* Jobs Listing Grid */}
      {loading ? (
        <SkeletonLoader count={4} height="h-36" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No jobs match your search"
          description="Try broadening your search query or clear selected filter criteria."
          action={
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 glass-card rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="blue">{job.company?.name}</Badge>
                  <Badge variant="purple">{job.workMode}</Badge>
                  <Badge variant="indigo">{job.jobType.replace('_', ' ')}</Badge>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                </h3>

                <p className="text-xs text-slate-400 flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.location}</span>
                  </span>
                  <span>•</span>
                  <span>{job.experienceRequired || 0}+ years exp</span>
                  {job.salaryMin && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">
                        ${job.salaryMin.toLocaleString()} - ${job.salaryMax ? job.salaryMax.toLocaleString() : 'Negotiable'}
                      </span>
                    </>
                  )}
                </p>

                <p className="text-sm text-slate-300 line-clamp-2 pt-1">{job.description}</p>
              </div>

              <div className="flex items-center space-x-3 self-end md:self-center">
                <Link
                  to={`/jobs/${job.id}`}
                  className="px-5 py-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all text-sm font-semibold flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <Pagination
            pageNo={pageInfo.pageNo}
            totalPages={pageInfo.totalPages}
            totalElements={pageInfo.totalElements}
            pageSize={pageInfo.pageSize}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}
    </div>
  );
};

export default PublicJobsPage;
