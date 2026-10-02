import React from 'react';

const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const variants = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
    green: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    yellow: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    red: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
  };

  // Status mapping
  const getVariant = (val) => {
    if (!val) return variants[variant] || variants.default;
    const uppercaseVal = String(val).toUpperCase();

    if (uppercaseVal === 'APPLIED' || uppercaseVal === 'PENDING') return variants.yellow;
    if (uppercaseVal === 'UNDER_REVIEW') return variants.blue;
    if (uppercaseVal === 'SHORTLISTED') return variants.indigo;
    if (uppercaseVal === 'INTERVIEW' || uppercaseVal === 'APPROVED') return variants.purple;
    if (uppercaseVal === 'HIRED' || uppercaseVal === 'COMPLETED') return variants.green;
    if (uppercaseVal === 'REJECTED' || uppercaseVal === 'CANCELLED' || uppercaseVal === 'DEACTIVATED') return variants.red;
    if (uppercaseVal === 'WITHDRAWN') return variants.default;

    return variants[variant] || variants.default;
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${getVariant(children)}`}>
      {children}
    </span>
  );
};

export default Badge;
