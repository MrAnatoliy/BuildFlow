// src/components/layout/Task/TaskEditForm.jsx
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
    <form onSubmit={handleSubmit} className="space-y-2">
      {isManager 
        ? <h3 className="text-5xl font-bold mb-7">Edit task</h3> 
        : <h3 className="text-5xl font-bold mb-7">Task</h3>
      }
      <div>
        <label>Title</label>
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          className="w-full p-2 border border-gray-300 rounded-[12px]"
          disabled={!isManager}
          required 
        />
      </div>
      <div>
        <label>Description</label>
        <textarea 
          name="description" 
          value={form.description} 
          onChange={handleChange} 
          className="w-full p-2 border border-gray-300 rounded-[12px]"
          disabled={!isManager}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Start date</label>
          <input 
            name="start_date" 
            type="date" 
            value={form.start_date} 
            onChange={handleChange} 
            className="w-full p-2 border border-gray-300 rounded-[12px]"
            disabled={!isManager}
            required
          />
        </div>
        <div>
          <label>Deadline</label>
          <input 
            name="end_date" 
            type="date" 
            min={form.start_date} 
            value={form.end_date} 
            onChange={handleChange} 
            className="w-full p-2 border border-gray-300 rounded-[12px]"
            disabled={!isManager}
            required
          />
        </div>
      </div>
      <div>
        <label>Priority</label>
        <select name="priority" value={form.priority} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-[12px]" disabled={!isManager}>
          <option value={0}>Low</option>
          <option value={1}>Medium</option>
          <option value={2}>High</option>
        </select>
      </div>
      {isManager 
        ? <>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-full">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-full">Update</button>
            </div>
          </>
        : null
      }
    </form>
  );
};

export default TaskEditForm;
