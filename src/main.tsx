import React from 'react'
import ReactDOM from 'react-dom/client'

import '#index.css'
import App from '#app.tsx'

const rootElement = document.querySelector('div#root')
if (!rootElement) throw new Error('Root element not found')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
