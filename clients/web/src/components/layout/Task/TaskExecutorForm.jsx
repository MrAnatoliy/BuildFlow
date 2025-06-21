import React, { useState, useEffect } from "react";
import Select from "react-select";
import { observer } from "mobx-react-lite";
import { projectStore } from "../../../stores/ProjectStore";

const ROLES = [
  { value: "supervisor", label: "Supervisor" },
  { value: "foreman",    label: "Foreman" },
  { value: "builder",    label: "Builder" },
  { value: "engineer",   label: "Engineer" },
];

const TaskExecutorForm = observer(({ taskId, existingExecutor, onSave, onCancel }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);

  useEffect(() => {
    projectStore.fetchAllUsers().then(() => {
      setUsers(Object.values(projectStore.users));
    });
  }, []);

  useEffect(() => {
    if (existingExecutor?.id) {
      const u = projectStore.users[existingExecutor.user_id];
      setSelectedUser(u);
      setSelectedRole(ROLES.find(r => r.value === existingExecutor.role));
    }
  }, [existingExecutor]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!selectedUser) return;
    onSave({ user_id: selectedUser.id, role: selectedRole.value });
  };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-100">
      <h3 className="text-2xl font-semibold">
        {existingExecutor?.id ? "Edit Executor" : "New Executor"}
      </h3>

      <div>
        <label className="block mb-2">Search User</label>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Name, surname or email"
          className="w-full p-2 bg-gray-600  text-slate-200 rounded-lg outline-none"
        />
      </div>

      <div className="max-h-40 overflow-y-auto border border-slate-600 rounded-lg bg-gray-600 ">
        {filtered.map(u => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            className={`p-2 flex items-center gap-2 cursor-pointer hover:bg-gray-600  ${
              selectedUser?.id === u.id ? "bg-sky-800" : ""
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white">
              {u.lastName?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-white">{u.firstName} {u.lastName}</p>
              <p className="text-sm text-slate-400">{u.email}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block mb-2">Role</label>
        <Select
          options={ROLES}
          value={selectedRole}
          onChange={setSelectedRole}
          classNamePrefix="select"
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: "#4B5563",    // bg-gray-600
              color: "white",
              borderColor: base.isFocused ? "#2563eb" : base.borderColor,
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: "#4B5563",
              color: "white",
            }),
            singleValue: (base) => ({
              ...base,
              color: "white",
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused
                ? "#374151"
                : "#4B5563",
              color: "white",
              cursor: "pointer",
            }),
          }}
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-600 rounded-lg">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selectedUser}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg disabled:opacity-50"
        >
          {existingExecutor?.id ? "Update" : "Add"}
        </button>
      </div>
    </form>
  );
});

export default TaskExecutorForm;
