import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../provider/StoreContext';
import TaskList from '../../../components/layout/Task/TaskList';
import TaskModal from '../TaskModal';
import { TaskSettingsModal } from '../TaskSettingsModal';
import { motion } from 'framer-motion';

const DashboardView = observer(() => {
  const { projectId, stageId } = useParams();
  const { projectStore } = useContext(StoreContext);

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [stage, setStage] = useState(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [settingsTaskId, setSettingsTaskId] = useState(null);

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

  const reloadTasks = useCallback(async () => {
    setTasksLoading(true);
    await projectStore.fetchTasksByStageId(+stageId);
    setTasks(projectStore.getTasksByStageId(+stageId));
    setTasksLoading(false);
  }, [stageId, projectStore]);

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
    setSettingsTaskId(null);
    setSettingsOpen(false);
  };

  if (loading) return <div className="text-white p-10 text-center">Loading...</div>;

  return (
    <>
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-900 to-slate-950 text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl flex flex-col items-start gap-6"
        >
          <h1 className="ml-2 text-3xl font-extrabold drop-shadow-md">
            Project: {project?.name}
          </h1>
          <h2 className="ml-2 text-5xl font-semibold text-gray-400 mb-3">
            Stage: {stage?.name}
          </h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-semibold">Tasks of the stage</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
              >
                <span className="text-3xl">Create a task</span>
              </motion.button>
            </div>

            <div className="h-[500px] overflow-y-auto pt-2 pr-2 custom-scrollbar">
              {tasksLoading ? (
                <div className="text-gray-400 text-center">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="text-gray-400 text-center">There are no tasks</div>
              ) : (
                <ul className="space-y-4">
                  {tasks.map(task => (
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
          </motion.div>
        </motion.div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSave}
        initialTask={editingTask}
        stageId={Number(stageId)}
      />

      <TaskSettingsModal
        isOpen={isSettingsOpen}
        taskId={settingsTaskId}
        onClose={closeSettings}
        onVolumesChange={reloadTasks}
      />
    </>
  );
});

export default DashboardView;
