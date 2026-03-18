/**
 * @fileoverview Punto de entrada de la aplicación React.
 * Monta el árbol de componentes en el DOM con StrictMode para detectar
 * problemas durante el desarrollo.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/global.css'
import App from './App'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error(
    'No se encontró el elemento #root en el DOM. Verifica index.html.'
  )
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
