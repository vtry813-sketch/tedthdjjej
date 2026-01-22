
import React, { useState } from 'react';
// Ensured Link is imported correctly from react-router-dom.
import { Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referral: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      setStep(2); // Show verification screen
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117] p-8">
        <div className="w-full max-w-md bg-[#151921] border border-white/5 rounded-[40px] p-12 text-center shadow-2xl">
           <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle2 size={48} />
           </div>
           <h2 className="text-3xl font-black text-white mb-4">Check your Email</h2>
           <p className="text-gray-500 leading-relaxed mb-8">
             We've sent a verification link to <span className="text-blue-400 font-bold">{formData.email}</span>. Please verify your account to start deploying.
           </p>
           <Link to="/login" className="inline-block w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all">
             Back to Login
           </Link>
           <p className="mt-8 text-xs text-gray-600">
             Note: Verification is mandatory for security reasons. Gmail addresses are prioritized.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex flex-col justify-between lg:w-1/2 bg-blue-600 p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
             <div className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center font-black text-2xl">B</div>
             <span className="text-2xl font-black">BotCloud</span>
          </div>
          <h1 className="text-5xl font-black leading-tight mb-8">
             Build the future of <span className="text-blue-200">automated systems.</span>
          </h1>
          <p className="text-blue-100 text-xl max-w-md leading-relaxed">
             Join 1,000+ developers deploying production-ready bots with zero configuration.
          </p>
        </div>
        
        <div className="relative z-10 grid grid-cols-2 gap-8 mb-12">
           <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md">
              <h3 className="text-4xl font-black mb-1">100+</h3>
              <p className="text-sm font-bold opacity-70">Daily Deploys</p>
           </div>
           <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md">
              <h3 className="text-4xl font-black mb-1">99.9%</h3>
              <p className="text-sm font-bold opacity-70">Network Uptime</p>
           </div>
        </div>

        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-[0.05] rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#0f1117]">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-black text-white">Create Account</h2>
            <p className="text-gray-500 mt-2">Get started with a free coin on us.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Username</span>
                <div className="mt-2 relative">
                   <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                   <input 
                     type="text" 
                     required
                     value={formData.username}
                     onChange={(e) => setFormData({...formData, username: e.target.value})}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-blue-500 outline-none transition-all"
                     placeholder="alex_dev"
                   />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email (Gmail Required)</span>
                <div className="mt-2 relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                   <input 
                     type="email" 
                     required
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-blue-500 outline-none transition-all"
                     placeholder="alex@gmail.com"
                   />
                </div>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</span>
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:border-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Confirm</span>
                  <input 
                    type="password" 
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:border-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Referral Code (Optional)</span>
                <input 
                  type="text" 
                  value={formData.referral}
                  onChange={(e) => setFormData({...formData, referral: e.target.value})}
                  className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:border-blue-500 outline-none transition-all"
                  placeholder="CODE-XYZ"
                />
              </label>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl mb-6">
               <ShieldCheck className="text-blue-500 shrink-0 mt-0.5" size={18} />
               <p className="text-[11px] text-gray-500 leading-relaxed">
                 By creating an account, you agree to our terms of service. Users caught abusing resources or deploying malware will be permanently banned.
               </p>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Register Account
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account? <Link to="/login" className="text-blue-500 hover:text-blue-400 font-bold">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
