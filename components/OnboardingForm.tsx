import React, { useState, useEffect } from 'react';
import { UserProfile, UserStage } from '../types';
import { ChevronRight, ChevronLeft, GraduationCap, Briefcase, Sparkles, BookOpen, Globe, Building2, Home } from 'lucide-react';

interface OnboardingFormProps {
  onComplete: (profile: UserProfile) => void;
  isLoading: boolean;
  initialName?: string;
}

const INTEREST_TAGS = [
  "Technology", "Art & Design", "Medicine", "Finance", "Social Impact", 
  "Writing", "Engineering", "Management", "Teaching", "Sports", "Gaming", 
  "Environment", "Law", "Entrepreneurship", "Data Science", "Psychology"
];

const SKILL_TAGS = [
  "Communication", "Coding", "Problem Solving", "Leadership", "Mathematics",
  "Creativity", "Analysis", "Teamwork", "Public Speaking", "Research",
  "Project Management", "Design", "Sales", "Critical Thinking"
];

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete, isLoading, initialName }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    stage: UserStage.POST_12TH,
    interests: [],
    skills: [],
    preferredWorkEnvironment: 'Hybrid',
    name: initialName || ''
  });
  
  useEffect(() => {
    if (initialName) {
      setFormData(prev => ({ ...prev, name: initialName }));
    }
  }, [initialName]);

  const [customInterest, setCustomInterest] = useState("");
  const [customSkill, setCustomSkill] = useState("");

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const toggleSelection = (field: 'interests' | 'skills', value: string) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const addCustomTag = (field: 'interests' | 'skills', value: string, setter: (s: string) => void) => {
    if (value.trim()) {
      toggleSelection(field, value.trim());
      setter("");
    }
  };

  const handleSubmit = () => {
    if (formData.name && formData.academicBackground && formData.grades) {
      onComplete(formData as UserProfile);
    }
  };

  const isStep1Valid = formData.name && formData.stage;
  const isStep2Valid = formData.academicBackground && formData.grades;
  const isStep3Valid = (formData.interests?.length ?? 0) > 0 || (formData.skills?.length ?? 0) > 0;

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
      <div className="bg-slate-900 p-6 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Create Your Profile</h2>
          <p className="text-slate-400 text-sm">Step {step} of 3</p>
        </div>
        <div className="flex gap-2">
           <div className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-brand-500' : 'bg-slate-700'}`} />
           <div className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-brand-500' : 'bg-slate-700'}`} />
           <div className={`h-2 w-8 rounded-full ${step >= 3 ? 'bg-brand-500' : 'bg-slate-700'}`} />
        </div>
      </div>

      <div className="p-8 min-h-[400px]">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-semibold text-white mb-4">Let's start with the basics</h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">What's your name?</label>
              <input 
                type="text" 
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none transition"
                placeholder="e.g., Alex Doe"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Where are you in your journey?</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData({...formData, stage: UserStage.POST_12TH})}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${formData.stage === UserStage.POST_12TH ? 'border-brand-500 bg-brand-500/10' : 'border-slate-600 hover:border-slate-500'}`}
                >
                  <GraduationCap className={`w-8 h-8 ${formData.stage === UserStage.POST_12TH ? 'text-brand-400' : 'text-slate-400'}`} />
                  <div className="text-center">
                    <span className="block font-semibold text-white">Post 12th / High School</span>
                    <span className="text-xs text-slate-400">Choosing a Major/Stream</span>
                  </div>
                </button>
                <button 
                  onClick={() => setFormData({...formData, stage: UserStage.GRADUATE})}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${formData.stage === UserStage.GRADUATE ? 'border-brand-500 bg-brand-500/10' : 'border-slate-600 hover:border-slate-500'}`}
                >
                  <Briefcase className={`w-8 h-8 ${formData.stage === UserStage.GRADUATE ? 'text-brand-400' : 'text-slate-400'}`} />
                  <div className="text-center">
                    <span className="block font-semibold text-white">Graduate / Job Seeker</span>
                    <span className="text-xs text-slate-400">Looking for Career/Switch</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <h3 className="text-2xl font-semibold text-white mb-4">Academic Background</h3>
             
             <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                {formData.stage === UserStage.POST_12TH ? 'Current Stream / Subjects' : 'Highest Degree / Major'}
              </label>
              <input 
                type="text" 
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder={formData.stage === UserStage.POST_12TH ? "e.g., Physics, Chemistry, Math (PCM)" : "e.g., B.Tech Computer Science, B.Com, BA English"}
                value={formData.academicBackground || ''}
                onChange={(e) => setFormData({...formData, academicBackground: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Performance / Grades (Approx)
              </label>
              <input 
                type="text" 
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="e.g., 85%, 3.8 GPA, or 'Above Average'"
                value={formData.grades || ''}
                onChange={(e) => setFormData({...formData, grades: e.target.value})}
              />
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 flex gap-3">
              <BookOpen className="text-brand-400 w-6 h-6 flex-shrink-0" />
              <p className="text-sm text-slate-300">
                Tip: Be honest! Our AI uses this to suggest realistic reach and safety options.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <h3 className="text-2xl font-semibold text-white mb-4">Interests, Skills & Preferences</h3>
             
             {/* Work Environment */}
             <div className="space-y-2 mb-6">
                <label className="block text-sm font-medium text-slate-300">Preferred Work Environment (Optional)</label>
                <div className="flex gap-3">
                  {['On-site', 'Hybrid', 'Remote'].map((env) => (
                    <button
                      key={env}
                      onClick={() => setFormData({ ...formData, preferredWorkEnvironment: env })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        formData.preferredWorkEnvironment === env 
                        ? 'bg-brand-500 border-brand-500 text-white' 
                        : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {env === 'On-site' && <Building2 className="w-4 h-4" />}
                      {env === 'Hybrid' && <Globe className="w-4 h-4" />}
                      {env === 'Remote' && <Home className="w-4 h-4" />}
                      {env}
                    </button>
                  ))}
                </div>
             </div>

             <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Interests</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {INTEREST_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleSelection('interests', tag)}
                        className={`px-3 py-1 rounded-full text-sm border transition-all ${
                          formData.interests?.includes(tag) 
                          ? 'bg-brand-500 border-brand-500 text-white' 
                          : 'bg-transparent border-slate-600 text-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                     <input 
                      type="text"
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomTag('interests', customInterest, setCustomInterest)}
                      placeholder="Add other interest..."
                      className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-white focus:outline-none flex-grow"
                     />
                     <button 
                      onClick={() => addCustomTag('interests', customInterest, setCustomInterest)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm"
                     >
                       Add
                     </button>
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Skills / Strengths</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {SKILL_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleSelection('skills', tag)}
                        className={`px-3 py-1 rounded-full text-sm border transition-all ${
                          formData.skills?.includes(tag) 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'bg-transparent border-slate-600 text-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                     <input 
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomTag('skills', customSkill, setCustomSkill)}
                      placeholder="Add other skill..."
                      className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-white focus:outline-none flex-grow"
                     />
                     <button 
                      onClick={() => addCustomTag('skills', customSkill, setCustomSkill)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm"
                     >
                       Add
                     </button>
                  </div>
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900 border-t border-slate-700 flex justify-between">
        <button 
          onClick={handleBack}
          disabled={step === 1 || isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {step < 3 ? (
           <button 
           onClick={handleNext}
           disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
           className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-900/50"
         >
           Next Step
           <ChevronRight className="w-5 h-5" />
         </button>
        ) : (
          <button 
          onClick={handleSubmit}
          disabled={!isStep3Valid || isLoading}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              Analyzing...
            </span>
          ) : (
            <>
              Generate Paths
              <Sparkles className="w-5 h-5" />
            </>
          )}
        </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingForm;