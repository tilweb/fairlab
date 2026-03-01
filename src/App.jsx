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
import { getInitialAuthStatus, checkAuthStatus } from './services/authService'

// Auth-Status sofort beim Laden holen (synchron, kein Flackern)
const initialAuth = getInitialAuthStatus()

function App() {
  const [authState, setAuthState] = useState({
    // Wenn eingebetteter Status vorhanden: sofort nutzen (kein checking)
    checking: !initialAuth,
    authEnabled: initialAuth?.authEnabled ?? false,
    authenticated: initialAuth?.authenticated ?? false,
  })

  useEffect(() => {
    // Nur API-Call wenn kein eingebetteter Status (Dev-Server)
    if (initialAuth) return

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

  // Während Auth-Check (nur im Dev-Modus): Ladebildschirm
  if (authState.checking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
          textAlign: 'center',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            margin: '0 auto 16px',
          }}>
            &#9878;
          </div>
          <p style={{ color: '#64748b', margin: 0 }}>Laden...</p>
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
