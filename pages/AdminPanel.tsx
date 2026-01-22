
import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Ban, 
  Unlock, 
  Trash2, 
  Coins, 
  Search, 
  Activity,
  ArrowUpRight,
  Filter,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { User, UserRole, Bot } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'bots' | 'system'>('users');

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-blue-500" size={32} />
            Command Center
          </h1>
          <p className="text-gray-500 mt-1">Global administrative controls and system monitoring.</p>
        </div>
        <div className="flex bg-[#151921] p-1 rounded-2xl border border-white/5">
           <button 
             onClick={() => setActiveTab('users')}
             className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-white'}`}
           >
             Users
           </button>
           <button 
             onClick={() => setActiveTab('bots')}
             className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'bots' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-white'}`}
           >
             Global Bots
           </button>
           <button 
             onClick={() => setActiveTab('system')}
             className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'system' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-white'}`}
           >
             System
           </button>
        </div>
      </header>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#151921] border border-white/5 p-6 rounded-2xl">
           <p className="text-gray-500 text-sm font-medium">Total Users</p>
           <div className="flex items-center justify-between mt-2">
              <h3 className="text-3xl font-bold">1,284</h3>
              <span className="text-green-500 text-xs font-bold">+12% this week</span>
           </div>
        </div>
        <div className="bg-[#151921] border border-white/5 p-6 rounded-2xl">
           <p className="text-gray-500 text-sm font-medium">Active Nodes</p>
           <div className="flex items-center justify-between mt-2">
              <h3 className="text-3xl font-bold">412</h3>
              <span className="text-blue-500 text-xs font-bold">Capacity: 74%</span>
           </div>
        </div>
        <div className="bg-[#151921] border border-white/5 p-6 rounded-2xl">
           <p className="text-gray-500 text-sm font-medium">Monthly Revenue</p>
           <div className="flex items-center justify-between mt-2">
              <h3 className="text-3xl font-bold">12.4k</h3>
              <span className="text-gray-500 text-xs font-bold">Coins Transferred</span>
           </div>
        </div>
        <div className="bg-[#151921] border border-white/5 p-6 rounded-2xl">
           <p className="text-gray-500 text-sm font-medium">Alerts</p>
           <div className="flex items-center justify-between mt-2">
              <h3 className="text-3xl font-bold text-yellow-500">2</h3>
              <span className="text-yellow-500/50 text-xs font-bold">Requires Attention</span>
           </div>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="bg-[#151921] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
           <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex-1 max-w-md">
                 <Search size={18} className="text-gray-500" />
                 <input type="text" placeholder="Search users by email or username..." className="bg-transparent border-none focus:ring-0 outline-none flex-1 text-sm" />
              </div>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                    <Filter size={16} />
                    Filters
                 </button>
                 <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-all">
                    Export Data
                 </button>
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-white/5 text-gray-500 text-xs font-bold uppercase tracking-widest bg-white/[0.02]">
                   <th className="px-6 py-4">User</th>
                   <th className="px-6 py-4">Role</th>
                   <th className="px-6 py-4">Coins</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {[
                   { id: '1', username: 'AlexDev', email: 'alex@example.com', role: 'USER', coins: 142, status: 'ACTIVE', verified: true },
                   { id: '2', username: 'CryptoKing', email: 'king@crypto.com', role: 'USER', coins: 12, status: 'BANNED', verified: true },
                   { id: '3', username: 'ModPrime', email: 'mod@platform.com', role: 'ADMIN', coins: 5000, status: 'ACTIVE', verified: true },
                   { id: '4', username: 'ShadowBot', email: 'shadow@bot.com', role: 'USER', coins: 0, status: 'ACTIVE', verified: false },
                 ].map(u => (
                   <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center font-bold">
                           {u.username.charAt(0)}
                         </div>
                         <div>
                           <p className="font-bold text-sm">{u.username}</p>
                           <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                         {u.role}
                       </span>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <Coins size={14} className="text-yellow-500" />
                          {u.coins.toLocaleString()}
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                           <span className={`text-sm font-medium ${u.status === 'ACTIVE' ? 'text-green-500' : 'text-red-500'}`}>{u.status}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg transition-all" title="Add/Remove Coins">
                              <Coins size={16} />
                           </button>
                           {u.status === 'ACTIVE' ? (
                             <button className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all" title="Ban User">
                               <Ban size={16} />
                             </button>
                           ) : (
                             <button className="p-2 bg-white/5 hover:bg-green-500/20 hover:text-green-400 rounded-lg transition-all" title="Unban User">
                               <Unlock size={16} />
                             </button>
                           )}
                           <button className="p-2 bg-white/5 hover:bg-red-600/20 hover:text-red-500 rounded-lg transition-all" title="Delete Account">
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {activeTab === 'bots' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="bg-[#151921] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                      <AlertTriangle size={24} />
                   </div>
                   <span className="text-xs font-bold text-gray-500">Node #42</span>
                </div>
                <h3 className="font-bold text-lg mb-1">Critical Load Alert</h3>
                <p className="text-gray-500 text-sm">System resources on Node #42 are exceeding 95% capacity.</p>
              </div>
              <button className="mt-6 w-full py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-all">
                 Evacuate Node
              </button>
           </div>
           {/* ... more global bot management cards ... */}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
