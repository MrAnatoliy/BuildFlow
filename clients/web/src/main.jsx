import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import { ErrorProvider } from "./provider/ErrorProvider";
import { StoreContext } from "./provider/StoreContext";
import { projectStore } from './stores/ProjectStore';
import { taskStore } from "./stores/TaskStore";

const ENABLE_MOCKS = false;

async function startApp() {
  if (import.meta.env.MODE === 'development' && ENABLE_MOCKS) {
    const { worker } = await import('./services/mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  createRoot(document.getElementById("root")).render(
    <ErrorProvider>
      <StoreContext.Provider value={{ projectStore, taskStore }}>
        <App />
      </StoreContext.Provider>
    </ErrorProvider>
  );
}

startApp();
