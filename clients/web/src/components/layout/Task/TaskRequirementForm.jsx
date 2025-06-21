import React, { useState, useEffect } from "react";
import { useAuth } from "../../../provider/AuthProvider";

const RequirementForm = ({ existingReq, taskId, onCreate, onUpdate, onCancel }) => {
  const { isManager } = useAuth();
  const [form, setForm] = useState({ name: "", description: "", is_completed: false });

  useEffect(() => {
    if (existingReq?.id) {
      setForm({
        name: existingReq.name,
        description: existingReq.description,
        is_completed: existingReq.is_completed,
      });
    } else {
      setForm({ name: "", description: "", is_completed: false });
    }
  }, [existingReq]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      completed_at: form.is_completed ? new Date().toISOString() : null,
    };
    if (existingReq?.id) {
      onUpdate(existingReq.id, payload);
    } else {
      onCreate(taskId, payload);
    }
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-100">
      <h3 className="text-2xl font-semibold">
        {existingReq?.id ? "Edit Requirement" : "New Requirement"}
      </h3>

      {isManager && (
        <>
          <div>
            <label className="block mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-2 bg-gray-600 text-slate-200 rounded-lg outline-none"
            />
          </div>
          <div>
            <label className="block mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 bg-gray-600 text-slate-200 rounded-lg outline-none"
            />
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="is_completed"
          checked={form.is_completed}
          onChange={handleChange}
          className="w-4 h-4 text-sky-500 bg-gray-600 border-slate-600 rounded"
        />
        <label className="text-slate-200">Completed</label>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-600 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
        >
          {existingReq?.id ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default RequirementForm;