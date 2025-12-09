import React from 'react';
import { CareerOption } from '../types';
import { Target, IndianRupee } from 'lucide-react';

interface CareerCardProps {
  career: CareerOption;
  isActive: boolean;
  onClick: () => void;
}

const CareerCard: React.FC<CareerCardProps> = ({ career, isActive, onClick }) => {
  
  return (
    <div 
      className={`relative rounded-xl transition-all duration-300 border cursor-pointer overflow-hidden ${
        isActive 
          ? 'bg-slate-800 border-brand-500 shadow-lg shadow-brand-900/20 ring-1 ring-brand-500 scale-[1.02]' 
          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
      }`}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
           <div>
             <h3 className="text-lg font-bold text-white mb-1">{career.title}</h3>
             <div className="flex items-center gap-2 text-xs font-medium">
               <span className={`px-2 py-0.5 rounded-full ${career.marketDemand === 'High' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                 {career.marketDemand} Demand
               </span>
               <span className="text-slate-400">• {career.growthTrend}</span>
             </div>
           </div>
           <div className="flex flex-col items-end">
             <div className="text-2xl font-bold text-brand-400">{career.matchScore}%</div>
             <span className="text-[10px] text-slate-500 uppercase tracking-wider">Match</span>
           </div>
        </div>

        <p className="text-slate-300 text-sm line-clamp-2 mb-4">
          {career.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-1.5 text-slate-300">
             <IndianRupee className="w-4 h-4 text-emerald-400" />
             <span className="text-sm font-semibold">{career.salaryRange.min} - {career.salaryRange.max}</span>
          </div>
          <Target className={`w-5 h-5 ${isActive ? 'text-brand-400' : 'text-slate-600'}`} />
        </div>
      </div>

      {isActive && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-brand-500 to-emerald-500"></div>
      )}
    </div>
  );
};

export default CareerCard;