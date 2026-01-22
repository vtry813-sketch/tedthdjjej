
import React, { useState } from 'react';
// Updated imports to use standard v6 Link and useNavigate.
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Shield, ArrowRight, Zap, Loader2, AlertCircle } from 'lucide-react';
import { User, UserRole } from '../types.ts';

const Login: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      localStorage.setItem('token', data.token);
      onLogin(data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex flex-col justify-between lg:w-1/2 bg-blue-600 p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center font-black text-2xl shadow-xl">B</div>
            <span className="text-2xl font-black tracking-tight">BotCloud</span>
          </div>
          <h1 className="text-5xl font-black leading-tight mb-8">
            The private engine for your <span className="text-blue-200">automation bots.</span>
          </h1>
          <div className="space-y-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                   <Shield size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Enterprise Security</h3>
                  <p className="text-blue-100 text-sm">Isolated containers and memory protection.</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                   <Zap size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Git Deployments</h3>
                  <p className="text-blue-100 text-sm">Automatic CI/CD for your Node.js apps.</p>
                </div>
             </div>
          </div>
        </div>
        
        <div className="relative z-10 mt-auto">
           <div className="bg-black/20 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
              <p className="text-sm font-medium italic opacity-80">"The fastest deployment engine I've ever used. Scale your bots in seconds with a few coins."</p>
              <div className="flex items-center gap-3 mt-4">
                 <div className="w-8 h-8 rounded-full bg-white/20" />
                 <div>
                    <p className="text-xs font-bold">InconnuBoy Tech</p>
                    <p className="text-[10px] opacity-60">Fullstack Architect</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-[0.05] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black opacity-[0.1] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#0f1117]">
        <div className="w-full max-w-md space-y-10">
          <div>
            <h2 className="text-3xl font-black text-white">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Sign in to manage your private fleet of bots.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</span>
                <div className="mt-2 relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                   <input 
                     type="email" 
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-700"
                     placeholder="name@gmail.com"
                   />
                </div>
              </label>

              <label className="block">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</span>
                   <Link to="#" className="text-xs text-blue-500 hover:text-blue-400 font-bold">Forgot?</Link>
                </div>
                <div className="mt-2 relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                   <input 
                     type="password" 
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-700"
                     placeholder="••••••••"
                   />
                </div>
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Sign In to Console
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account yet? <Link to="/register" className="text-blue-500 hover:text-blue-400 font-bold">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
