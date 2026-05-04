import React from 'react';
import ReactDOM from 'react-dom/client';
import { SwapForm } from './swap-form';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <main className="app">
      <SwapForm />
    </main>
  </React.StrictMode>,
);
