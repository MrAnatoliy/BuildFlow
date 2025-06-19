import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../provider/StoreContext';
import StageModal from './StageModal';

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

  if (!project) return <div className="text-base-100 p-10">Загрузка...</div>;

  return (
    <>
      <div className="wrapper flex flex-col justify-center items-start grad-base-100 min-h-screen p-8 sm:pl-[110px] gap-10 text-base-100">
        <div className='w-full flex flex-col ml-[10px] gap-2'>
          <h1 className="text-6xl font-extrabold text-base-100 drop-shadow-md mb-[10px]">
            {project.name}
          </h1>
          <div className="text-3xl  text-base-200">{project.description}</div>
        </div>

        <div className="w-full max-w-5xl h-[600px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col justify-between overflow-hidden relative">
          <div className="flex flex-col gap-6">
            <div className="flex flex-row justify-between items-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-base-100 drop-shadow-md">Этапы проекта</h1>
              <div
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
              >
                <span className="text-2xl text-primary font-semibold">Create new stage</span>
              </div>
            </div>

            <div className="devider w-full h-[1px] bg-base-300" />

            <div className="w-full h-[400px] overflow-hidden">
              <div className="w-full h-full overflow-y-auto pr-2 custom-scrollbar">
                {stages.length === 0 ? (
                  <p className="text-gray-500">У этого проекта ещё нет этапов.</p>
                ) : (
                  <ul className="list-disc pl-5 text-base-100 space-y-2">
                    {stages.map((stage) => (
                      <li 
                        key={stage.id}
                        className="mb-4 p-4 border border-rounded border-base-300 rounded-[18px] bg-base-content hover:bg-blue-50"
                      >
                        <Link
                          to={`/project/${project.id}/stage/${stage.id}`}
                          className="block"
                        >
                          <h3 className="text-3xl text-base-100 hover:text-primary font-semibold">{stage.name}</h3>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div
              onClick={() => setIsModalOpen(true)}
              className="z-100 sm:hidden flex justify-center items-center gap-3 cursor-pointer pt-4"
            >
              <span className="text-xl text-primary font-semibold">Create new stage</span>
            </div>
          </div>
        </div>
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
