import { Link, useLocation } from 'react-router-dom'
import { colors, fontSizes, fontWeights, spacing, borderRadius, baseStyles } from '../../config/styleConstants'
import { categories } from '../../config/categories'
import { uiStrings } from '../../config/uiStrings'
import { useApp } from '../../context/AppContext'

function Sidebar() {
  const location = useLocation()
  const { state } = useApp()

  const sidebarStyle = {
    width: '280px',
    minWidth: '280px',
    background: '#fff',
    borderRight: `1px solid ${colors.gray[200]}`,
    minHeight: 'calc(100vh - 60px)',
    padding: spacing[7],
    fontFamily: baseStyles.fontFamily,
  }

  const sectionTitleStyle = {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: spacing[4],
    marginTop: spacing[8],
  }

  const menuItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
    padding: `${spacing[4]} ${spacing[5]}`,
    borderRadius: borderRadius.lg,
    textDecoration: 'none',
    fontSize: fontSizes.md,
    fontWeight: isActive ? fontWeights.semibold : fontWeights.normal,
    color: isActive ? colors.purple : colors.gray[700],
    background: isActive ? `${colors.purple}10` : 'transparent',
    marginBottom: spacing[2],
    transition: baseStyles.transition,
  })

  const categoryItemStyle = (color) => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
    padding: `${spacing[3]} ${spacing[5]}`,
    borderRadius: borderRadius.md,
    fontSize: fontSizes.sm,
    color: colors.gray[600],
    marginBottom: spacing[1],
    cursor: 'default',
  })

  const categoryDotStyle = (color) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: color,
  })

  const statsBoxStyle = {
    background: `linear-gradient(135deg, ${colors.purple}10, ${colors.indigo}10)`,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginTop: spacing[8],
    border: `1px solid ${colors.purple}20`,
  }

  const statItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  }

  const statLabelStyle = {
    fontSize: fontSizes.sm,
    color: colors.gray[600],
  }

  const statValueStyle = {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.gray[800],
  }

  const quickLinks = [
    { path: '/test', label: 'Neuen Test starten', icon: '▶️' },
    { path: '/ergebnisse', label: 'Letzte Ergebnisse', icon: '📈' },
    { path: '/fragen-editor', label: 'Fragen bearbeiten', icon: '✏️' },
  ]

  return (
    <aside style={sidebarStyle}>
      {/* Quick Links */}
      <div>
        {quickLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            style={menuItemStyle(location.pathname === link.path)}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Kategorien */}
      <div style={sectionTitleStyle}>AGG-Kategorien</div>
      <div>
        {categories.map((cat) => (
          <div key={cat.id} style={categoryItemStyle(cat.color)}>
            <div style={categoryDotStyle(cat.color)} />
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Status Box */}
      <div style={statsBoxStyle}>
        <div style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.purple, marginBottom: spacing[4] }}>
          Status
        </div>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>Tests durchgeführt</span>
          <span style={statValueStyle}>{state.testResults.length}</span>
        </div>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>API konfiguriert</span>
          <span style={statValueStyle}>
            {state.apiConfig.apiKey ? '✅' : '❌'}
          </span>
        </div>
        <div style={{ ...statItemStyle, marginBottom: 0 }}>
          <span style={statLabelStyle}>Aktueller Status</span>
          <span style={{
            ...statValueStyle,
            color: state.currentTest.status === 'running' ? colors.green : colors.gray[500],
          }}>
            {state.currentTest.status === 'idle' && 'Bereit'}
            {state.currentTest.status === 'running' && 'Läuft'}
            {state.currentTest.status === 'paused' && 'Pausiert'}
            {state.currentTest.status === 'completed' && 'Fertig'}
            {state.currentTest.status === 'error' && 'Fehler'}
          </span>
        </div>
      </div>

      {/* Footer Links */}
      <div style={{ marginTop: spacing[11], paddingTop: spacing[6], borderTop: `1px solid ${colors.gray[200]}` }}>
        <div style={{ fontSize: fontSizes.xs, color: colors.gray[400], marginBottom: spacing[2] }}>
          Adacor Solutions Team
        </div>
        <div style={{ fontSize: fontSizes.xs, color: colors.gray[400] }}>
          solutions@adacor.com
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
