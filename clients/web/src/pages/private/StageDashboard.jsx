import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../provider/StoreContext';
import StageModal from './StageModal';
import { motion } from 'framer-motion';

const StageDashboard = observer(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { projectId } = useParams();
  const { projectStore } = useContext(StoreContext);
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [stages, setStages] = useState([]);

  useEffect(() => {
    if (!projectId) return;

    projectStore.getProjectById(projectId).then(proj => {
      if (!proj) {
        navigate('/projects');
      } else {
        setProject(proj);
        const projStages = projectStore.getStagesByProjectId(proj.id);
        setStages(projStages);
      }
    });
  }, [projectId, navigate, projectStore]);

  const handleSaveStage = (stage) => {
    projectStore.addStage(project.id, stage).then(() => {
      const updatedStages = projectStore.getStagesByProjectId(project.id);
      setStages(updatedStages);
    });
    setIsModalOpen(false);
  };

  if (!project) return <div className="text-white p-10 text-center">Loading...</div>;

  return (
    <>
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-900 to-slate-950 text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl flex flex-col items-start gap-6"
        >
          <h1 className="text-6xl font-extrabold drop-shadow-md ml-2">
            {project.name}
          </h1>
          <p className="text-3xl text-gray-400 max-w-4xl ml-2">{project.description}</p>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-semibold">Project stages</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
              >
                <span className="text-3xl">Create a stage</span>
              </motion.button>
            </div>

            <div className="h-[500px] overflow-y-auto pt-2 pr-2 custom-scrollbar">
              {stages.length === 0 ? (
                <p className="text-gray-400 text-2xl">This project has no stages yet.</p>
              ) : (
                <ul className="space-y-4">
                  {stages.map(stage => (
                    <li key={stage.id} className="p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition">
                      <Link to={`/project/${project.id}/stage/${stage.id}`} className="block">
                        <h3 className="text-3xl font-semibold mb-1">{stage.name}</h3>
                        <p className="text-sm text-gray-300">{stage.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <StageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStage}
        initialStage={{}}
      />
    </>
  );
});

export default StageDashboard;
