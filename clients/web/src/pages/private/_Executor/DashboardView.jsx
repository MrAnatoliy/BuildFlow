import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { StoreContext } from "../../../provider/StoreContext";
import TaskList from "../../../components/layout/Task/TaskList";
import { useAuth } from "../../../provider/AuthProvider";
import { TaskSettingsModal } from '../TaskSettingsModal'; // Импортируем компонент модалки
import { motion } from 'framer-motion';

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

  if (loading) return <div className="text-white p-10 text-center">Loading...</div>;

  const tasks = projectStore.getExecutorTasksByProjectId(+projectId)
    .map(task => projectStore.tasks[task.id])
    .filter(Boolean);

  if (!tasks.length) {
    return <div className="text-white p-10 text-center">You don't have any tasks in this project.</div>;
  }

  return (
    <>
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-900 to-slate-950 text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl flex flex-col items-start gap-6"
        >
          <h1 className="text-5xl font-extrabold drop-shadow-md mb-2">
            Your tasks in the project: «{projectStore.shortProjects[+projectId]?.name}»
          </h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-semibold">Tasks of the stage</h2>
            </div>

            <div className="h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="text-gray-400 text-center">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="text-gray-400 text-center">There are no tasks</div>
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
          </motion.div>
        </motion.div>
      </div>

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
