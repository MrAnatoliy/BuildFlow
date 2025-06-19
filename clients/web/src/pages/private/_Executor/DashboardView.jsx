import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { StoreContext } from "../../../provider/StoreContext";
import TaskList from "../../../components/layout/Task/TaskList";
import { useAuth } from "../../../provider/AuthProvider";
import { TaskSettingsModal } from '../TaskSettingsModal'; // Импортируем компонент модалки

const DashboardView = observer(() => {
  const { projectStore } = useContext(StoreContext);
  const { projectId } = useParams();
  const { user, isExecutor } = useAuth();

  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [settingsTaskId, setSettingsTaskId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (isExecutor) {
          await projectStore.fetchExecutorProjects();
          await projectStore.fetchExecutorTasks();
          await projectStore.fetchAllUsers();
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [projectId]);

  const handleOpenSettings = (taskId) => {
    setSettingsTaskId(taskId);
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
    setSettingsTaskId(null);
  };

  if (loading) return <div>Загрузка...</div>;

  const tasks = projectStore.getExecutorTasksByProjectId(+projectId)
    .map(task => projectStore.tasks[task.id])
    .filter(Boolean);

  if (!tasks.length) {
    return <div>У вас нет задач в этом проекте</div>;
  }

  return (
    <>

      <div className="wrapper flex flex-col justify-center items-start grad-base-100 min-h-screen p-8 sm:pl-[110px] gap-10 text-base-100">
        <div className='w-[200px] flex flex-col ml-[10px] gap-2'>
          <h1 className="text-6xl font-extrabold text-base-100 drop-shadow-md mb-[10px]">
            Ваши задачи в проекте «{projectStore.shortProjects[+projectId]?.name}»
          </h1>
        </div>

        <div className="w-full max-w-5xl h-[600px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col justify-between overflow-hidden relative">
          <div className="flex flex-col gap-6">
            <div className="flex flex-row justify-between items-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-base-100 drop-shadow-md">Задачи этапа</h1>
            </div>

            <div className="devider w-full h-[1px] bg-base-300" />

            <div className="w-full h-[400px] overflow-hidden">
              <div className="w-full h-full overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="text-gray-400">Загрузка задач...</div>
                ) : tasks.length === 0 ? (
                  <div className="text-gray-500">Задачи отсутствуют</div>
                ) : (
                  <ul className="space-y-4">
                    {tasks.map(task => (
                      <li key={task.id}>
                        <TaskList
                          task={task}
                          onEdit={null}
                          onOpenSettings={() => handleOpenSettings(task.id)}
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
      {/* Модальное окно настроек */}
      <TaskSettingsModal
        isOpen={isSettingsOpen}
        taskId={settingsTaskId}
        onClose={handleCloseSettings}
        onVolumesChange={() => projectStore.fetchExecutorTasks()}
      />
    </>
    
  );
});

export default DashboardView;