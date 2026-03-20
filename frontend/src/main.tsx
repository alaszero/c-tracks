import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', color: '#F97316', marginBottom: '0.5rem' }}>
          C-Tracks
        </h1>
        <p style={{ color: '#94A3B8' }}>
          Sistema de Gestión para Maquinaria y Construcción
        </p>
        <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '1rem' }}>
          Backend API: <a href="/docs" style={{ color: '#F97316' }}>/docs</a>
        </p>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
