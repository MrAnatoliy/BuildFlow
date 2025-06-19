import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { motion, AnimatePresence } from 'framer-motion';
import { projectStore } from '../../../stores/ProjectStore';
import { useAuth } from '../../../provider/AuthProvider';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

const TaskList = observer(({ task, onEdit, onOpenSettings }) => {
  const { isInspector } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Получаем связанные данные
  const volumes = projectStore.getVolumesByTaskId(task.id);
  const requirements = projectStore.getRequirementsByTaskId(task.id);
  const executors = projectStore.getExecutorsByTaskId(task.id);

  // Проверяем, что все объёмы выполнены
  const allVolumesDone = volumes.length > 0 && volumes.every(v => v.current_volume >= v.whole_volume);
  // Проверяем, что все требования выполнены
  //const allRequirementsDone = requirements.length > 0 && requirements.every(r => r.is_completed);
  const allRequirementsDone = requirements.every(r => r.is_completed);

  // Флаг выполнения задачи
  const isCompleted = allVolumesDone && allRequirementsDone;

  // Пометим в самом объекте (если нужно хранить флаг в сторе или поднять состояние наверх — адаптируйте)
  task.completed = isCompleted;

  const priorityLabel = {
    0: 'Низкий',
    1: 'Средний',
    2: 'Высокий'
  }[task.priority];

  const toggleTask = () => setIsOpen(!isOpen);

  const handleRequirementToggle = async (requirementId) => {
    if (!isInspector) return;
    const req = projectStore.requirements[requirementId];
    await projectStore.updateRequirement(requirementId, {
      ...req,
      is_completed: !req.is_completed,
      completed_at: !req.is_completed ? new Date().toISOString() : null
    });
  };

  useEffect(() => {
    if (Object.keys(projectStore.users).length === 0) {
      projectStore.fetchAllUsers();
    }
}, []);

  return (
    <motion.div
      className={`rounded-lg shadow-md p-4 mb-4
        ${isCompleted ? 'bg-green-100 border border-green-400' : 'bg-white'}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            {task.name}
            {isCompleted && (
              <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded">Выполнено</span>
            )}
          </h3>
          <h3 className="text-sm font-medium">{task.description}</h3>
          <p className="text-gray-600 text-sm">{task.end_date}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {priorityLabel}
          </span>
          <button
            onClick={() => onOpenSettings(task.id)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full"
          >
            ⚙️
          </button>
          <button
            onClick={toggleTask}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4"
          >
            {/* Объёмы */}
            <div className="space-y-2">
              <h4 className="font-medium">Объемы работ:</h4>
              {volumes.map(vol => {
                const done = vol.current_volume >= vol.whole_volume;
                return (
                  <div key={vol.id} className="bg-gray-50 p-2 rounded">
                    <div className="flex justify-between mb-1">
                      <span className={done ? 'line-through text-gray-500' : ''}>
                        {vol.name} {done && <span className="text-green-600">✓</span>}
                      </span>
                      <span>
                        {vol.current_volume}/{vol.whole_volume} {vol.metrics}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full ${
                          done ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${Math.min(vol.current_volume / vol.whole_volume, 1) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Требования */}
            <div className="space-y-2">
              <h4 className="font-medium">Требования:</h4>
              {requirements.map(req => (
                <label
                  key={req.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={req.is_completed}
                    onChange={() => handleRequirementToggle(req.id)}
                    disabled={!isInspector}
                    className="w-4 h-4"
                  />
                  <span
                    className={
                      req.is_completed ? 'line-through text-gray-500' : ''
                    }
                  >
                    {req.name}
                  </span>
                </label>
              ))}
            </div>

            {/* Исполнители */}
            <div className="flex items-center gap-3">
              {executors.slice(0, 2).map(ex => {
                // Пытаемся получить пользователя из хранилища
                const executorUser = projectStore.users[ex.user_id];
                
                // Если пользователь не найден, показываем заглушку
                if (!executorUser) {
                  return (
                    <div key={ex.id} className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        ?
                      </div>
                      <div className="text-sm text-gray-500">Загрузка...</div>
                    </div>
                  );
                }

                return (
                  <div key={ex.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                      {executorUser.lastName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {executorUser.firstName} {executorUser.lastName}
                      </div>
                      <div className="text-xs text-gray-600">{ex.role}</div>
                    </div>
                  </div>
                );
              })}
              {executors.length > 2 && (
                <div className="text-sm text-gray-500">
                  +{executors.length - 2} еще
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default TaskList;
