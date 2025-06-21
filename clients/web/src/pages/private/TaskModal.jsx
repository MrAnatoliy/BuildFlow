import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { motion } from 'framer-motion';

const today = new Date().toISOString().slice(0, 10);

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
    if (!isOpen) return;

    if (initialTask?.id) {
      setForm({
        name: initialTask.name || '',
        description: initialTask.description || '',
        start_date: initialTask.start_date || today,
        end_date: initialTask.end_date || today,
        priority: initialTask.priority ?? 0,
      });
    } else {
      setForm({
        name: '',
        description: '',
        start_date: today,
        end_date: today,
        priority: 0,
      });
    }
  }, [isOpen, initialTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'priority' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!stageId || isNaN(stageId)) {
      alert('Ошибка: stageId не передан или некорректен');
      return;
    }

    if (new Date(form.end_date) < new Date(form.start_date)) {
      alert('Дата окончания не может быть раньше начала');
      return;
    }

    const taskData = {
      ...form,
      stage_id: Number(stageId),
      priority: Math.max(0, Math.min(2, form.priority))
    };

    onSave(taskData);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="w-full max-w-3xl bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 text-white outline-none"
      overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6">
            {initialTask?.id ? 'Редактировать задачу' : 'Новая задача'}
          </h2>

          <div>
            <label className="block mb-1">Название</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md outline-none"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Описание</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md outline-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Дата начала</label>
              <input
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={handleChange}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md outline-none"
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
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md outline-none"
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
                    className="mr-2"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded-md"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
            >
              Сохранить
            </button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default TaskModal;
