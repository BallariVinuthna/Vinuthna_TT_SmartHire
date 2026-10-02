import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Sparkles, Building2, ShieldCheck, ArrowRight, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { jobService } from '../../services/jobService';
import Badge from '../../components/common/Badge';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await jobService.getPublicJobs({ page: 0, size: 4 });
        if (res.success) {
          setFeaturedJobs(res.data.content || []);
        }
      } catch (err) {
        console.error('Failed to fetch featured jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?query=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(locationQuery)}`);
  };

  return (
    <div className="space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/20 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6 border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Smart Recruitment Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Find Your Dream Job or Hire <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Top Tech Talent</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal">
            SmartHire connects elite developers with top engineering firms using automated status tracking, role-based workflows, and instant notifications.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-10 max-w-3xl mx-auto p-2 glass-card rounded-2xl border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 flex items-center space-x-3 px-4 py-3 w-full">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Job title, keywords, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm"
              />
            </div>

            <div className="h-6 w-px bg-slate-800 hidden md:block" />

            <div className="flex-1 flex items-center space-x-3 px-4 py-3 w-full">
              <MapPin className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="City, state, or Remote"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
            >
              <span>Search Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Key Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 glass-card rounded-xl border border-slate-800 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">1000+</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Active Positions</p>
            </div>
            <div className="p-4 glass-card rounded-xl border border-slate-800 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-blue-400">500+</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Verified Recruiters</p>
            </div>
            <div className="p-4 glass-card rounded-xl border border-slate-800 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-emerald-400">98%</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Hiring Success</p>
            </div>
            <div className="p-4 glass-card rounded-xl border border-slate-800 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-purple-400">&lt; 24h</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Response Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Featured Opportunities</h2>
            <p className="text-slate-400 text-sm mt-1">Explore top roles handpicked from premier tech companies.</p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-medium text-sm mt-4 md:mt-0 transition-colors"
          >
            <span>View all opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredJobs.map((job) => (
            <div key={job.id} className="p-6 glass-card rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                      <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                    </h3>
                    <p className="text-sm font-medium text-slate-400 mt-1 flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span>{job.company?.name}</span>
                      <span>•</span>
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{job.location}</span>
                    </p>
                  </div>
                  <Badge>{job.jobType.replace('_', ' ')}</Badge>
                </div>

                <p className="text-slate-300 text-sm mt-3 line-clamp-2">{job.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="blue">{job.workMode}</Badge>
                  {job.experienceRequired !== null && (
                    <span className="text-xs text-slate-400 font-medium">
                      {job.experienceRequired}+ yrs exp
                    </span>
                  )}
                </div>
                <Link
                  to={`/jobs/${job.id}`}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-600/30 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY SMARTHIRE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white">Why Candidates & Employers Choose SmartHire</h2>
          <p className="text-slate-400 text-sm mt-2">Built with security, role-based workflows, and automated hiring pipelines.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 glass-card rounded-2xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Role-Based Portals</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dedicated dashboards customized for Candidates, Recruiters, and Platform Admins with strict JWT Spring Security authorization.
            </p>
          </div>

          <div className="p-8 glass-card rounded-2xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Transparent Hiring Pipeline</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track status history from APPLIED → SHORTLISTED → INTERVIEW → HIRED with real-time audit logs and candidate notifications.
            </p>
          </div>

          <div className="p-8 glass-card rounded-2xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Integrated Scheduling</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Recruiters schedule interviews with meeting links directly into candidate calendars with automated HTML email dispatch.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative p-10 sm:p-16 rounded-3xl glass-card border border-blue-500/30 overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white relative z-10">
            Ready to Accelerate Your Career or Scale Your Engineering Team?
          </h2>
          <p className="mt-4 text-slate-300 max-w-xl mx-auto text-sm sm:text-base relative z-10">
            Create an account today to access thousands of curated jobs or start posting open positions.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              to="/register?role=candidate"
              className="px-8 py-3.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/30 w-full sm:w-auto"
            >
              Join as Candidate
            </Link>
            <Link
              to="/register?role=recruiter"
              className="px-8 py-3.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm hover:bg-slate-700 transition-all w-full sm:w-auto"
            >
              Hire Software Talent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
