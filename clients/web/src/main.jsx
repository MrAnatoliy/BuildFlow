import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import { ErrorProvider } from "./provider/ErrorProvider";

import { StoreContext } from "./provider/StoreContext";
import { projectStore } from './stores/ProjectStore';
import { taskStore } from "./stores/TaskStore";

createRoot(document.getElementById("root")).render(
    <ErrorProvider>
        <StoreContext.Provider value={{ projectStore, taskStore }}>
            <App />
        </StoreContext.Provider>
    </ErrorProvider>
);