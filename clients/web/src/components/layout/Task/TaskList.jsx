import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { motion, AnimatePresence } from 'framer-motion';
import { projectStore } from '../../../stores/ProjectStore';
import { useAuth } from '../../../provider/AuthProvider';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

const TaskList = observer(({ task, onEdit, onOpenSettings }) => {
  const { isInspector } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const volumes = projectStore.getVolumesByTaskId(task.id);
  const requirements = projectStore.getRequirementsByTaskId(task.id);
  const executors = projectStore.getExecutorsByTaskId(task.id);

  const allVolumesDone = volumes.length > 0 && volumes.every(v => v.current_volume >= v.whole_volume);
  const allRequirementsDone = requirements.every(r => r.is_completed);
  const isCompleted = allVolumesDone && allRequirementsDone;
  task.completed = isCompleted;

  const priorityLabel = {
    0: 'Low',
    1: 'Middle',
    2: 'High'
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
      layout
      className={`rounded-lg shadow-lg p-6 mb-6 transition-colors duration-300
        ${isCompleted ? 'bg-green-900 border border-green-600' : 'bg-white/5 border border-white/20'}
      `}
    >
      <div className="flex justify-between items-start gap-6">
        <div className="max-w-[70%]">
          <h3 className="text-3xl font-semibold text-white flex items-center gap-3 leading-tight">
            {task.name}
            {isCompleted && (
              <span className="ml-3 px-3 py-1 bg-green-600 text-white text-sm rounded-lg font-semibold whitespace-nowrap select-none">
                Done
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-300 mt-2 leading-relaxed mb-4">{task.description}</p>
          <p className="text-sm text-gray-500 mt-1">{task.end_date}</p>
        </div>
        <div className="flex items-center gap-4 whitespace-nowrap">
          <span className="px-3 py-1 bg-blue-800 text-blue-200 rounded-full text-sm font-semibold select-none">
            {priorityLabel}
          </span>
          <button
            onClick={() => onOpenSettings(task.id)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Настройки задачи"
          >
            ⚙️
          </button>
          <button
            onClick={toggleTask}
            className="p-2 hover:bg-white/10 rounded-full text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isOpen ? "Свернуть детали задачи" : "Развернуть детали задачи"}
          >
            {isOpen ? <IoIosArrowUp size={24} /> : <IoIosArrowDown size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-6 overflow-hidden"
          >
            {/* Volumes */}
            <section>
              <h4 className="text-3xl font-semibold text-gray-300 mt-3 mb-5 select-none">Scope of work:</h4>
              <div className="space-y-4">
                {volumes.map(vol => {
                  const done = vol.current_volume >= vol.whole_volume;
                  return (
                    <div
                      key={vol.id}
                      className={`bg-white/10 p-4 rounded-lg border ${
                        done ? 'border-green-600' : 'border-white/20'
                      }`}
                    >
                      <div className="flex justify-between text-sm mb-3 font-medium text-gray-300 select-none">
                        <span className={done ? 'line-through text-green-400' : ''}>
                          {vol.name} {done && <span className="text-green-400">✓</span>}
                        </span>
                        <span>
                          {vol.current_volume}/{vol.whole_volume} {vol.metrics}
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-in-out ${
                            done ? 'bg-green-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(vol.current_volume / vol.whole_volume, 1) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Requirements */}
            <section>
              <h4 className="text-3xl font-semibold text-gray-300 mt-8 mb-5 select-none">Requirements:</h4>
              <div className="space-y-3">
                {requirements.map(req => (
                  <label
                    key={req.id}
                    className="flex items-center gap-3 cursor-pointer select-none text-white hover:bg-white/10 rounded-md p-2 transition"
                  >
                    <input
                      type="checkbox"
                      checked={req.is_completed}
                      onChange={() => handleRequirementToggle(req.id)}
                      disabled={!isInspector}
                      className="w-5 h-5 rounded border border-white/40 accent-blue-600"
                    />
                    <span className={req.is_completed ? 'line-through text-green-400' : ''}>
                      {req.name}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* Исполнители */}
            <section className="flex flex-wrap items-center gap-6">
              {executors.slice(0, 2).map(ex => {
                const executorUser = projectStore.users[ex.user_id];
                if (!executorUser) {
                  return (
                    <div
                      key={ex.id}
                      className="flex items-center gap-4 text-gray-400 select-none"
                    >
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center font-semibold text-lg">
                        ?
                      </div>
                      Loading...
                    </div>
                  );
                }
                return (
                  <div key={ex.id} className="flex items-center gap-4 select-none">
                    <div className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center font-semibold text-5xl">
                      {executorUser.lastName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white leading-tight">
                        {executorUser.firstName} {executorUser.lastName}
                      </div>
                      <div className="text-sm text-blue-300 select-text">{ex.role}</div>
                    </div>
                  </div>
                );
              })}
              {executors.length > 2 && (
                <div className="text-sm text-gray-400 select-none">+{executors.length - 2} more</div>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default TaskList;
