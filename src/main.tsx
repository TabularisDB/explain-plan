import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@tabularis/explain-oracle';
import '@tabularis/explain-sqlserver';
import '@xyflow/react/dist/style.css';
import './index.css';
import './i18n';
import App from './App';
import '@fontsource-variable/urbanist';
import '@fontsource-variable/jetbrains-mono';
import {BrowserRouter} from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
);
