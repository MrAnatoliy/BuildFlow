import { useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { StoreContext } from "../../provider/StoreContext";
import { useAuth } from "../../provider/AuthProvider";
import { Link } from "react-router-dom";

const ProjectList = observer(() => {
  const { projectStore } = useContext(StoreContext);
  const { isManager, isExecutor } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (isManager) await projectStore.fetchShortProjects();
      else if (isExecutor) await projectStore.fetchExecutorProjects();
    };
    load();
  }, [projectStore, isManager, isExecutor]);

  const projects = isManager
    ? projectStore.shortProjectList
    : projectStore.executorProjectList;

  if (!projects.length) {
    return <div className="text-2xl text-gray-400 text-center py-10">You don't have any projects yet.</div>;
  }

  return (
    <ul className="space-y-4">
      {projects.map((project) => (
        <li
          key={project.id}
          className="p-5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
        >
          <Link to={`/project/${project.id}`} className="block space-y-1">
            <h4 className="text-3xl font-bold text-white mb-2">{project.name}</h4>
            <p className="text-gray-300 text-sm mb-4">{project.description}</p>
            <span className="text-gray-400 text-xs">Created: {project.createdAt || "Unknown"}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
});

export default ProjectList;
