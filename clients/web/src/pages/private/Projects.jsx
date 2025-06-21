import { useState } from "react";
import IconCreateProject from "../../components/icons/icons";
import ProjectsList from "./ProjectList";
import { ModalCreateProject } from "./ModalCreateProject";
import { useAuth } from "../../provider/AuthProvider";
import { motion } from "framer-motion";

const Projects = () => {
  const { user, role } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const roleLabels = {
    project_manager: 'Project manager',
    executor: 'Executor',
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-900 to-slate-950 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl"
      >
        <h1 className="text-5xl sm:text-5xl font-bold ml-2 mb-2">
          Hi, <span className="text-blue-400">{user.given_name}</span> 👋🏻
        </h1>
        <h2 className="text-4xl text-gray-400 ml-2 ">
          Your role: {roleLabels[role] || <span className="text-gray-600">There is no role</span>}
        </h2>
        <p className="text-3xl text-gray-500 ml-2 mt-4">See the projects you're involved in</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-6xl mt-10 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-semibold">My projects</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
          >
            <IconCreateProject className="w-5 h-5" />
            <span className="text-3xl">Сreate a project</span>
          </motion.button>
        </div>

        <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <ProjectsList />
        </div>
      </motion.div>

      <ModalCreateProject
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Projects;
