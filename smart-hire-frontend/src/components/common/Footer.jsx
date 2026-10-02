import React from 'react';
import { Briefcase, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">SmartHire</span>
            </div>
            <p className="text-sm text-slate-400">
              Next-generation portfolio recruitment SaaS connecting top tech talent with innovative enterprises.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Candidates</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="hover:text-blue-400 transition-colors">Browse Jobs</Link></li>
              <li><Link to="/register?role=candidate" className="hover:text-blue-400 transition-colors">Candidate Account</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Recruiters</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register?role=recruiter" className="hover:text-blue-400 transition-colors">Post a Job</Link></li>
              <li><Link to="/register?role=recruiter" className="hover:text-blue-400 transition-colors">Employer Solutions</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Recruiter Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Built with Spring Boot 3 & React</li>
              <li>JWT Authentication & Role-Based Access</li>
              <li>MySQL Relational Schema</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SmartHire Platform. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for enterprise software portfolios</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
