import React from 'react';

interface Props {
  current: number;
  total: number;
  score: number;
}

const ProgressBar: React.FC<Props> = ({ current, total, score }) => {
  const percentage = Math.round(((current) / total) * 100);
  
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-800">{current + 1}</span>
          <span className="text-sm font-medium text-slate-400">/ {total}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Score</span>
          <span className="text-lg font-bold text-fabric-600">{score}</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-fabric-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(2,132,199,0.5)]" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;