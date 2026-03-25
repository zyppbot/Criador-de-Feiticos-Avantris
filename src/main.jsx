import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { SpellProvider } from './context/SpellContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SpellProvider>
      <App />
    </SpellProvider>
  </React.StrictMode>,
);
