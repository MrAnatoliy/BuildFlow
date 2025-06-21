import { useEffect } from 'react';
import { RouterProvider } from "react-router-dom";
import AuthProvider from "./provider/AuthProvider";
import router from "./router";

import ErrorDisplay from "./components/ui/DisplayError/DisplayError";
import Modal from 'react-modal';

import './assets/css/tailwindcss.css';
import './assets/css/app.css';
import PageLoader from './components/ui/PageLoader/PageLoader';

const App = () => {

	useEffect(() => {
		Modal.setAppElement('#root'); // Указать ID корневого элемента
	}, []);

 	return (
		<>
			<AuthProvider>
				<PageLoader />
				<RouterProvider router={router} />
				<ErrorDisplay />
			</AuthProvider>	
		</>
  )
}

export default App;