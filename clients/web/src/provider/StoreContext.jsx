import React from "react";
import { projectStore } from "../stores/ProjectStore";
import { taskStore } from "../stores/TaskStore";

export const StoreContext = React.createContext({
  projectStore,
  taskStore
});

export const useStores = () => React.useContext(StoreContext);
