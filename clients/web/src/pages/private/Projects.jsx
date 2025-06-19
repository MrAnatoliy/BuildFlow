import { useState } from "react";
import IconCreateProject from "../../components/icons/icons";
import ProjectsList from "./ProjectList";
import { ModalCreateProject } from "./ModalCreateProject";
import { useAuth } from "../../provider/AuthProvider";

const Projects = () => {
  const { user, role, isManager } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const roleLabels = {
    project_manager: 'Руководитель проекта',
    executor: 'Исполнитель',
  };

  return (
    <>
      <div className="wrapper flex flex-col justify-center items-start grad-base-100 min-h-screen p-8 sm:pl-[110px] gap-10 text-base-100">
        <div className="flex flex-col ml-[10px] gap-2">
          <h1 className="text-6xl font-extrabold text-base-100 drop-shadow-md">Hi, {user.given_name} 👋🏻</h1>
          <h1 className="text-6xl font-extrabold text-base-100 drop-shadow-md">Your role: {roleLabels[role]}</h1>
          <span className="text-gray-400">Take a look into your projects</span>
        </div>
        <div className="w-full max-w-5xl h-[600px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col justify-between overflow-hidden relative">
          <div className="flex flex-col gap-6">
            <div className="flex flex-row justify-between items-center">
              <h1 className="text-5xl font-extrabold text-base-100 drop-shadow-md">My projects</h1>
              {isManager 
                ? <>
                    <div
                      onClick={() => setIsModalOpen(true)}
                      className="hidden sm:flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                    >
                      <IconCreateProject />
                      <span className="text-2xl text-primary font-semibold">Create a new project</span>
                    </div>
                  </>
                : null
              }
            </div>

            <div className="h-[1px] bg-base-300" />
            <div className="w-full h-[450px] overflow-hidden">
              <div className="w-full h-full overflow-y-auto pr-2 custom-scrollbar">
                <ProjectsList />
              </div>
            </div>
              {isManager 
                ? <>
                    <div
                      onClick={() => setIsModalOpen(true)}
                      className="z-100 sm:hidden flex justify-center items-center gap-3 cursor-pointer pt-4"
                    >
                      <IconCreateProject />
                      <span className="hidden sm:block text-xl text-primary font-semibold">Create a new project</span>
                    </div>
                  </>
                : null
              }
          </div>
        </div>
      </div>
      {isManager 
        ? <>
            <ModalCreateProject 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
            />
          </>
        : null}

    </>
  );
};

export default Projects;
