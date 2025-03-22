import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { registerPlugin } from '@capacitor/core';
import ReactDOM from 'react-dom/client';

const AppPlugin = registerPlugin('App');

const container = document.getElementById('root');

// Add this for debugging
console.log('React version:', React.version);
console.log('ReactDOM available:', !!ReactDOM);
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);