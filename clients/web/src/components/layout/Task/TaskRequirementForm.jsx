// RequirementForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../provider/AuthProvider';

const RequirementForm = ({ existingReq, taskId, onCreate, onUpdate, onCancel }) => {
  const { isManager } = useAuth();

  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    is_completed: false 
  });

  useEffect(() => {
    if (existingReq?.id) {
      setForm({
        name: existingReq.name,
        description: existingReq.description,
        is_completed: existingReq.is_completed,
      });
    } else {
      setForm({ name: '', description: '', is_completed: false });
    }
  }, [existingReq]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      completed_at: form.is_completed ? new Date().toISOString() : null,
    };
    if (existingReq?.id) onUpdate(existingReq.id, payload);
    else onCreate(taskId, payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold">
        {existingReq?.id ? 'Изменить требование' : 'Создать требование'}
      </h3>

    {isManager 
      ? <>
          <div>
            <label>Название</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label>Описание</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded"
            />
          </div>
        </>
      : null
    }

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="is_completed"
          checked={form.is_completed}
          onChange={handleChange}
          className="w-4 h-4"
        />
        <label>Выполнено</label>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">
          Отмена
        </button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
          {existingReq?.id ? 'Обновить' : 'Создать'}
        </button>
      </div>
    </form>
  );
};

export default RequirementForm;
