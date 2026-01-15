
import React from 'react';
import { AppState, Transaction, Task, Note, View } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FinanceView from './components/FinanceView';
import TasksView from './components/TasksView';
import NotesView from './components/NotesView';

const App: React.FC = () => {
  const [view, setView] = React.useState<View>('dashboard');
  const [state, setState] = React.useState<AppState>(() => {
    const saved = localStorage.getItem('zenflow_state');
    return saved ? JSON.parse(saved) : { transactions: [], tasks: [], notes: [] };
  });

  React.useEffect(() => {
    localStorage.setItem('zenflow_state', JSON.stringify(state));
  }, [state]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newT: Transaction = { ...t, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, transactions: [...prev.transactions, newT] }));
  };

  const addTask = (t: Omit<Task, 'id'>) => {
    const newT: Task = { ...t, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newT] }));
  };

  const toggleTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteTask = (id: string) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  };

  const addNote = (n: Omit<Note, 'id'>) => {
    const newN: Note = { ...n, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, notes: [...prev.notes, newN] }));
  };

  const deleteNote = (id: string) => {
    setState(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }));
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard state={state} onNavigate={setView} />;
      case 'finances':
        return <FinanceView transactions={state.transactions} onAddTransaction={addTransaction} />;
      case 'tasks':
        return <TasksView tasks={state.tasks} notes={state.notes} onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask} />;
      case 'notes':
        return <NotesView notes={state.notes} onAddNote={addNote} onDeleteNote={deleteNote} />;
      default:
        return <Dashboard state={state} onNavigate={setView} />;
    }
  };

  return (
    <Layout currentView={view} onViewChange={setView}>
      {renderView()}
    </Layout>
  );
};

export default App;
