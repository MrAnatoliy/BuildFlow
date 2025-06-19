// TaskExecutorForm.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { observer } from 'mobx-react-lite';
import { projectStore } from '../../../stores/ProjectStore';

const ROLES = [
  { value: 'supervisor', label: 'Технадзор' },
  { value: 'foreman',     label: 'Прораб' },
  { value: 'builder',     label: 'Строитель' },
  { value: 'engineer',    label: 'Инженер' },
];

const TaskExecutorForm = observer(({ taskId, existingExecutor, onSave, onCancel }) => {
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [users, setUsers]               = useState([]);

  useEffect(() => {
    projectStore.fetchAllUsers().then(() => {
      setUsers(Object.values(projectStore.users));
    });
  }, []);

  useEffect(() => {
    if (existingExecutor?.id) {
      const user = projectStore.users[existingExecutor.user_id];
      setSelectedUser(user);
      setSelectedRole(ROLES.find(r => r.value === existingExecutor.role) || ROLES[0]);
    }
  }, [existingExecutor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    onSave({ user_id: selectedUser.id, role: selectedRole.value });
  };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold">
        {existingExecutor?.id ? 'Редактировать исполнителя' : 'Новый исполнитель'}
      </h3>

      <div>
        <label className="block mb-2">Поиск сотрудника</label>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Введите имя, фамилию или email"
          className="w-full p-2 border rounded mb-2"
        />
        <div className="max-h-40 overflow-y-auto border rounded">
          {filtered.map(u => (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`p-2 cursor-pointer hover:bg-gray-50 ${selectedUser?.id === u.id ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {u.lastName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p>{u.firstName} {u.lastName}</p>
                  <p className="text-sm text-gray-600">{u.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-2">Роль в задаче</label>
        <Select
          options={ROLES}
          value={selectedRole}
          onChange={setSelectedRole}
          className="basic-select"
          classNamePrefix="select"
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">
          Отмена
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={!selectedUser}>
          {existingExecutor?.id ? 'Обновить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
});

export default TaskExecutorForm;
