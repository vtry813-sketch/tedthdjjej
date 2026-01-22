
import React from 'react';
import { User, BotStatus } from '../types';
import { 
  Zap, 
  Clock, 
  Server, 
  ShieldAlert, 
  ArrowUpRight, 
  Terminal, 
  Activity,
  Calendar,
  CreditCard,
  // Fix: Import missing icons to resolve JSX and name errors
  History,
  Gift
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
  <div className="bg-[#151921] border border-white/5 p-6 rounded-2xl hover:border-blue-500/30 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <ArrowUpRight size={20} className="text-gray-600 group-hover:text-gray-300 transition-colors" />
    </div>
    <p className="text-gray-400 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold mt-1">{value}</h3>
  </div>
);

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Good evening, {user.username}</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your deployments today.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all">
            <Zap size={18} />
            Deploy Now
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Bots" value="3" icon={Server} color="bg-blue-500" />
        <StatCard title="Total Coins" value={user.coins === Infinity ? '∞' : user.coins} icon={CreditCard} color="bg-yellow-500" />
        <StatCard title="Uptime" value="99.9%" icon={Activity} color="bg-green-500" />
        <StatCard title="Expiring Soon" value="1" icon={Clock} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#151921] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History size={20} className="text-blue-500" />
              Deployment Logs
            </h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View all</button>
          </div>
          <div className="divide-y divide-white/5">
            {[
              { id: '1', name: 'MusicBot Pro', status: 'SUCCESS', msg: 'Successfully deployed version v1.2.4', time: '2 mins ago' },
              { id: '2', name: 'CryptoTracker', status: 'SYSTEM', msg: 'Auto-restart triggered due to high memory', time: '1 hour ago' },
              { id: '3', name: 'EconomyBot', status: 'ERROR', msg: 'Process exited with code 1: Missing API Key', time: '5 hours ago' },
              { id: '4', name: 'AdminPanel', status: 'SUCCESS', msg: 'Initial deployment successful', time: 'Yesterday' },
            ].map((log) => (
              <div key={log.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    log.status === 'SUCCESS' ? 'bg-green-500' : 
                    log.status === 'ERROR' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-semibold text-sm">{log.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{log.msg}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
             <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Claim Daily Reward</h3>
                <p className="text-blue-100 text-sm mb-4">Get your free daily coin to keep your servers running longer!</p>
                <button className="w-full py-2.5 bg-white text-blue-700 font-bold rounded-xl hover:scale-105 transition-transform">
                  Claim +1 Coin
                </button>
             </div>
             <Gift className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:rotate-12 transition-transform" />
          </div>

          <div className="bg-[#151921] border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-purple-400" />
              Upcoming Expirations
            </h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center font-bold text-white text-xs">M</div>
                   <span className="text-sm font-semibold">MusicBot</span>
                 </div>
                 <span className="text-xs font-bold text-red-400">12h left</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-xs">C</div>
                   <span className="text-sm font-semibold">CryptoTracker</span>
                 </div>
                 <span className="text-xs font-bold text-gray-400">3 days</span>
               </div>
            </div>
            <button className="w-full mt-6 py-2 border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/5 transition-all">
              Manage all Bots
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
