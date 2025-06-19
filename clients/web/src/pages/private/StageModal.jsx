import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const today = new Date().toISOString().slice(0, 10);

const StageModal = ({ isOpen, onClose, onSave, initialStage = {} }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    budget: 0,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: initialStage.name || '',
        description: initialStage.description || '',
        budget: initialStage.budget || 0,
        start_date: initialStage.start_date || today,
        end_date: initialStage.end_date || today,
      });
    }
  }, [isOpen, initialStage]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'budget') {
      if (value === '') {
        setForm((prev) => ({ ...prev, [name]: '' }));
        return;
      }
      if (/^\d+$/.test(value)) {
        const noLeadingZeros = value.replace(/^0+/, '');
        setForm((prev) => ({
          ...prev,
          [name]: noLeadingZeros === '' ? '0' : noLeadingZeros,
        }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      alert('Название этапа обязательно');
      return;
    }
    if (form.end_date < form.start_date) {
      alert('Дата окончания не может быть раньше даты начала');
      return;
    }

    const budgetNum = Number(form.budget);
    if (isNaN(budgetNum)) {
      alert('Бюджет должен быть числом');
      return;
    }

    onSave?.({
      name: form.name.trim(),
      description: form.description.trim(),
      budget: budgetNum,
      start_date: form.start_date,
      end_date: form.end_date,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      contentLabel="Создать или редактировать этап"
      className="mt-50 bg-base-content border  border-base-300 text-base-1 p-8 rounded-2xl shadow-2xl outline-none"
      overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-start z-50"
    >
      <h2 className="text-center text-4xl font-bold mb-6">{initialStage.name ? 'Редактировать этап' : 'Создать этап'}</h2>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col">
          <span className="text-3xl mb-1 ml-1">Название этапа:</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input input-bordered border-base-300 bg-base-content text-base-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Введите название"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-3xl mb-1 ml-1">Описание этапа:</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="textarea textarea-bordered border-base-300 bg-base-content text-base-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Описание"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-3xl mb-1 ml-1">Бюджет:</span>
          <input
            type="number"
            name="budget"
            value={form.budget}
            onChange={handleChange}
            min={0}
            step={1000000}
            className="input input-bordered border-base-300 bg-base-content text-base-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0"
          />
        </label>

        <div className="flex flex-col gap-4">
          <label className="flex flex-row flex-1 gap-3">
            <span className="flex flex-1 justify-start items-center text-2xl mb-1">Дата начала:</span>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              min={today}
              onChange={handleChange}
              className="input input-bordered border-base-300 bg-base-content text-base-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>

          <label className="flex flex-row flex-1 gap-3">
            <span className="flex flex-1 justify-start items-center text-2xl mb-1">Дата окончания:</span>
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              min={form.start_date || today}
              onChange={handleChange}
              className="input input-bordered border-base-300 bg-base-content text-base-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-accent hover:bg-red-600 text-white rounded-xl transition"
        >
          Отмена
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-primary hover:bg-primary/80 text-white rounded-xl transition"
        >
          Сохранить
        </button>
      </div>
    </Modal>
  );
};

export default StageModal;
