import React, { useState, useEffect } from 'react';
import { UserProfile, RecommendationResponse } from './types';
import OnboardingForm from './components/OnboardingForm';
import Dashboard from './components/Dashboard';
import { generateCareerPaths } from './services/geminiService';
import { Compass, Sparkles, Building2, LogIn, UserPlus, X, LogOut, User } from 'lucide-react';

interface AuthUser {
  name: string;
  email: string;
}

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auth State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('careerCampus_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Error parsing user session:", e);
      localStorage.removeItem('careerCampus_user');
    }
  }, []);

  const handleProfileComplete = async (userProfile: UserProfile) => {
    setProfile(userProfile);
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateCareerPaths(userProfile);
      setRecommendations(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProfile(null);
    setRecommendations(null);
    setError(null);
  };

  const handleAuthSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string; 

    // Simulate Auth - In a real app, this would hit a backend
    const newUser = {
      email,
      name: name || (authMode === 'login' ? 'Demo User' : 'New User')
    };

    setUser(newUser);
    localStorage.setItem('careerCampus_user', JSON.stringify(newUser));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('careerCampus_user');
    setProfile(null);
    setRecommendations(null);
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-brand-500/30 font-sans relative">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
              <div className="bg-gradient-to-tr from-brand-500 to-emerald-500 p-2 rounded-lg shadow-lg shadow-brand-500/20 transition-transform group-hover:scale-105">
                 <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-brand-100 transition-colors">Career<span className="text-brand-400">Campus</span></span>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                  <div className="text-sm hidden sm:block text-right">
                    <span className="text-slate-400 block text-xs">Logged in as</span>
                    <span className="font-semibold text-white">{user.name}</span>
                  </div>
                  
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-brand-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-md ring-2 ring-slate-800">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-400/30 bg-slate-800/50 hover:bg-red-500/10 rounded-lg px-3 py-2 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => openAuth('login')}
                     className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2"
                   >
                     <LogIn className="w-4 h-4" />
                     Log in
                   </button>
                   <button 
                     onClick={() => openAuth('signup')}
                     className="text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors px-5 py-2 rounded-lg shadow-lg shadow-brand-900/50 flex items-center gap-2 hover:translate-y-[-1px] active:translate-y-0"
                   >
                     <UserPlus className="w-4 h-4" />
                     Sign Up
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {error && (
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-200 animate-in slide-in-from-top-2">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>
             {error}
             <button onClick={() => setError(null)} className="ml-auto text-xs hover:underline">Dismiss</button>
          </div>
        )}

        {!recommendations ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12">
            {!isLoading && (
               <div className="text-center mb-12 animate-in slide-in-from-bottom-5 duration-700">
                  {user && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-6 animate-in fade-in zoom-in duration-500">
                      <User className="w-3 h-3" />
                      Welcome back, {user.name}
                    </div>
                  )}
                  <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                    Discover Your Perfect <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-400">Career Path</span>
                  </h1>
                  <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Advanced AI analysis of your skills, interests, and academic background to find the best opportunities in the <span className="text-slate-200">Indian & Global</span> job market.
                  </p>
               </div>
            )}
            
            <OnboardingForm 
              onComplete={handleProfileComplete} 
              isLoading={isLoading} 
              initialName={user?.name}
            />
            
            {!isLoading && (
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto opacity-70">
                 <div className="p-4 rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-800/50 transition duration-300">
                    <div className="mb-3 flex justify-center text-brand-400"><Sparkles className="w-6 h-6"/></div>
                    <h4 className="font-semibold text-white mb-1">AI Powered</h4>
                    <p className="text-sm text-slate-400">Uses Gemini 2.5 Flash for deep profile analysis.</p>
                 </div>
                 <div className="p-4 rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-800/50 transition duration-300">
                    <div className="mb-3 flex justify-center text-emerald-400"><Compass className="w-6 h-6"/></div>
                    <h4 className="font-semibold text-white mb-1">Personalized</h4>
                    <p className="text-sm text-slate-400">Roadmaps tailored specifically to your background.</p>
                 </div>
                 <div className="p-4 rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-800/50 transition duration-300">
                    <div className="mb-3 flex justify-center text-blue-400"><Building2 className="w-6 h-6"/></div>
                    <h4 className="font-semibold text-white mb-1">Market Aware</h4>
                    <p className="text-sm text-slate-400">Insights based on current 2024-25 market trends.</p>
                 </div>
              </div>
            )}
          </div>
        ) : (
          <Dashboard data={recommendations} userProfile={profile!} onReset={handleReset} />
        )}
      </main>
      
      <footer className="py-8 border-t border-slate-900 mt-auto bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <p className="text-slate-500 text-sm mb-2">© {new Date().getFullYear()} CareerCampus. All rights reserved.</p>
           <p className="text-slate-600 text-xs">Powered by Google Gemini 2.5 Flash</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mb-6">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-4">
                 {authMode === 'login' ? <LogIn className="w-6 h-6 text-brand-400" /> : <UserPlus className="w-6 h-6 text-brand-400" />}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-400 text-sm">
                {authMode === 'login' ? 'Enter your details to access your saved career paths.' : 'Start your journey to finding the perfect career path.'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input 
                    name="name"
                    required
                    type="text" 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="e.g., Alex Doe"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  name="email"
                  required
                  type="email" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
                <input 
                  name="password"
                  required
                  type="password" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white rounded-lg font-bold transition shadow-lg mt-4 active:scale-[0.98]"
              >
                {authMode === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;