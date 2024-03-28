import React from 'react'
import ReactDOM from 'react-dom/client'

import { AuthProvider } from '@context/authContext'

import App from './App.tsx'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <AuthProvider>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  // </AuthProvider>
)
