import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pageNo, totalPages, totalElements, pageSize, onPageChange }) => {
  if (totalPages <= 1) return null;

  const startItem = pageNo * pageSize + 1;
  const endItem = Math.min((pageNo + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-slate-800">
      <div className="text-sm text-slate-400">
        Showing <span className="font-semibold text-slate-200">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-200">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-200">{totalElements}</span> results
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(pageNo - 1)}
          disabled={pageNo === 0}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 text-sm font-medium text-slate-300 bg-slate-800/60 rounded-lg border border-slate-700">
          Page {pageNo + 1} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(pageNo + 1)}
          disabled={pageNo >= totalPages - 1}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
