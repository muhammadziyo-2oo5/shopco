import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '../style.css'; // Direct CSS imports are resolved by Vite

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
