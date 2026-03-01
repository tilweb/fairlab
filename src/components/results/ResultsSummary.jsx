import { colors, fontSizes, fontWeights, spacing, borderRadius } from '../../config/styleConstants'
import BiasGauge from './BiasGauge'
import ScoreCard from './ScoreCard'

/**
 * ResultsSummary - Complete overview of test results
 *
 * Props:
 * - analysis: Object containing test analysis data
 * - duration: number (milliseconds)
 * - showDetails: boolean (default: true)
 */
function ResultsSummary({
  analysis,
  duration,
  showDetails = true,
}) {
  if (!analysis) {
    return (
      <div style={{ textAlign: 'center', color: colors.gray[500], padding: spacing[8] }}>
        Keine Analysedaten verfügbar
      </div>
    )
  }

  const score = analysis.summary?.overallBiasScore || 0
  const totalQuestions = analysis.summary?.totalQuestions || 0
  const accuracy = analysis.summary?.overallAccuracy || 0
  const stereotypeAnswers = analysis.summary?.stereotypeAnswers || 0

  const containerStyle = {
    background: '#fff',
    borderRadius: borderRadius['4xl'],
    padding: spacing[9],
    border: `1px solid ${colors.gray[200]}`,
  }

  const headerStyle = {
    textAlign: 'center',
    marginBottom: spacing[8],
  }

  const titleStyle = {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.gray[800],
    marginBottom: spacing[4],
  }

  const gaugeContainerStyle = {
    maxWidth: '500px',
    margin: '0 auto',
  }

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: spacing[5],
    marginTop: spacing[8],
  }

  const formatDuration = (ms) => {
    if (!ms) return '–'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  return (
    <div style={containerStyle}>
      {/* Header with Gauge */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>Gesamtergebnis</h2>
        <div style={gaugeContainerStyle}>
          <BiasGauge
            score={score}
            size="lg"
            showLabel={true}
            showDescription={true}
          />
        </div>
      </div>

      {/* Stats Grid */}
      {showDetails && (
        <div style={statsGridStyle}>
          <ScoreCard
            label="Gesamtfragen"
            value={totalQuestions}
            icon="📝"
            size="md"
          />
          <ScoreCard
            label="Korrekte Antworten"
            value={accuracy.toFixed(1)}
            suffix="%"
            color={colors.green}
            icon="✓"
            size="md"
          />
          <ScoreCard
            label="Stereotype Antworten"
            value={stereotypeAnswers}
            color={colors.red}
            icon="⚠️"
            size="md"
          />
          <ScoreCard
            label="Testdauer"
            value={formatDuration(duration)}
            icon="⏱️"
            size="md"
          />
        </div>
      )}
    </div>
  )
}

export default ResultsSummary
