import React from "react";
import { RouterProvider } from "react-router-dom";
import AuthProvider from "./provider/AuthProvider";
import router from "./router";

import ErrorDisplay from "./components/ui/DisplayError/DisplayError";

import './assets/css/tailwindcss.css';
import './assets/css/app.css';


function App() {
  /*
  const { serverOnline, isOnline } = useServerConnection();

  if (!isOnline) {
    return <OfflinePage message="Нет интернет-соединения. Пытаемся восстановить..." />;
  }

  if (!serverOnline) {
    return <OfflinePage message="Сервер недоступен. Автоматическое обновление..." />;
  }
  */
 
  return (
    <AuthProvider>
        <RouterProvider router={router} />
        <ErrorDisplay />
    </AuthProvider>
  )
}

export default App;