import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import { useContext, useState } from 'react';
import { StoreContext } from '../../provider/StoreContext';

const ProjectSettings = observer(() => {
  const { projectId } = useParams();
  const { projectStore } = useContext(StoreContext);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const project = projectStore.getProjectById(projectId);

  const handleDeleteProject = () => {
    projectStore.deleteProject(projectId);
    setShowDeleteConfirm(false);
  };

  if (!project) return null;

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Настройки проекта</h2>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Опасная зона
          </h3>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Удалить проект
          </button>
        </div>
      </div>
{/*
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteProject}
        title="Удаление проекта"
        message="Вы уверены что хотите удалить проект? Это действие нельзя отменить."
      />
*/}
    </div>
  );
});

export default ProjectSettings;