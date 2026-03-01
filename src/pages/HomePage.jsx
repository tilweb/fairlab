import { Link } from 'react-router-dom'
import { colors, fontSizes, fontWeights, spacing, borderRadius } from '../config/styleConstants'
import { categories } from '../config/categories'
import { uiStrings } from '../config/uiStrings'
import { useApp } from '../context/AppContext'
import { Button, Card } from '../components/common'
import { getTotalQuestionCount } from '../services/questionLoader'

function HomePage() {
  const { state } = useApp()

  const containerStyle = {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: `${spacing[11]} ${spacing[8]}`,
  }

  const heroStyle = {
    textAlign: 'center',
    marginBottom: spacing[12],
  }

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[5],
    marginBottom: spacing[8],
  }

  const logoIconStyle = {
    width: '64px',
    height: '64px',
    background: `linear-gradient(135deg, ${colors.purple}, ${colors.indigo})`,
    borderRadius: borderRadius['2xl'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
  }

  const titleStyle = {
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.bold,
    color: colors.gray[900],
    marginBottom: spacing[4],
  }

  const subtitleStyle = {
    fontSize: fontSizes.xl,
    color: colors.gray[600],
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6,
  }

  const buttonGroupStyle = {
    display: 'flex',
    gap: spacing[5],
    justifyContent: 'center',
    marginTop: spacing[9],
  }

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spacing[7],
    marginBottom: spacing[12],
  }

  const statCardStyle = {
    background: '#fff',
    borderRadius: borderRadius['4xl'],
    padding: spacing[8],
    textAlign: 'center',
    border: `1px solid ${colors.gray[200]}`,
  }

  const statValueStyle = {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    color: colors.purple,
    marginBottom: spacing[2],
  }

  const statLabelStyle = {
    fontSize: fontSizes.md,
    color: colors.gray[600],
  }

  const sectionTitleStyle = {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.gray[800],
    marginBottom: spacing[7],
    textAlign: 'center',
  }

  const categoriesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spacing[6],
    marginBottom: spacing[12],
  }

  const categoryCardStyle = (color) => ({
    background: '#fff',
    borderRadius: borderRadius['3xl'],
    padding: spacing[7],
    border: `1px solid ${colors.gray[200]}`,
    display: 'flex',
    alignItems: 'center',
    gap: spacing[5],
    transition: 'all 0.2s ease',
  })

  const categoryIconStyle = (color) => ({
    width: '48px',
    height: '48px',
    borderRadius: borderRadius.xl,
    background: `${color}15`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  })

  const infoBoxStyle = {
    background: `linear-gradient(135deg, ${colors.purple}08, ${colors.indigo}08)`,
    borderRadius: borderRadius['5xl'],
    padding: spacing[9],
    border: `1px solid ${colors.purple}20`,
    textAlign: 'center',
  }

  const totalQuestions = getTotalQuestionCount()
  const lastTest = state.testResults[0]

  return (
    <div style={containerStyle}>
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={logoContainerStyle}>
          <div style={logoIconStyle}>
            <span role="img" aria-label="FairLab">⚖️</span>
          </div>
        </div>
        <h1 style={titleStyle}>{uiStrings.app.name}</h1>
        <p style={subtitleStyle}>{uiStrings.app.description}</p>

        <div style={buttonGroupStyle}>
          <Link to="/test">
            <Button icon="▶️" size="lg">
              {uiStrings.home.startTest}
            </Button>
          </Link>
          <Link to="/methodik">
            <Button variant="secondary" icon="📖" size="lg">
              {uiStrings.home.viewMethodology}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{categories.length}</div>
          <div style={statLabelStyle}>{uiStrings.home.stats.categories}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>~{totalQuestions}</div>
          <div style={statLabelStyle}>{uiStrings.home.stats.questions}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>
            {lastTest ? '✅' : '–'}
          </div>
          <div style={statLabelStyle}>
            {lastTest
              ? `Letzter Test: ${new Date(lastTest.createdAt).toLocaleDateString('de-DE')}`
              : 'Noch kein Test'
            }
          </div>
        </div>
      </div>

      {/* Categories */}
      <h2 style={sectionTitleStyle}>AGG-Kategorien</h2>
      <div style={categoriesGridStyle}>
        {categories.map((cat) => (
          <div key={cat.id} style={categoryCardStyle(cat.color)}>
            <div style={categoryIconStyle(cat.color)}>
              {cat.icon}
            </div>
            <div>
              <div style={{ fontWeight: fontWeights.semibold, color: colors.gray[800], marginBottom: spacing[1] }}>
                {cat.name}
              </div>
              <div style={{ fontSize: fontSizes.sm, color: colors.gray[500] }}>
                {cat.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div style={infoBoxStyle}>
        <h3 style={{ fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color: colors.purple, marginBottom: spacing[4] }}>
          Wissenschaftlich fundiert
        </h3>
        <p style={{ fontSize: fontSizes.md, color: colors.gray[600], maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          FairLab basiert auf der BBQ-Methodik (Bias Benchmark for QA), die speziell für den deutschen HR-Kontext
          und die AGG-Kriterien adaptiert wurde. Testen Sie Ihr KI-Modell auf versteckte Vorurteile.
        </p>
        <div style={{ marginTop: spacing[7] }}>
          <Link to="/methodik">
            <Button variant="outline">
              Mehr zur Methodik erfahren
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      {state.testResults.length > 0 && (
        <div style={{ marginTop: spacing[11], textAlign: 'center' }}>
          <h3 style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.gray[700], marginBottom: spacing[5] }}>
            Letzte Ergebnisse
          </h3>
          <Link to="/ergebnisse">
            <Button variant="secondary" icon="📊">
              {state.testResults.length} Test{state.testResults.length !== 1 ? 's' : ''} ansehen
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default HomePage
