import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { StoreContext } from "../../provider/StoreContext";
import { useAuth } from "../../provider/AuthProvider";
import { Link } from "react-router-dom";

const ProjectList = observer(() => {
  const { projectStore } = useContext(StoreContext);
  const { user, isManager, isExecutor } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (isManager) {
        await projectStore.fetchShortProjects();
      } else if (isExecutor) {
        await projectStore.fetchExecutorProjects();

      }
    };
    load();
  }, [projectStore, isManager, isExecutor]);

  const projects = isManager 
    ? projectStore.shortProjectList 
    : projectStore.executorProjectList;


  if (projects.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        У вас пока нет проектов.
      </div>
    );
  }

  return (
    <ul>
      {projects?.map((project) => (
          <li
            key={project.id}
            className="mb-4 p-4 border border-rounded border-base-300 rounded-[18px] bg-base-content hover:bg-blue-50"
          >
            <Link to={`/project/${project.id}`} className="block">
              <h3 className="text-3xl font-semibold">{project.name}</h3>
              <p className="text-2xl text-gray-600">{project.description}</p>
              <div className="mt-2 text-2xl text-gray-500">
                Создан: {project.createdAt ?? "неизвестно"}
              </div>
            </Link>
          </li>
        ))}
    </ul>
  );
});

export default ProjectList;
