import React, { useState } from 'react';
import { RecommendationResponse, UserProfile } from '../types';
import CareerCard from './CareerCard';
import ResumeTools from './ResumeTools';
import { BookOpen, TrendingUp, Users, IndianRupee, Layers, Layout, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardProps {
  data: RecommendationResponse;
  userProfile: UserProfile;
  onReset: () => void;
}

type Tab = 'CAREERS' | 'RESUME';

const Dashboard: React.FC<DashboardProps> = ({ data, userProfile, onReset }) => {
  const [activeTab, setActiveTab] = useState<Tab>('CAREERS');
  const [selectedCareerId, setSelectedCareerId] = useState<string>(data.careers[0].id);

  const selectedCareer = data.careers.find(c => c.id === selectedCareerId) || data.careers[0];

  // Prepare data for comparison chart
  const comparisonData = data.careers.map(c => ({
    name: c.title.split(' ')[0] + '...', // Truncate for display
    fullTitle: c.title,
    Match: c.matchScore,
    SalaryPotential: parseInt(c.salaryRange.max.replace(/[^0-9]/g, '')) / 1000, // Normalized roughly
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-emerald-300 mb-2">
            Career Dashboard
          </h1>
          <p className="text-slate-400 text-sm">Welcome back, {userProfile.name}</p>
        </div>
        
        {/* Main Tabs */}
        <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
           <button 
             onClick={() => setActiveTab('CAREERS')}
             className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'CAREERS' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             <Layout className="w-4 h-4" /> Career Paths
           </button>
           <button 
             onClick={() => setActiveTab('RESUME')}
             className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'RESUME' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             <FileText className="w-4 h-4" /> Resume Studio
           </button>
        </div>
      </div>

      {activeTab === 'RESUME' ? (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
           <ResumeTools userProfile={userProfile} />
           <div className="mt-6 flex justify-end">
             <button onClick={onReset} className="text-sm text-slate-500 hover:text-brand-400 underline decoration-brand-400/30">
               Start Over Analysis
             </button>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-left-4 duration-300">
          
          {/* Left Column: List of Careers */}
          <div className="lg:col-span-4 space-y-4 h-fit">
            
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mb-6">
               <h3 className="text-slate-300 font-medium mb-2 text-sm">AI Analysis</h3>
               <p className="text-slate-400 text-xs leading-relaxed italic">
                "{data.analysis}"
               </p>
            </div>

            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Recommended Paths</h3>
            <div className="space-y-4">
              {data.careers.map((career) => (
                <CareerCard 
                  key={career.id} 
                  career={career} 
                  isActive={selectedCareerId === career.id}
                  onClick={() => setSelectedCareerId(career.id)}
                />
              ))}
            </div>

            {/* Market Trends Chart */}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 mt-8 hidden md:block">
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                <Layers className="w-4 h-4 text-brand-400" />
                Match vs Potential
              </h4>
              <div className="h-40 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 10}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                      cursor={{fill: '#334155', opacity: 0.2}}
                    />
                    <Bar dataKey="Match" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="SalaryPotential" name="Income Index" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <button onClick={onReset} className="mt-4 w-full py-2 text-xs text-slate-500 hover:text-brand-400 border border-transparent hover:border-brand-900 rounded transition-colors">
                Start Over
              </button>
            </div>
          </div>

          {/* Right Column: Detailed View */}
          <div className="lg:col-span-8">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl relative min-h-[800px]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-emerald-500 to-brand-500 opacity-50"></div>
                
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{selectedCareer.title}</h2>
                      <p className="text-slate-300 text-lg leading-relaxed">{selectedCareer.description}</p>
                    </div>
                    <div className="hidden md:block flex-shrink-0 ml-4">
                      <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700 text-center">
                          <div className="text-xs text-slate-400 uppercase tracking-wide">Growth</div>
                          <div className="text-emerald-400 font-bold text-lg">{selectedCareer.growthTrend}</div>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <IndianRupee className="w-4 h-4 text-emerald-500" /> Salary Range
                      </div>
                      <div className="text-white font-semibold">
                        {selectedCareer.salaryRange.min} - {selectedCareer.salaryRange.max}
                      </div>
                    </div>
                    <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <Users className="w-4 h-4 text-blue-500" /> Market Demand
                      </div>
                      <div className={`font-semibold ${selectedCareer.marketDemand === 'High' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {selectedCareer.marketDemand}
                      </div>
                    </div>
                    <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <TrendingUp className="w-4 h-4 text-brand-500" /> Match Score
                      </div>
                      <div className="text-brand-400 font-semibold">
                        {selectedCareer.matchScore}% Fit
                      </div>
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Why it's a great fit
                      </h4>
                      <ul className="space-y-2">
                        {selectedCareer.pros.map((pro, i) => (
                          <li key={i} className="text-slate-300 text-sm flex items-start gap-2 bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                            <span className="text-emerald-500 mt-0.5">✓</span> {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Considerations
                      </h4>
                      <ul className="space-y-2">
                        {selectedCareer.cons.map((con, i) => (
                          <li key={i} className="text-slate-300 text-sm flex items-start gap-2 bg-orange-500/5 p-2 rounded border border-orange-500/10">
                            <span className="text-orange-500 mt-0.5">!</span> {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-8">
                    <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCareer.requiredSkills.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm border border-slate-600 hover:border-slate-500 transition-colors cursor-default">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Roadmap Section */}
                  <div className="border-t border-slate-700 pt-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-brand-400" />
                      Your Roadmap
                    </h3>
                    <div className="space-y-8 relative pl-4">
                        <div className="absolute left-[27px] top-2 bottom-4 w-0.5 bg-slate-700"></div>
                        {selectedCareer.roadmap.map((step, index) => (
                          <div key={index} className="relative flex gap-6 group">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 border-2 border-brand-500 z-10 flex items-center justify-center text-[10px] font-bold text-brand-400 mt-1 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                              {index + 1}
                            </div>
                            <div className="bg-slate-700/20 p-4 rounded-lg border border-slate-700/50 flex-grow hover:bg-slate-700/40 transition-colors">
                              <div className="flex justify-between items-start mb-1">
                                <h5 className="font-bold text-white">{step.title}</h5>
                                <span className="text-xs text-brand-300 bg-brand-900/30 px-2 py-0.5 rounded-full border border-brand-500/20 whitespace-nowrap ml-2">{step.duration}</span>
                              </div>
                              <p className="text-sm text-slate-300">{step.description}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;