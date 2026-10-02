import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title = 'No items found', description = 'There are no records to display at the moment.', action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center glass-card rounded-2xl border border-slate-800 my-4">
      <div className="p-4 bg-slate-800/80 rounded-full text-blue-400 mb-4 border border-slate-700/60 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-slate-400 text-sm max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
