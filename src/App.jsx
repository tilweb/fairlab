import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LoginPage from './components/auth/LoginPage'
import HomePage from './pages/HomePage'
import KonfigurationPage from './pages/KonfigurationPage'
import TestPage from './pages/TestPage'
import ErgebnissePage from './pages/ErgebnissePage'
import ErgebnisDetailPage from './pages/ErgebnisDetailPage'
import PromptVergleichPage from './pages/PromptVergleichPage'
import MethodikPage from './pages/MethodikPage'
import FragenEditorPage from './pages/FragenEditorPage'
import { checkAuthStatus } from './services/authService'

function App() {
  const [authState, setAuthState] = useState({
    checking: true,
    authEnabled: false,
    authenticated: false,
  })

  useEffect(() => {
    async function checkAuth() {
      const status = await checkAuthStatus()
      setAuthState({
        checking: false,
        authEnabled: status.authEnabled,
        authenticated: status.authenticated,
      })
    }
    checkAuth()
  }, [])

  // Während Auth-Check: Ladebildschirm
  if (authState.checking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#9878;</div>
          <p style={{ color: '#64748b' }}>Laden...</p>
        </div>
      </div>
    )
  }

  // Auth aktiviert aber nicht eingeloggt: Login-Seite
  if (authState.authEnabled && !authState.authenticated) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setAuthState(prev => ({ ...prev, authenticated: true }))
        }}
      />
    )
  }

  // Authentifiziert oder Auth nicht aktiviert: normale App
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/konfiguration" element={<KonfigurationPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/ergebnisse" element={<ErgebnissePage />} />
        <Route path="/ergebnisse/:id" element={<ErgebnisDetailPage />} />
        <Route path="/vergleich" element={<PromptVergleichPage />} />
        <Route path="/methodik" element={<MethodikPage />} />
        <Route path="/fragen-editor" element={<FragenEditorPage />} />
      </Routes>
    </Layout>
  )
}

export default App
