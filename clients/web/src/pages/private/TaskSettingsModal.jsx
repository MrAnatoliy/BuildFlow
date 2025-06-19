// TaskSettingsModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { observer } from 'mobx-react-lite';
import { projectStore } from '../../stores/ProjectStore';
import TaskEditForm       from '../../components/layout/Task/TaskEditForm';
import VolumeForm         from '../../components/layout/Task/TaskVolumeForm';
import RequirementForm    from '../../components/layout/Task/TaskRequirementForm';
import TaskExecutorForm   from '../../components/layout/Task/TaskExecutorForm';
import { useAuth } from '../../provider/AuthProvider';

const rolesMap = {
  supervisor: 'Технадзор',
  foreman:     'Прораб',
  builder:     'Строитель',
  engineer:    'Инженер',
};

export const TaskSettingsModal = observer(({
  isOpen, taskId, onClose,
  onVolumesChange      = () => {},
  onRequirementChange  = () => {},
  onExecutorChange     = () => {},
}) => {
  const { isManager } = useAuth()
  
  const [activeTab, setActiveTab]           = useState('task');
  const [editingVolume, setEditingVolume]   = useState(null);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [editingExecutor, setEditingExecutor]       = useState(null);

  const task         = projectStore.tasks[taskId];
  const volumes      = projectStore.getVolumesByTaskId(taskId);
  const requirements = projectStore.getRequirementsByTaskId(taskId);
  const executors    = projectStore.getExecutorsByTaskId(taskId);

  useEffect(() => {
    if (isOpen) {
      projectStore.fetchAllUsers();
      setActiveTab('task');
      setEditingVolume(null);
      setEditingRequirement(null);
      setEditingExecutor(null);
    }
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const saveTask = async (data) => {
    await projectStore.updateTask(taskId, data);
    onClose();
  };
  const deleteTask = async () => {
    if (!window.confirm('Удалить задачу?')) return;
    await projectStore.deleteTask(taskId);
    onClose(); onVolumesChange(); onRequirementChange(); onExecutorChange();
  };

  const createVol = async (tid, data) => {
    await projectStore.createVolume(tid, data);
    onVolumesChange(); setEditingVolume(null);
  };
  const updateVol = async (vid, data) => {
    await projectStore.updateVolume(taskId, vid, data);
    onVolumesChange(); setEditingVolume(null);
  };
  const deleteVol = async (vid) => {
    if (!window.confirm('Удалить объём?')) return;
    await projectStore.deleteVolume(vid);
    onVolumesChange();
  };

  const createReq = async (tid, data) => {
    await projectStore.createRequirement(tid, data);
    onRequirementChange(); setEditingRequirement(null);
  };
  const updateReq = async (rid, data) => {
    await projectStore.updateRequirement(rid, data);
    onRequirementChange(); setEditingRequirement(null);
  };
  const deleteReq = async (rid) => {
    if (!window.confirm('Удалить требование?')) return;
    await projectStore.deleteRequirement(rid);
    onRequirementChange();
  };

  const saveExecutor = async (data) => {
    if (editingExecutor?.id) {
      await projectStore.updateExecutor(taskId, editingExecutor.id, data.role);
    } else {
      await projectStore.createExecutor(taskId, data.user_id, data.role);
    }
    onExecutorChange(); setEditingExecutor(null);
  };
  const deleteExecutor = async (eid) => {
    if (!window.confirm('Удалить исполнителя?')) return;
    await projectStore.deleteExecutor(eid);
    onExecutorChange();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        content: { inset: '10% 20%', padding: '20px' },
        overlay: { backgroundColor: 'rgba(0,0,0,0.5)' },
      }}
    >
      <button onClick={onClose} className="float-right text-2xl bg-transparent border-none cursor-pointer">
        ×
      </button>
      <h2 className="text-xl mb-4">Настройки: {task.name}</h2>
      <div className="flex gap-5">
      <nav className="flex flex-col gap-2 w-40">
        {['task','volume','requirements','executors']
          .filter(tab => isManager || tab !== 'executors') // Фильтруем вкладки
          .map(tab => (
            <button
              key={tab}
              onClick={() => { 
                setActiveTab(tab); 
                setEditingVolume(null); 
                setEditingRequirement(null); 
                setEditingExecutor(null); 
              }}
              className={`text-left p-2 ${activeTab===tab?'font-bold bg-blue-100':''}`}
            >
              {isManager
                ? { task:'Task', volume:'Volumes', requirements:'Requirements', executors:'Executors' }[tab]
                : { task:'Edit Task', volume:'Volumes', requirements:'Requirements' }[tab]
              }
            </button>
          ))}
      </nav>

        <div className="flex-1">
        
          {activeTab==='task' && (
            <>
              <TaskEditForm task={task} onSave={saveTask} onCancel={onClose} />
              {isManager 
              ? <>
                  <button onClick={deleteTask} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">
                    Delete task
                  </button>
                </>
              : null}
            </>
          )}

          {activeTab==='volume' && (
            editingVolume ? (
              <VolumeForm existingVol={editingVolume} taskId={taskId} onCreate={createVol} onUpdate={updateVol} onCancel={() => setEditingVolume(null)} />
            ) : (
              <>
                {isManager
                  ? <>
                      <button onClick={() => setEditingVolume({})} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">
                        + Новый объём
                      </button>
                    </>
                  : null
                }
                <ul className="space-y-2">
                  {volumes.map(v => {
                    const done = v.whole_volume > 0 && v.current_volume >= v.whole_volume;

                    return (
                      <li
                        key={v.id}
                        className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => setEditingVolume(v)}
                      >
                        <span className={`${done ? 'text-green-600' : 'text-base-100'}`}> {v.name} ({v.current_volume}/{v.whole_volume} {v.metrics})</span>
                        { done && <span className="text-green-600"> (выполнено)</span>}
                        {isManager 
                          ? <>
                              <button onClick={e => { e.stopPropagation(); deleteVol(v.id); }} className="text-red-500">
                                Delete
                              </button>
                            </>
                          : null
                        }
                      </li>
                    );
                  })}
                </ul>
              </>
            )
          )}

          {activeTab==='requirements' && (
            editingRequirement ? (
              <RequirementForm existingReq={editingRequirement} taskId={taskId} onCreate={createReq} onUpdate={updateReq} onCancel={() => setEditingRequirement(null)} />
            ) : (
              <>
                {isManager
                  ? <>
                      <button onClick={() => setEditingRequirement({})} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">
                        + Новое требование
                      </button>
                    </>
                  : null
                }
                <ul className="space-y-2">
                  {requirements.map(r => (
                    <li key={r.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer" onClick={() => setEditingRequirement(r)}>
                      <span>{r.name} {r.is_completed && <span className="text-green-600">(выполнено)</span>}</span>
                      {isManager 
                        ? <>
                            <button onClick={e => { e.stopPropagation(); deleteReq(r.id); }} className="text-red-500">
                              Delete
                            </button>
                          </>
                        : null
                      }
                    </li>
                  ))}
                </ul>
              </>
            )
          )}
          
          {activeTab==='executors' && (
            editingExecutor ? (
              <TaskExecutorForm taskId={taskId} existingExecutor={editingExecutor} onSave={saveExecutor} onCancel={() => setEditingExecutor(null)} />
            ) : (
              <>
                <button onClick={() => setEditingExecutor({})} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">
                  + Новый исполнитель
                </button>
                <ul className="space-y-2">
                  {executors.map(e => {
                    const u = projectStore.users[e.user_id];
                    return (
                      <li key={e.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer" onClick={() => setEditingExecutor(e)}>
                        <span>{u?.firstName} {u?.lastName} — {rolesMap[e.role]}</span>
                        <button onClick={ev => { ev.stopPropagation(); deleteExecutor(e.id); }} className="text-red-500">Delete</button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )
          )}
        </div>
      </div>
    </Modal>
  );
});
