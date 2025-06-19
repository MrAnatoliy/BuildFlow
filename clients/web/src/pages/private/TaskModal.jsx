// src/components/layout/Task/TaskModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const today = new Date().toISOString().slice(0, 10);

// Опции приоритета
const PRIORITY_OPTIONS = [
  { value: 0, label: 'Низкий' },
  { value: 1, label: 'Средний' },
  { value: 2, label: 'Высокий' },
];

const TaskModal = ({ isOpen, onClose, onSave, initialTask = {}, stageId }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    start_date: today,
    end_date: today,
    priority: 0,
  });

  useEffect(() => {
    if (initialTask && initialTask.id) {
      // редактирование
      setForm({
        name:        initialTask.name,
        description: initialTask.description,
        start_date:  initialTask.start_date,
        end_date:    initialTask.end_date,
        priority:    initialTask.priority,
      });
    } else {
      // новая задача
      setForm({
        name:        '',
        description: '',
        start_date:  today,
        end_date:    today,
        priority:    0,
      });
    }
  }, [initialTask, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'priority' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Валидация дат
    if (new Date(form.end_date) < new Date(form.start_date)) {
      alert('Дата окончания не может быть раньше начала');
      return;
    }

    // Нормализация данных
    const taskData = {
      ...form,
      stage_id: Number(stageId),
      priority: Math.max(0, Math.min(2, form.priority))
    };

    onSave(taskData);
  };
  
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} ariaHideApp={false}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold">
          {initialTask.id ? 'Редактировать задачу' : 'Новая задача'}
        </h2>

        <div>
          <label className="block mb-1">Название</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Описание</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Дата начала</label>
            <input
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Дата окончания</label>
            <input
              name="end_date"
              type="date"
              value={form.end_date}
              min={form.start_date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div>
          <span className="block mb-1">Приоритет</span>
          <div className="flex gap-4">
            {PRIORITY_OPTIONS.map(opt => (
              <label key={opt.value} className="inline-flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value={opt.value}
                  checked={form.priority === opt.value}
                  onChange={handleChange}
                  className="mr-1"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Отмена
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            Сохранить
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
