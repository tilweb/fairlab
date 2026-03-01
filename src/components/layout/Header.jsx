import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { colors, fontSizes, fontWeights, spacing, baseStyles } from '../../config/styleConstants'
import { uiStrings } from '../../config/uiStrings'
import { checkAuthStatus, logout } from '../../services/authService'

const navItems = [
  { path: '/', label: uiStrings.nav.home, icon: '🏠' },
  { path: '/konfiguration', label: uiStrings.nav.configuration, icon: '⚙️' },
  { path: '/test', label: uiStrings.nav.test, icon: '🧪' },
  { path: '/ergebnisse', label: uiStrings.nav.results, icon: '📊' },
  { path: '/vergleich', label: uiStrings.nav.comparison, icon: '🔄' },
  { path: '/methodik', label: uiStrings.nav.methodology, icon: '📖' },
]

function Header() {
  const location = useLocation()
  const [authEnabled, setAuthEnabled] = useState(false)
  const checkedRef = useRef(false)

  useEffect(() => {
    // Nur einmal prüfen, mit kurzer Verzögerung um Flackern zu vermeiden
    if (checkedRef.current) return
    checkedRef.current = true

    const timer = setTimeout(() => {
      checkAuthStatus().then(status => {
        setAuthEnabled(status.authEnabled)
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  const headerStyle = {
    height: '60px',
    background: '#fff',
    borderBottom: `1px solid ${colors.gray[200]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${spacing[8]}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    fontFamily: baseStyles.fontFamily,
  }

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
    textDecoration: 'none',
    color: colors.gray[900],
  }

  const logoIconStyle = {
    width: '36px',
    height: '36px',
    background: `linear-gradient(135deg, ${colors.purple}, ${colors.indigo})`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  }

  const logoTextStyle = {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes['2xl'],
    color: colors.gray[900],
  }

  const taglineStyle = {
    fontSize: fontSizes.xs,
    color: colors.gray[500],
    marginLeft: spacing[3],
  }

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  }

  const navLinkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[3]} ${spacing[5]}`,
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: fontSizes.md,
    fontWeight: isActive ? fontWeights.semibold : fontWeights.normal,
    color: isActive ? colors.purple : colors.gray[600],
    background: isActive ? `${colors.purple}10` : 'transparent',
    transition: baseStyles.transition,
  })

  return (
    <header style={headerStyle}>
      <Link to="/" style={logoStyle}>
        <div style={logoIconStyle}>
          <span role="img" aria-label="FairLab">⚖️</span>
        </div>
        <div>
          <span style={logoTextStyle}>{uiStrings.app.name}</span>
          <span style={taglineStyle}>{uiStrings.app.tagline}</span>
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
        <nav style={navStyle}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={navLinkStyle(location.pathname === item.path)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {authEnabled && (
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[2]} ${spacing[4]}`,
              borderRadius: '6px',
              border: `1px solid ${colors.gray[300]}`,
              background: 'transparent',
              fontSize: fontSizes.sm,
              color: colors.gray[600],
              cursor: 'pointer',
              transition: baseStyles.transition,
            }}
            title="Abmelden"
          >
            <span>Abmelden</span>
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
