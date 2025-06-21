import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../provider/AuthProvider';

const TaskEditForm = ({ task, onSave, onCancel }) => {
  const { isManager } = useAuth();

  const [form, setForm] = useState({
    name:        '',
    description: '',
    start_date:  '',
    end_date:    '',
    priority:    0,
  });

  useEffect(() => {
    setForm({
      name:        task.name,
      description: task.description,
      start_date:  task.start_date,
      end_date:    task.end_date,
      priority:    task.priority,
    });
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: name === 'priority' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-3xl font-bold mb-4 text-slate-100">
        {isManager ? 'Edit Task' : 'Task Details'}
      </h3>

      <div>
        <label className="block mb-1 text-slate-300">Title</label>
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          disabled={!isManager}
          required
          className={`w-full p-3 rounded-lg 
            ${isManager 
              ? 'bg-gray-600  text-slate-100 border border-slate-600' 
              : 'bg-gray-600  text-slate-400 border border-slate-700 cursor-not-allowed'}`}
        />
      </div>

      <div>
        <label className="block mb-1 text-slate-300">Description</label>
        <textarea 
          name="description" 
          value={form.description} 
          onChange={handleChange} 
          rows={4}
          disabled={!isManager}
          className={`w-full p-3 rounded-lg 
            ${isManager 
              ? 'bg-gray-600  text-slate-100 border border-slate-600' 
              : 'bg-gray-600  text-slate-400 border border-slate-700 cursor-not-allowed'}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-slate-300">Start Date</label>
          <input 
            name="start_date" 
            type="date" 
            value={form.start_date} 
            onChange={handleChange} 
            disabled={!isManager}
            required
            className={`w-full p-3 rounded-lg 
              ${isManager 
                ? 'bg-gray-600  text-slate-100 border border-slate-600' 
                : 'bg-gray-600  text-slate-400 border border-slate-700 cursor-not-allowed'}`}
          />
        </div>
        <div>
          <label className="block mb-1 text-slate-300">Deadline</label>
          <input 
            name="end_date" 
            type="date" 
            min={form.start_date} 
            value={form.end_date} 
            onChange={handleChange} 
            disabled={!isManager}
            required
            className={`w-full p-3 rounded-lg 
              ${isManager 
                ? 'bg-gray-600  text-slate-100 border border-slate-600' 
                : 'bg-gray-600  text-slate-400 border border-slate-700 cursor-not-allowed'}`}
          />
        </div>
      </div>

      <div>
        <label className="block mb-1 text-slate-300">Priority</label>
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          disabled={!isManager}
          className={`w-full p-3 rounded-lg 
            ${isManager 
              ? 'bg-gray-600  text-slate-100 border border-slate-600' 
              : 'bg-gray-600  text-slate-400 border border-slate-700 cursor-not-allowed'}`}
        >
          <option value={0}>Low</option>
          <option value={1}>Medium</option>
          <option value={2}>High</option>
        </select>
      </div>

      {isManager && (
        <div className="flex justify-end gap-2 mt-6">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 bg-slate-600 text-slate-200 rounded-full"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded-full"
          >
            Update
          </button>
        </div>
      )}
    </form>
  );
};

export default TaskEditForm;
