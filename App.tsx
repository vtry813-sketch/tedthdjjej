
import React, { useState, useEffect } from 'react';
// Changed imports to use BrowserRouter and ensured standard v6 named exports are used.
// If the environment has issues with specific exports like HashRouter, BrowserRouter is often more widely supported.
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Link, 
  useLocation 
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot as BotIcon, 
  Coins, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Settings, 
  Terminal,
  Activity,
  User as UserIcon,
  ChevronRight,
  PlusCircle,
  RefreshCw,
  Gift,
  Share2,
  Lock,
  History
} from 'lucide-react';

// Pages
import Dashboard from './pages/Dashboard.tsx';
import Bots from './pages/Bots.tsx';
import CoinStore from './pages/CoinStore.tsx';
import AdminPanel from './pages/AdminPanel.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';

// Types
import { User, UserRole } from './types.ts';

// Mock Auth State (In production this would use JWT and context)
const INITIAL_USER: User = {
  id: '1',
  email: 'inconnuboytech@gmail.com',
  username: 'AdminDev',
  role: UserRole.ADMIN,
  coins: Infinity,
  isVerified: true,
  isBanned: false,
  referralCode: 'ADMIN-PRO',
  createdAt: new Date().toISOString()
};

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
    active 
      ? 'bg-blue-600/10 text-blue-400 border-l-4 border-blue-500' 
      : 'text-gray-400 hover:text-white hover:bg-white/5'
  }`}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Navbar = ({ user, toggleSidebar }: { user: User, toggleSidebar: () => void }) => {
  return (
    <nav className="h-16 border-b border-white/5 bg-[#0f1117]/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">B</div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">Bot<span className="text-blue-500">Cloud</span></span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500">
          <Coins size={16} />
          <span className="font-bold text-sm">
            {user.coins === Infinity ? 'Unlimited' : user.coins.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold leading-none">{user.username}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{user.role}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-2 border-white/10 shadow-lg" />
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(INITIAL_USER);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={(u) => setUser(u)} />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#151921] border-r border-white/5 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">B</div>
               <span className="text-xl font-bold">BotCloud</span>
             </div>
             <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400">
               <X size={24} />
             </button>
          </div>

          <div className="space-y-1">
            <SidebarItem to="/" label="Overview" icon={LayoutDashboard} active={location.pathname === '/'} />
            <SidebarItem to="/bots" label="My Bots" icon={BotIcon} active={location.pathname === '/bots'} />
            <SidebarItem to="/coins" label="Coin System" icon={Coins} active={location.pathname === '/coins'} />
            <SidebarItem to="/referral" label="Referral" icon={Share2} active={location.pathname === '/referral'} />
            
            {user.role === UserRole.ADMIN && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Administration</p>
                <SidebarItem to="/admin" label="Control Panel" icon={ShieldCheck} active={location.pathname === '/admin'} />
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t border-white/5 space-y-4">
           <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors">
              <Settings size={20} />
              <span className="font-medium">Settings</span>
           </Link>
           <button onClick={() => setUser(null)} className="flex items-center gap-3 px-4 py-2 w-full text-red-400 hover:text-red-300 hover:bg-red-400/5 rounded-lg transition-all">
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar user={user} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/bots" element={<Bots user={user} />} />
            <Route path="/coins" element={<CoinStore user={user} />} />
            <Route path="/admin" element={user.role === UserRole.ADMIN ? <AdminPanel /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const WrappedApp = () => (
  <Router>
    <App />
  </Router>
);

export default WrappedApp;
