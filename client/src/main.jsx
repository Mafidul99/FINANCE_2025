import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <ToastContainer
      position="top-right"
      toastClassName="toastbody"
      theme="colored"
      pauseOnFocusLoss={false}
      pauseOnHover={true}
      draggable={true}
      autoClose={3000}
      draggablePercent={60}
      closeOnClick={true}
    />
  </StrictMode>,
)
