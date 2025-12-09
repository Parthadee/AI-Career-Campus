import React, { useState } from 'react';
import { UserProfile, AtsAnalysis } from '../types';
import { generateResumeDraft, analyzeResumeATS } from '../services/geminiService';
import { FileText, CheckSquare, Loader2, Copy, AlertTriangle, CheckCircle, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ResumeToolsProps {
  userProfile: UserProfile;
}

type ToolMode = 'BUILDER' | 'ATS';

const ResumeTools: React.FC<ResumeToolsProps> = ({ userProfile }) => {
  const [mode, setMode] = useState<ToolMode>('BUILDER');
  const [generatedResume, setGeneratedResume] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // ATS Checker State
  const [atsInput, setAtsInput] = useState('');
  const [targetCountry, setTargetCountry] = useState('India');
  const [atsResult, setAtsResult] = useState<AtsAnalysis | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleGenerateResume = async () => {
    setIsGenerating(true);
    try {
      const draft = await generateResumeDraft(userProfile);
      setGeneratedResume(draft);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyResume = () => {
    navigator.clipboard.writeText(generatedResume);
  };

  const handleDownloadPDF = () => {
    if (!generatedResume) return;

    const doc = new jsPDF();
    
    // Set font properties
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    // Simple page settings
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - (margin * 2);
    
    // Split text into lines that fit the width
    const splitText = doc.splitTextToSize(generatedResume, maxLineWidth);
    
    let cursorY = 20;
    
    // Add title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Resume Draft - ${userProfile.name}`, margin, cursorY);
    cursorY += 10;
    
    // Reset font for body
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    // Add content line by line handling page breaks
    splitText.forEach((line: string) => {
        if (cursorY > 280) { // Check for end of page
            doc.addPage();
            cursorY = 20;
        }
        doc.text(line, margin, cursorY);
        cursorY += 6; // Line height
    });

    doc.save(`${userProfile.name.replace(/\s+/g, '_')}_Resume_Draft.pdf`);
  };

  const handleCheckATS = async () => {
    if (!atsInput.trim()) return;
    setIsChecking(true);
    setAtsResult(null);
    try {
      const result = await analyzeResumeATS(atsInput, targetCountry);
      setAtsResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden min-h-[600px]">
      {/* Tool Navigation */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setMode('BUILDER')}
          className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            mode === 'BUILDER' ? 'bg-slate-800 text-brand-400 border-b-2 border-brand-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> AI Resume Builder
        </button>
        <button
          onClick={() => setMode('ATS')}
          className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            mode === 'ATS' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> ATS Score Checker
        </button>
      </div>

      <div className="p-6">
        {mode === 'BUILDER' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-brand-900/50 to-slate-800 p-6 rounded-xl border border-brand-500/20">
                <h3 className="text-xl font-bold text-white mb-2">Generate Your Resume</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Create an ATS-optimized resume draft based on your profile data. 
                  Targeted for the {userProfile.stage === 'POST_12TH' ? 'Student' : 'Professional'} market.
                </p>
                
                <div className="bg-slate-900/50 p-4 rounded-lg mb-6 text-sm text-slate-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Name:</span> <span className="text-white">{userProfile.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Background:</span> <span className="text-white">{userProfile.academicBackground}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skills:</span> <span className="text-white">{userProfile.skills.length} listed</span>
                  </div>
                </div>

                <button
                  onClick={handleGenerateResume}
                  disabled={isGenerating}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                  {generatedResume ? 'Regenerate Draft' : 'Generate Resume Draft'}
                </button>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 relative overflow-hidden min-h-[400px]">
              {generatedResume ? (
                <>
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button 
                      onClick={handleCopyResume}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition group relative"
                      title="Copy to Clipboard"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="absolute -bottom-8 right-0 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Copy Text</span>
                    </button>
                    <button 
                      onClick={handleDownloadPDF}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-md border border-brand-500 transition flex items-center gap-2 text-xs font-medium"
                      title="Download PDF"
                    >
                      <FileDown className="w-4 h-4" />
                      Download Resume
                    </button>
                  </div>
                  <div className="overflow-auto h-[500px] text-sm text-slate-300 font-mono whitespace-pre-wrap p-2 custom-scrollbar pt-12">
                    {generatedResume}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <FileText className="w-12 h-12 mb-4 opacity-20" />
                  <p>Your generated resume will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === 'ATS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Target Country</label>
                  <select 
                    value={targetCountry}
                    onChange={(e) => setTargetCountry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Russia">Russia</option>
                    <option value="European Countries">European Union</option>
                  </select>
               </div>
               
               <div className="flex-grow">
                 <label className="block text-sm font-medium text-slate-300 mb-2">Paste Resume Text</label>
                 <textarea 
                    value={atsInput}
                    onChange={(e) => setAtsInput(e.target.value)}
                    className="w-full h-80 bg-slate-950 border border-slate-700 rounded-lg p-4 text-sm text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-mono"
                    placeholder="Paste the text content of your resume here..."
                 />
               </div>

               <button
                  onClick={handleCheckATS}
                  disabled={isChecking || !atsInput.trim()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckSquare className="w-5 h-5" />}
                  Check ATS Score
                </button>
             </div>

             <div className="space-y-6">
               {!atsResult ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-600 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                    <CheckSquare className="w-16 h-16 mb-4 opacity-20" />
                    <p>Paste your resume to see the analysis</p>
                 </div>
               ) : (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    {/* Score Card */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-6">
                       <div className="relative w-24 h-24 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="8" fill="none" />
                            <circle 
                              cx="48" cy="48" r="40" 
                              stroke={atsResult.score > 70 ? '#10b981' : atsResult.score > 40 ? '#f59e0b' : '#ef4444'} 
                              strokeWidth="8" 
                              fill="none" 
                              strokeDasharray="251.2" 
                              strokeDashoffset={251.2 - (251.2 * atsResult.score) / 100} 
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <span className="absolute text-2xl font-bold text-white">{atsResult.score}</span>
                       </div>
                       <div>
                         <h4 className="text-lg font-bold text-white mb-1">ATS Compatibility Score</h4>
                         <p className="text-sm text-slate-400">{atsResult.summary}</p>
                       </div>
                    </div>

                    {/* Analysis Details */}
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <h5 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                           <CheckCircle className="w-4 h-4" /> Country Specific Advice ({targetCountry})
                        </h5>
                        <p className="text-sm text-slate-300">{atsResult.countrySpecificAdvice}</p>
                      </div>

                      {atsResult.missingKeywords.length > 0 && (
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                          <h5 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Missing Keywords / Concepts
                          </h5>
                          <div className="flex flex-wrap gap-2">
                             {atsResult.missingKeywords.map((k, i) => (
                               <span key={i} className="px-2 py-1 bg-orange-500/10 text-orange-300 text-xs rounded border border-orange-500/20">{k}</span>
                             ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <h5 className="text-blue-400 font-semibold mb-2">Suggestions</h5>
                        <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                          {atsResult.suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                 </div>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeTools;