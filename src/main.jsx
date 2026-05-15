import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { useStore } from './store';

if (import.meta.env.DEV) {
  window.__store = useStore;
  window.__resetIntro = () => useStore.getState().resetIntro();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
