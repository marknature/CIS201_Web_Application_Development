/**
 * FFIMS — Entry Point
 * File: ffims_frontend/src/main.jsx
 *
 * Replace the contents of your existing main.jsx with this.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './AppRouter';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
