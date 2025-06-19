// src/pages/private/_Manager/DashboardView.jsx
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../provider/StoreContext';
import TaskList from '../../../components/layout/Task/TaskList';
import TaskModal from '../TaskModal';
import { TaskSettingsModal } from '../TaskSettingsModal';

const DashboardView = observer(() => {
  const { projectId, stageId } = useParams();
  const { projectStore } = useContext(StoreContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [stage, setStage] = useState(null);

  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [settingsTaskId, setSettingsTaskId] = useState(null);

  // Загрузка проекта/этапа
  useEffect(() => {
    async function load() {
      setLoading(true);
      const proj = await projectStore.getProjectById(+projectId);
      setProject(proj);
      setStage(projectStore.stages[+stageId]);
      setLoading(false);
    }
    load();
  }, [projectId, stageId, projectStore]);

  // Функция перезагрузки списка задач
  const reloadTasks = useCallback(async () => {
    setTasksLoading(true);
    await projectStore.fetchTasksByStageId(+stageId);
    setTasks(projectStore.getTasksByStageId(+stageId));
    setTasksLoading(false);
  }, [stageId, projectStore]);

  // Первичная загрузка задач
  useEffect(() => {
    reloadTasks();
  }, [reloadTasks]);

  const handleSave = async (taskData) => {
    if (editingTask && editingTask.id) {
      await projectStore.updateTask(editingTask.id, taskData);
    } else {
      await projectStore.addTask(taskData);
    }
    await reloadTasks();
    setModalOpen(false);
    setEditingTask(null);
  };

  const openSettings = (taskId) => {
    setSettingsTaskId(taskId);
    setSettingsOpen(true);
  };
  const closeSettings = () => {
    setSettingsOpen(false);
    setSettingsTaskId(null);
  };

  if (loading)   return <div>Загрузка проекта...</div>;
  if (!project)  return <div>Проект не найден</div>;
  if (!stage)    return <div>Этап не найден</div>;

  return (
    <>
      <div className="wrapper flex flex-col justify-center items-start grad-base-100 min-h-screen p-8 sm:pl-[110px] gap-10 text-base-100">
        <div className='w-[200px] flex flex-col ml-[10px] gap-2'>
          <h1 className="text-6xl font-extrabold text-base-100 drop-shadow-md mb-[10px]">
            {project.name}
          </h1>
          <div className="devider w-full h-[1px] bg-base-300" />
          <div className="text-3xl text-base-200">{stage.name}</div>
          <div className="flex flex-col text-md text-gray-400 mt-2">
            <span className="">Начало: {stage.start_date}</span>
            <span className="">Окончание: {stage.end_date}</span>
          </div>
        </div>

        <div className="w-full max-w-5xl h-[600px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col justify-between overflow-hidden relative">
          <div className="flex flex-col gap-6">
            <div className="flex flex-row justify-between items-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-base-100 drop-shadow-md">Задачи этапа</h1>
              <div
                onClick={() => setModalOpen(true)}
                className="hidden sm:flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
              >
                <span className="text-2xl text-primary font-semibold">+ Создать задачу</span>
              </div>
            </div>

            <div className="devider w-full h-[1px] bg-base-300" />

            <div className="w-full h-[400px] overflow-hidden">
              <div className="w-full h-full overflow-y-auto pr-2 custom-scrollbar">
                {tasksLoading ? (
                  <div className="text-gray-400">Загрузка задач...</div>
                ) : tasks.length === 0 ? (
                  <div className="text-gray-500">Задачи отсутствуют</div>
                ) : (
                  <ul className="space-y-4">
                    {tasks.map((task) => (
                      <li key={task.id}>
                        <TaskList
                          task={task}
                          onEdit={() => {
                            setEditingTask(task);
                            setModalOpen(true);
                          }}
                          onOpenSettings={() => openSettings(task.id)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div
              onClick={() => setModalOpen(true)}
              className="z-100 sm:hidden flex justify-center items-center gap-3 cursor-pointer pt-4"
            >
              <span className="text-xl text-primary font-semibold">+ Создать задачу</span>
            </div>
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSave}
        initialTask={editingTask || {}}
        stageId={stageId}
      />

      <TaskSettingsModal
        isOpen={isSettingsOpen}
        taskId={settingsTaskId}
        onClose={closeSettings}
        onVolumesChange={reloadTasks}     // <-- прокидываем сюда
      />
    </>
  );
});

export default DashboardView;
