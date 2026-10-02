import React from 'react';

const SkeletonLoader = ({ count = 3, height = 'h-24' }) => {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${height} w-full bg-slate-800/60 rounded-xl animate-pulse border border-slate-800`}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
