import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  containerVariants,
  slideFromTop,
  hoverScale,
  tapScale,
} from "../../../utils/animations";

import {
  IconBluePrint,
  IconContractors,
  IconDashboard,
  IconNotification,
  IconUser,
} from "../../icons/icons";
import { useAuth } from "../../../provider/AuthProvider";

const Sidebar = () => {
  const { isManager, isExecutor } = useAuth()

  const location = useLocation();
  const navigate = useNavigate();

  const isProjectsList = location.pathname === "/projects";
  const isProjectDashboard = location.pathname.startsWith("/project/");
  const currentProjectId = location.pathname.split("/")[2]; // /project/:id

  const goTo = (path) => () => navigate(path);

  return (
    <motion.header
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="fixed w-full sm:w-18 sm:h-full shadow-xl bg-gradient-to-b from-slate-900 to-slate-950 text-white border-r border-r-slate-700/40 pl-[18px] pr-[18px] p-[10px] sm:p-[30px] z-100"
    >
      <ul className="w-full h-full flex flex-row sm:flex-col justify-center items-center">
        <ul className="w-full h-full flex flex-row sm:flex-col justify-start items-center">
            
          <motion.li
            variants={slideFromTop}
            whileHover={hoverScale}
            whileTap={tapScale}
            className="hidden sm:block icon-list-item mr-[30px] sm:mr-0 sm:mb-[60px]"
          >
            <IconNotification />
          </motion.li>

          <motion.li
            variants={slideFromTop}
            whileHover={hoverScale}
            whileTap={tapScale}
            onClick={goTo(isProjectDashboard ? `/project/${currentProjectId}` : "/projects")}
            className={`icon-list-item mr-[15px] sm:mr-0 sm:mb-[30px] ${
              isProjectsList || location.pathname === `/project/${currentProjectId}` ? "active" : ""
            }`}
          >
            <IconDashboard />
          </motion.li>

          {(isProjectDashboard && isManager) && (
            <motion.li
              variants={slideFromTop}
              whileHover={hoverScale}
              whileTap={tapScale}
              onClick={goTo(`/project/${currentProjectId}/blueprint`)}
              className={`icon-list-item mr-[15px] sm:mr-0 sm:mb-[30px] ${
                location.pathname.includes("blueprint") ? "active" : ""
              }`}
            >
              <IconBluePrint />
            </motion.li>
          )}
        </ul>

        <ul className="block sm:hidden flex justify-center items-center">
          <motion.span variants={slideFromTop} whileHover={hoverScale} whileTap={tapScale}>
            BuildFlow
          </motion.span>
        </ul>

        <ul className="w-full h-full flex flex-row sm:flex-col justify-end items-center">
          {(isProjectDashboard && !isManager && !isExecutor) && (
            <motion.li
              variants={slideFromTop}
              whileHover={hoverScale}
              whileTap={tapScale}
              onClick={goTo(`/project/${currentProjectId}/contractors`)}
              className={`icon-list-item mr-[15px] sm:mr-0 sm:mb-[30px] ${
                location.pathname.includes("contractors") ? "active" : ""
              }`}
            >
              <IconContractors />
            </motion.li>
          )}

          {/* 👤 Profile — всегда */}
          <motion.li
            variants={slideFromTop}
            whileHover={hoverScale}
            whileTap={tapScale}
            onClick={goTo("/profile")}
            className={`w-11 h-11 flex justify-center items-center rounded-full bg-base transition-colors duration-300 ease-in hover:bg-primary ${
              location.pathname === "/profile" ? "bg-primary" : "bg-accent"
            }`}
          >
            <IconUser />
          </motion.li>
        </ul>
      </ul>
    </motion.header>
  );
};

export default Sidebar;
