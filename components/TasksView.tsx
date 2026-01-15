
import React from 'react';
import { Task, Priority, Note } from '../types';
import { Plus, CheckCircle2, Circle, Clock, Sparkles, Trash2 } from 'lucide-react';
import { suggestTasksFromNotes } from '../services/geminiService';

interface TasksViewProps {
  tasks: Task[];
  notes: Note[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, notes, onAddTask, onToggleTask, onDeleteTask }) => {
  const [newTitle, setNewTitle] = React.useState('');
  const [priority, setPriority] = React.useState(Priority.MEDIUM);
  const [isSuggesting, setIsSuggesting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      title: newTitle,
      completed: false,
      priority,
      dueDate: new Date().toISOString()
    });
    setNewTitle('');
  };

  const handleAIAutoSuggest = async () => {
    setIsSuggesting(true);
    const suggestions = await suggestTasksFromNotes(notes);
    suggestions.forEach((s: any) => {
      onAddTask({
        title: s.title,
        completed: false,
        priority: s.priority as Priority,
        dueDate: new Date().toISOString()
      });
    });
    setIsSuggesting(false);
  };

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case Priority.HIGH: return 'text-rose-500 bg-rose-50';
      case Priority.MEDIUM: return 'text-amber-500 bg-amber-50';
      case Priority.LOW: return 'text-blue-500 bg-blue-50';
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-slate-500">Manage your daily priorities</p>
        </div>
        <button
          onClick={handleAIAutoSuggest}
          disabled={isSuggesting}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          <Sparkles size={18} />
          {isSuggesting ? 'Suggesting...' : 'AI Suggest Tasks'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <div className="flex gap-4">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              {Object.values(Priority).map(p => (
                <option key={p} value={p}>{p} Priority</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shrink-0"
            >
              <Plus size={20} /> Add
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {sortedTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
              <p>No tasks yet. Enjoy your free time!</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-400'}`}
                >
                  {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteTask(task.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksView;
