import { createRoot } from 'react-dom/client';
import App from './App.jsx';

import { ErrorProvider } from './provider/ErrorProvider';

createRoot(document.getElementById('root')).render(
     <ErrorProvider>
        <App />
     </ErrorProvider>
);