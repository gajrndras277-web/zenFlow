
import React from 'react';
import { AppState, Category } from '../types';
import { Wallet, CheckCircle2, FileText, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { getFinancialAdvice } from '../services/geminiService';

interface DashboardProps {
  state: AppState;
  onNavigate: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate }) => {
  const [advice, setAdvice] = React.useState<string>('Analyzing your data...');
  const [loadingAdvice, setLoadingAdvice] = React.useState(true);

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

  const totalBalance = state.transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  const pendingTasks = state.tasks.filter(t => !t.completed).length;
  const recentNotes = state.notes.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Good day, Traveler</h2>
          <p className="text-slate-500 mt-1">Here's what's happening across your ZenFlow world.</p>
        </div>
        <div className="flex items-center gap-2 text-slate-500 font-medium bg-white px-4 py-2 rounded-xl border border-slate-200">
          <Calendar size={18} />
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => onNavigate('finances')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
        >
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

        <button 
          onClick={() => onNavigate('tasks')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-slate-500 font-semibold">Pending Tasks</span>
          </div>
          <p className="text-4xl font-extrabold text-slate-900">{pendingTasks}</p>
          <p className="mt-4 text-slate-400 text-sm font-medium">Out of {state.tasks.length} total tasks</p>
        </button>

        <button 
          onClick={() => onNavigate('notes')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
        >
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

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-bold">Upcoming Priorities</h3>
            <button onClick={() => onNavigate('tasks')} className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {state.tasks.filter(t => !t.completed).length === 0 ? (
               <div className="p-12 text-center text-slate-400">
                  <p>All caught up!</p>
               </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {state.tasks.filter(t => !t.completed).slice(0, 5).map(task => (
                  <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <span className="font-medium text-slate-700">{task.title}</span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      task.priority === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'
                    }`}>{task.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
