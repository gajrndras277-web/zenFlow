
import React from 'react';
import { AppState } from '../types';
import { Wallet, CheckCircle2, FileText, Sparkles, TrendingUp, Calendar, Download, Upload, ShieldCheck, MonitorSmartphone, Share2, Info } from 'lucide-react';
import { getFinancialAdvice } from '../services/geminiService';

interface DashboardProps {
  state: AppState;
  onNavigate: (view: any) => void;
  onImportState: (state: AppState) => void;
  deferredPrompt: any;
  onInstall: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate, onImportState, deferredPrompt, onInstall }) => {
  const [advice, setAdvice] = React.useState<string>('Analyzing your data...');
  const [loadingAdvice, setLoadingAdvice] = React.useState(true);
  const [showInstallHelp, setShowInstallHelp] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

  React.useEffect(() => {
    const loadAdvice = async () => {
      if (state.transactions.length > 0) {
        const result = await getFinancialAdvice(state.transactions);
        setAdvice(result || '');
      } else {
        setAdvice("Add some transactions to get personalized financial insights!");
      }
      setLoadingAdvice(false);
    };
    loadAdvice();
  }, [state.transactions.length]);

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `zenflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.transactions && json.tasks && json.notes) {
          onImportState(json);
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Error reading file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const totalBalance = state.transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  const pendingTasks = state.tasks.filter(t => !t.completed).length;
  const recentNotes = state.notes.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Good day, Traveler</h2>
          <p className="text-slate-500 mt-1">Here's what's happening across your ZenFlow world.</p>
        </div>
        <div className="flex items-center gap-2 text-slate-500 font-medium bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Calendar size={18} />
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={() => onNavigate('finances')} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Wallet size={24} />
            </div>
            <span className="text-slate-500 font-semibold">Net Balance</span>
          </div>
          <p className="text-4xl font-extrabold text-slate-900">${totalBalance.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-bold">
            <TrendingUp size={16} />
            <span>Updated live</span>
          </div>
        </button>

        <button onClick={() => onNavigate('tasks')} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-slate-500 font-semibold">Pending Tasks</span>
          </div>
          <p className="text-4xl font-extrabold text-slate-900">{pendingTasks}</p>
          <p className="mt-4 text-slate-400 text-sm font-medium">Out of {state.tasks.length} total tasks</p>
        </button>

        <button onClick={() => onNavigate('notes')} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileText size={24} />
            </div>
            <span className="text-slate-500 font-semibold">Total Notes</span>
          </div>
          <p className="text-4xl font-extrabold text-slate-900">{recentNotes}</p>
          <p className="mt-4 text-slate-400 text-sm font-medium">Quick thoughts captured</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Insight Section */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles size={120} />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-indigo-300" />
            <h3 className="text-xl font-bold">AI Financial Insights</h3>
          </div>
          {loadingAdvice ? (
             <div className="space-y-4">
                <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse"></div>
             </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-indigo-100 text-lg leading-relaxed whitespace-pre-wrap">{advice}</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Installation Section */}
          {!isStandalone && (
            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden relative">
              <div className="absolute -bottom-4 -right-4 opacity-10">
                <MonitorSmartphone size={100} />
              </div>
              <div className="flex items-center gap-4 relative">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <MonitorSmartphone size={24} />
                </div>
                <div>
                  <h4 className="font-bold">Install ZenFlow</h4>
                  <p className="text-sm text-indigo-100">Use it like a real app on your device</p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto relative">
                {deferredPrompt ? (
                  <button onClick={onInstall} className="flex-1 md:flex-none px-6 py-2 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                    Install Now
                  </button>
                ) : (
                  <button onClick={() => setShowInstallHelp(!showInstallHelp)} className="flex-1 md:flex-none px-6 py-2 bg-indigo-500 text-white font-bold rounded-xl border border-indigo-400 hover:bg-indigo-400 transition-colors">
                    How to Install
                  </button>
                )}
              </div>
            </div>
          )}

          {/* iOS / Manual Install Help */}
          {showInstallHelp && !isStandalone && (
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <Info className="text-amber-500 shrink-0 mt-1" size={20} />
                <div className="text-sm text-amber-900 space-y-3">
                  <p className="font-bold">Installation Instructions:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/50 p-3 rounded-xl">
                      <p className="font-semibold mb-1">On iOS (iPhone/iPad):</p>
                      <p>1. Tap the <Share2 className="inline-block" size={14} /> Share button in Safari.</p>
                      <p>2. Scroll down and tap "Add to Home Screen".</p>
                    </div>
                    <div className="bg-white/50 p-3 rounded-xl">
                      <p className="font-semibold mb-1">On Android/Desktop:</p>
                      <p>Look for the "Install" icon in the address bar or tap the three dots <span className="font-bold">:</span> in Chrome and select "Install app".</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Priorities Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Upcoming Priorities</h3>
              <button onClick={() => onNavigate('tasks')} className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[160px]">
              {state.tasks.filter(t => !t.completed).length === 0 ? (
                 <div className="p-8 text-center text-slate-400">
                    <p>All caught up!</p>
                 </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {state.tasks.filter(t => !t.completed).slice(0, 5).map(task => (
                    <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <span className="font-medium text-slate-700 truncate mr-4">{task.title}</span>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0 ${
                        task.priority === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'
                      }`}>{task.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Backup Section */}
          <div className="bg-slate-100 rounded-3xl p-6 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl text-slate-600 shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Data Management</h4>
                <p className="text-sm text-slate-500">Backup or restore your local data</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={handleExport} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                <Download size={18} /> Export
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                <Upload size={18} /> Restore
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
