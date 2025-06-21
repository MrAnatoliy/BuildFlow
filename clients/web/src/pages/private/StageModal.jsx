import React, { useState, useEffect } from "react";
import Modal from "react-modal";

const today = new Date().toISOString().split("T")[0];

const StageModal = ({ isOpen, onClose, onSave, initialStage = {} }) => {
  const [form, setForm] = useState({
    name: "", description: "", budget: 0,
    start_date: today, end_date: today
  });

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: initialStage.name || "",
        description: initialStage.description || "",
        budget: initialStage.budget || 0,
        start_date: initialStage.start_date || today,
        end_date: initialStage.end_date || today
      });
    }
  }, [isOpen, initialStage]);

  const change = e => {
    let { name, value } = e.target;
    if (name === "budget") {
      if (value === "" || /^\d+$/.test(value)) {
        value = value.replace(/^0+/, "") || "0";
        setForm(f => ({ ...f, [name]: value }));
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const save = () => {
    if (!form.name.trim()) return alert("Stage name is required");
    if (form.end_date < form.start_date) return alert("End date must be ≥ start date");
    const b = Number(form.budget);
    if (isNaN(b)) return alert("Budget must be a number");
    onSave({ ...form, budget: b });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="w-full max-w-3xl bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 mx-auto mt-20 text-white outline-none"
      overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-start z-50"
    >
      <h2 className="text-3xl font-bold text-center mb-4">
        {initialStage.name ? "Edit Stage" : "Create Stage"}
      </h2>
      <div className="space-y-4">
        <input
          name="name" value={form.name} onChange={change}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded-md outline-none"
          placeholder="Stage name"
        />
        <textarea
          name="description" value={form.description} onChange={change}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded-md outline-none"
          rows={3} placeholder="Description"
        />
        <input
          name="budget" type="number" value={form.budget} onChange={change}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded-md outline-none"
          placeholder="Budget"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="start_date" type="date" value={form.start_date} onChange={change}
            className="bg-gray-600 text-white px-4 py-2 rounded-md outline-none"
          />
          <input
            name="end_date" type="date" value={form.end_date} min={form.start_date} onChange={change}
            className="bg-gray-600 text-white px-4 py-2 rounded-md outline-none"
          />
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md">
          Cancel
        </button>
        <button onClick={save} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">
          Save
        </button>
      </div>
    </Modal>
  );
};

export default StageModal;
