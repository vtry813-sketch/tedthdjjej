
import React, { useState } from 'react';
import { 
  Coins, 
  Send, 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Gift, 
  Zap, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User, Transaction } from '../types';

const TransactionItem = ({ tx }: { tx: Transaction }) => {
  const isPositive = tx.amount > 0;
  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          tx.type === 'DAILY' ? 'bg-yellow-500/10 text-yellow-500' :
          tx.type === 'DEPLOY' ? 'bg-red-500/10 text-red-500' :
          tx.type === 'TRANSFER' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
        }`}>
          {tx.type === 'DAILY' && <Gift size={20} />}
          {tx.type === 'DEPLOY' && <Zap size={20} />}
          {tx.type === 'TRANSFER' && <Send size={20} />}
          {tx.type === 'REFERRAL' && <ArrowDownLeft size={20} />}
        </div>
        <div>
          <p className="font-bold text-sm uppercase tracking-wider">{tx.type}</p>
          <p className="text-xs text-gray-500 mt-0.5">{tx.description}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{tx.amount}
        </p>
        <p className="text-[10px] text-gray-600 mt-0.5">2h ago</p>
      </div>
    </div>
  );
};

const CoinStore: React.FC<{ user: User }> = ({ user }) => {
  const [transferTarget, setTransferTarget] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Coin Economy</h1>
        <p className="text-gray-500 mt-1">Earn, transfer, and manage your platform currency.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Wallet */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-yellow-500/20">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                   <p className="text-yellow-100 font-medium uppercase tracking-widest text-xs">Current Balance</p>
                   <h2 className="text-6xl font-black mt-2 flex items-center gap-4">
                     {user.coins === Infinity ? '∞' : user.coins.toLocaleString()}
                     <Coins size={48} className="text-yellow-200/50" />
                   </h2>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold border border-white/10">
                  {user.role} ACCOUNT
                </div>
              </div>
              <div className="flex gap-4">
                 <button className="flex-1 py-3 bg-white text-orange-600 font-bold rounded-2xl hover:scale-105 transition-all shadow-lg">
                   Claim Daily +1
                 </button>
                 <button className="flex-1 py-3 bg-black/20 text-white font-bold rounded-2xl hover:bg-black/30 transition-all border border-white/10">
                   View Rewards
                 </button>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white opacity-[0.03] rounded-full blur-[100px]" />
          </div>

          {/* Transfer Section */}
          <div className="bg-[#151921] border border-white/5 rounded-3xl p-8">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-600/10 text-blue-500 rounded-xl flex items-center justify-center">
                   <Send size={24} />
                </div>
                <h3 className="text-xl font-bold">Transfer Coins</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <label className="block">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Recipient Username</span>
                  <input 
                    type="text" 
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    placeholder="e.g. johndoe"
                    className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" 
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Amount</span>
                  <input 
                    type="number" 
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0"
                    className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all" 
                  />
                </label>
             </div>

             <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl mb-8 border border-white/5">
                <AlertCircle className="text-gray-500 mt-1 shrink-0" size={20} />
                <p className="text-sm text-gray-500 leading-relaxed">
                  Transfers are instant and irreversible. Ensure you have the correct recipient username. Minimum transfer is 1 coin.
                </p>
             </div>

             <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:grayscale" disabled={!transferTarget || !transferAmount}>
                Execute Transfer
             </button>
          </div>
        </div>

        {/* History */}
        <div className="bg-[#151921] border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
             <History size={20} className="text-gray-400" />
             <h3 className="font-bold">Transaction Log</h3>
          </div>
          <div className="divide-y divide-white/5 max-h-[700px] overflow-y-auto">
             {[
               { id: '1', userId: '1', amount: 1, type: 'DAILY' as const, description: 'Daily reward claimed', timestamp: '' },
               { id: '2', userId: '1', amount: -10, type: 'DEPLOY' as const, description: 'Deployed "MusicBot Pro"', timestamp: '' },
               { id: '3', userId: '1', amount: 5, type: 'REFERRAL' as const, description: 'Referral bonus: @dev_mike', timestamp: '' },
               { id: '4', userId: '1', amount: -2, type: 'TRANSFER' as const, description: 'Sent to @admin_test', timestamp: '' },
               { id: '5', userId: '1', amount: 1, type: 'DAILY' as const, description: 'Daily reward claimed', timestamp: '' },
               { id: '6', userId: '1', amount: 1, type: 'DAILY' as const, description: 'Daily reward claimed', timestamp: '' },
             ].map(tx => (
               <TransactionItem key={tx.id} tx={tx} />
             ))}
          </div>
          <div className="p-4 bg-white/5 text-center">
             <button className="text-sm text-gray-500 hover:text-white transition-colors">Show full history</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinStore;
