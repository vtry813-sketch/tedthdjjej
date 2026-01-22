
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Play, 
  Square, 
  RotateCcw, 
  Trash2, 
  Github, 
  FileArchive,
  Terminal,
  Clock,
  Cpu,
  Database,
  Coins,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Upload,
  FileText
} from 'lucide-react';
import { User, BotStatus, Bot, LogType } from '../types.ts';

const MOCK_BOTS: Bot[] = [
  {
    id: '1',
    name: 'MusicBot v2',
    ownerId: '1',
    repoUrl: 'https://github.com/user/music-bot',
    status: BotStatus.RUNNING,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    cpuLimit: 0.5,
    memoryLimit: 512,
    logs: [],
    createdAt: new Date().toISOString()
  }
];

const BotCard = ({ bot, onOpenTerminal, onStop, onStart, onRestart, isRestarting }: { 
  bot: Bot, 
  onOpenTerminal: (bot: Bot) => void,
  onStop: (id: string) => void,
  onStart: (id: string) => void,
  onRestart: (id: string) => void,
  isRestarting: boolean
}) => {
  const isRunning = bot.status === BotStatus.RUNNING;
  const isExpired = bot.status === BotStatus.EXPIRED;

  return (
    <div className={`bg-[#151921] border rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-black/20 ${
      isExpired ? 'border-yellow-500/30' : 'border-white/5'
    }`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${
            isRunning ? 'bg-green-500' : isExpired ? 'bg-yellow-500' : 'bg-gray-600'
          }`}>
            {bot.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-lg">{bot.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${
                isRunning ? 'bg-green-500/10 text-green-500' : 
                isExpired ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-400'
              }`}>
                {bot.status}
              </span>
              <span className="text-gray-500 text-xs flex items-center gap-1">
                <Clock size={12} />
                {isExpired ? 'Expired' : '4d 12h left'}
              </span>
            </div>
          </div>
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
          <Cpu size={16} className="text-blue-400" />
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold">CPU Limit</p>
            <p className="text-sm font-semibold">{bot.cpuLimit} vCPU</p>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
          <Database size={16} className="text-purple-400" />
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold">Memory</p>
            <p className="text-sm font-semibold">{bot.memoryLimit} MB</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-white/5">
        <button 
          onClick={() => isRunning ? onStop(bot.id) : onStart(bot.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${
          isRunning ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
        }`}>
          {isRunning ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button 
          onClick={() => onRestart(bot.id)}
          disabled={isRestarting}
          className="flex items-center justify-center w-10 h-10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-50"
        >
          <RotateCcw size={18} className={isRestarting ? 'animate-spin' : ''} />
        </button>
        <button 
          onClick={() => onOpenTerminal(bot)}
          className="flex items-center justify-center w-10 h-10 bg-white/5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/5 rounded-xl transition-all"
        >
          <Terminal size={18} />
        </button>
        <button className="flex items-center justify-center w-10 h-10 bg-white/5 text-gray-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

const Bots: React.FC<{ user: User }> = ({ user }) => {
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [activeBot, setActiveBot] = useState<Bot | null>(null);
  
  const [deployStep, setDeployStep] = useState<'form' | 'terminal' | 'success'>('form');
  const [deployType, setDeployType] = useState<'git' | 'zip'>('git');
  const [terminalLogs, setTerminalLogs] = useState<{message: string, type: LogType, timestamp?: string}[]>([]);
  const [bots, setBots] = useState<Bot[]>(MOCK_BOTS);
  const [restartingBots, setRestartingBots] = useState<Set<string>>(new Set());
  const [newBotName, setNewBotName] = useState('');
  const [newBotRepo, setNewBotRepo] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // WebSocket Subscription
  useEffect(() => {
    if ((showTerminalModal || deployStep === 'terminal') && activeBot) {
      const socket = new WebSocket(`ws://${window.location.hostname}:5000`);
      socketRef.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'subscribe', botId: activeBot.id }));
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'init') {
          setTerminalLogs(message.data);
        } else if (message.type === 'log') {
          setTerminalLogs(prev => [...prev, message.data]);
          if (deployStep === 'terminal' && message.data.message.includes('Bot is online')) {
              setTimeout(() => setDeployStep('success'), 2000);
          }
        }
      };

      return () => socket.close();
    }
  }, [showTerminalModal, deployStep, activeBot]);

  const validateFile = (file: File) => {
    if (!file.name.endsWith('.zip')) {
      setError('Please upload a valid ZIP file.');
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds the 50MB limit.');
      return false;
    }
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setZipFile(file);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setZipFile(file);
      setError(null);
    }
  };

  const handleStopBot = async (botId: string) => {
      try {
          const res = await fetch('/api/stop', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ botId })
          });
          if (res.ok) {
              setBots(prev => prev.map(b => b.id === botId ? { ...b, status: BotStatus.STOPPED } : b));
          }
      } catch (err) {
          console.error('Failed to stop bot:', err);
      }
  };

  const handleStartBot = async (botId: string) => {
      const bot = bots.find(b => b.id === botId);
      if (!bot) return;
      
      try {
          const res = await fetch('/api/restart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ botId: bot.id })
          });
          if (res.ok) {
              setBots(prev => prev.map(b => b.id === botId ? { ...b, status: BotStatus.RUNNING } : b));
          }
      } catch (err) {
          console.error('Failed to start bot:', err);
      }
  };

  const handleRestartBot = async (botId: string) => {
      setRestartingBots(prev => new Set(prev).add(botId));
      try {
          const res = await fetch('/api/restart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ botId })
          });
          if (res.ok) {
              setBots(prev => prev.map(b => b.id === botId ? { ...b, status: BotStatus.RUNNING } : b));
          }
      } catch (err) {
          console.error('Failed to restart bot:', err);
      } finally {
          setRestartingBots(prev => {
              const next = new Set(prev);
              next.delete(botId);
              return next;
          });
      }
  };

  const handleDeploy = async () => {
    setError(null);
    if (deployType === 'git' && !newBotRepo) return;
    if (deployType === 'zip' && !zipFile) return;

    const botId = Math.random().toString(36).substr(2, 9);
    const newBot: Bot = {
      id: botId,
      name: newBotName || (deployType === 'zip' ? zipFile?.name.replace('.zip', '') : 'New Bot'),
      ownerId: user.id,
      repoUrl: deployType === 'git' ? newBotRepo : undefined,
      status: BotStatus.RUNNING,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      cpuLimit: 0.5,
      memoryLimit: 512,
      logs: [],
      createdAt: new Date().toISOString()
    };

    setActiveBot(newBot);
    setDeployStep('terminal');
    setTerminalLogs([{ message: `Preparing ${deployType.toUpperCase()} environment...`, type: LogType.SYSTEM }]);

    try {
        let response;
        if (deployType === 'git') {
            response = await fetch('/api/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId, repoUrl: newBotRepo })
            });
        } else {
            const formData = new FormData();
            formData.append('botId', botId);
            formData.append('package', zipFile!);
            
            response = await fetch('/api/deploy-zip', {
                method: 'POST',
                body: formData
            });
        }

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Failed to start deployment');
        }

        setBots(prev => [newBot, ...prev]);
    } catch (err: any) {
        setError(err.message);
        setDeployStep('form');
    }
  };

  const closeModal = () => {
    setShowDeployModal(false);
    setShowTerminalModal(false);
    setDeployStep('form');
    setNewBotName('');
    setNewBotRepo('');
    setZipFile(null);
    setActiveBot(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Deployments</h1>
          <p className="text-gray-500 mt-1">Manage and monitor your Node.js applications.</p>
        </div>
        <button 
          onClick={() => setShowDeployModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          Create New Bot
        </button>
      </header>

      {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 text-red-500">
              <AlertCircle size={20} />
              <p className="font-medium text-sm">{error}</p>
          </div>
      )}

      <div className="flex items-center gap-4 bg-[#151921] border border-white/5 p-4 rounded-2xl">
        <Search className="text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Search bots..." 
          className="bg-transparent border-none focus:ring-0 text-gray-100 flex-1 placeholder:text-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bots.map(bot => (
          <BotCard 
            key={bot.id} 
            bot={bot} 
            onOpenTerminal={(b) => { setActiveBot(b); setShowTerminalModal(true); }}
            onStop={handleStopBot}
            onStart={handleStartBot}
            onRestart={handleRestartBot}
            isRestarting={restartingBots.has(bot.id)}
          />
        ))}
      </div>

      {/* Deployment Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={closeModal} />
           <div className="relative bg-[#151921] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
              {deployStep === 'form' && (
                <>
                  <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Launch Deployment</h2>
                    <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-full"><X size={24} /></button>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => setDeployType('git')}
                         className={`flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left ${
                           deployType === 'git' ? 'border-blue-600 bg-blue-600/5' : 'border-white/5 bg-white/5 hover:border-white/10'
                         }`}
                       >
                          <Github size={32} className={deployType === 'git' ? 'text-blue-500' : 'text-gray-500'} />
                          <div>
                            <span className="font-bold block text-sm">Git Repo</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Remote Clone</span>
                          </div>
                       </button>
                       <button 
                         onClick={() => setDeployType('zip')}
                         className={`flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left ${
                           deployType === 'zip' ? 'border-orange-600 bg-orange-600/5' : 'border-white/5 bg-white/5 hover:border-white/10'
                         }`}
                       >
                          <FileArchive size={32} className={deployType === 'zip' ? 'text-orange-500' : 'text-gray-500'} />
                          <div>
                            <span className="font-bold block text-sm">ZIP File</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Manual Upload</span>
                          </div>
                       </button>
                    </div>

                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Display Name</span>
                        <input 
                          type="text" 
                          value={newBotName}
                          onChange={(e) => setNewBotName(e.target.value)}
                          placeholder="My Discord Bot"
                          className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all" 
                        />
                      </label>

                      {deployType === 'git' ? (
                        <label className="block animate-in slide-in-from-top-2 duration-300">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Repository URL</span>
                          <div className="mt-2 relative">
                             <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                             <input 
                               type="text" 
                               value={newBotRepo}
                               onChange={(e) => setNewBotRepo(e.target.value)}
                               placeholder="https://github.com/username/repo"
                               className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-blue-500 outline-none transition-all" 
                             />
                          </div>
                        </label>
                      ) : (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Package (.zip)</span>
                          {!zipFile ? (
                            <div 
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              onClick={() => fileInputRef.current?.click()}
                              className={`mt-2 border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all ${
                                isDragging 
                                  ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' 
                                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                              }`}
                            >
                               <input 
                                 type="file" 
                                 ref={fileInputRef} 
                                 onChange={handleFileSelect}
                                 className="hidden" 
                                 accept=".zip"
                               />
                               <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
                                  <Upload size={28} />
                               </div>
                               <div className="text-center">
                                  <p className="text-sm font-bold">Drop your ZIP here</p>
                                  <p className="text-xs text-gray-500 mt-1">or click to browse from files</p>
                               </div>
                            </div>
                          ) : (
                            <div className="mt-2 flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl group">
                               <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                                     <FileText size={20} />
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold truncate max-w-[200px]">{zipFile.name}</p>
                                     <p className="text-[10px] text-gray-500">{(zipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                  </div>
                               </div>
                               <button 
                                 onClick={() => setZipFile(null)}
                                 className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                               >
                                  <Trash2 size={18} />
                               </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-4 text-xs">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                         <Coins size={16} />
                      </div>
                      <p className="text-blue-400">Launch cost: 10 coins. Bot will expire automatically after 5 days of runtime.</p>
                    </div>
                  </div>
                  <div className="p-8 pt-0 flex gap-4">
                     <button onClick={closeModal} className="flex-1 py-4 font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
                     <button 
                       onClick={handleDeploy} 
                       disabled={deployType === 'git' ? !newBotRepo : !zipFile} 
                       className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:grayscale transition-all hover:bg-blue-500 active:scale-95"
                     >
                        Deploy to Production
                     </button>
                  </div>
                </>
              )}

              {deployStep === 'terminal' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold flex items-center gap-3 mb-6"><Loader2 className="text-blue-500 animate-spin" /> Starting Build Process...</h2>
                  <div ref={terminalRef} className="bg-black/80 rounded-2xl p-6 h-80 overflow-y-auto font-mono text-sm border border-white/10 shadow-inner">
                    {terminalLogs.map((log, i) => (
                      <div key={i} className={`mb-1 ${
                        log.type === LogType.ERROR ? 'text-red-400' : 
                        log.type === LogType.SUCCESS ? 'text-green-400' : 'text-blue-400'
                      }`}>
                        <span className="opacity-40 mr-3 text-xs">[{new Date(log.timestamp || Date.now()).toLocaleTimeString()}]</span>
                        <span className="opacity-80 font-bold mr-2">{log.type}:</span>
                        {log.message}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-center text-gray-600 mt-6">Provisioning container resources and installing Node.js runtime...</p>
                </div>
              )}

              {deployStep === 'success' && (
                <div className="p-16 text-center space-y-8 animate-in zoom-in-95 duration-300">
                   <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/20 shadow-xl shadow-green-500/10">
                      <CheckCircle2 size={56} />
                   </div>
                   <div className="space-y-2">
                      <h2 className="text-3xl font-black">Bot Online!</h2>
                      <p className="text-gray-500 max-w-xs mx-auto">Successfully deployed {newBotName}. You can now monitor live logs from the terminal.</p>
                   </div>
                   <button onClick={closeModal} className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all shadow-xl shadow-white/5">Go to Dashboard</button>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Terminal Modal */}
      {showTerminalModal && activeBot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={closeModal} />
           <div className="relative bg-[#151921] border border-white/10 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1a202a]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                    <Terminal size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{activeBot.name} Console</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Environment: Production</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 bg-[#0c0e12]">
                 <div ref={terminalRef} className="bg-black/50 rounded-xl p-8 h-[550px] overflow-y-auto font-mono text-sm border border-white/5 shadow-inner">
                    {terminalLogs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-4">
                         <Loader2 className="animate-spin" size={32} />
                         <p>Attaching to process container...</p>
                      </div>
                    ) : terminalLogs.map((log, i) => (
                        <div key={i} className="mb-1 flex gap-4 border-l-2 border-transparent hover:border-white/10 transition-colors px-2">
                            <span className="text-gray-800 shrink-0 select-none">[{new Date(log.timestamp || Date.now()).toLocaleTimeString()}]</span>
                            <span className={`break-all ${
                              log.type === LogType.SUCCESS ? 'text-green-400' : 
                              log.type === LogType.ERROR ? 'text-red-400' : 'text-blue-400'
                            }`}>
                                {log.message}
                            </span>
                        </div>
                    ))}
                 </div>
              </div>
              <div className="p-5 bg-[#1a202a] flex justify-between items-center px-8 border-t border-white/5">
                 <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Connected</span>
                    </div>
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                       PID: {activeBot.id.slice(0, 4).toUpperCase()}
                    </div>
                 </div>
                 <button onClick={() => handleStopBot(activeBot.id)} className="bg-red-500/10 text-red-500 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500 transition-all hover:text-white">Kill Instance</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Bots;
