import { colors, fontSizes, fontWeights, spacing, borderRadius, getBiasScoreColor } from '../../config/styleConstants'
import { getCategoryById } from '../../config/categories'
import { interpretBiasScore } from '../../services/biasCalculator'

/**
 * CategoryHeatmap - Visual grid showing bias scores by category
 *
 * Props:
 * - categories: Array of [categoryId, scores] tuples from analysis.sortedCategories
 * - showLabels: boolean (default: true)
 * - showBars: boolean (default: true)
 * - compact: boolean (default: false)
 * - onCategoryClick: (categoryId) => void
 */
function CategoryHeatmap({
  categories = [],
  showLabels = true,
  showBars = true,
  compact = false,
  onCategoryClick,
}) {
  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: compact ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
    gap: spacing[compact ? 3 : 5],
  }

  const getCategoryCardStyle = (score) => ({
    background: '#fff',
    borderRadius: borderRadius[compact ? 'xl' : '2xl'],
    padding: spacing[compact ? 4 : 6],
    border: `2px solid ${getBiasScoreColor(score)}`,
    cursor: onCategoryClick ? 'pointer' : 'default',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  })

  const categoryHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: compact ? spacing[2] : spacing[4],
  }

  const categoryIconStyle = (color) => ({
    width: compact ? '32px' : '40px',
    height: compact ? '32px' : '40px',
    borderRadius: borderRadius.lg,
    background: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: compact ? '16px' : '20px',
  })

  const categoryNameStyle = {
    fontWeight: fontWeights.semibold,
    color: colors.gray[800],
    fontSize: compact ? fontSizes.sm : fontSizes.md,
  }

  const categoryMetaStyle = {
    fontSize: fontSizes.xs,
    color: colors.gray[500],
  }

  const scoreRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: showBars ? spacing[3] : 0,
  }

  const scoreLabelStyle = {
    fontSize: fontSizes.sm,
    color: colors.gray[600],
  }

  const scoreValueStyle = (score) => ({
    fontSize: compact ? fontSizes.lg : fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: interpretBiasScore(score).color,
  })

  const barContainerStyle = {
    height: '8px',
    background: colors.gray[100],
    borderRadius: '4px',
    position: 'relative',
    overflow: 'hidden',
  }

  const barCenterLineStyle = {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: '2px',
    background: colors.gray[300],
    transform: 'translateX(-50%)',
  }

  const barFillStyle = (score) => {
    const width = Math.min(Math.abs(score), 100)
    const isPositive = score >= 0
    return {
      position: 'absolute',
      height: '100%',
      width: `${width / 2}%`,
      background: interpretBiasScore(score).color,
      left: isPositive ? '50%' : `${50 - width / 2}%`,
      borderRadius: '4px',
      transition: 'width 0.3s ease, left 0.3s ease',
    }
  }

  const accuracyStyle = {
    marginTop: spacing[3],
    fontSize: fontSizes.xs,
    color: colors.gray[500],
  }

  if (categories.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: colors.gray[500], padding: spacing[8] }}>
        Keine Kategorie-Daten verfügbar
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {categories.map(([categoryId, scores]) => {
        const cat = getCategoryById(categoryId)
        const catScore = scores.overall?.adjustedScore || 0

        return (
          <div
            key={categoryId}
            style={getCategoryCardStyle(catScore)}
            onClick={() => onCategoryClick?.(categoryId)}
            onMouseEnter={(e) => {
              if (onCategoryClick) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (onCategoryClick) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            {/* Category Header */}
            <div style={categoryHeaderStyle}>
              <div style={categoryIconStyle(cat?.color || colors.gray[300])}>
                {cat?.icon || '?'}
              </div>
              <div>
                <div style={categoryNameStyle}>
                  {cat?.name || categoryId}
                </div>
                {showLabels && (
                  <div style={categoryMetaStyle}>
                    {scores.overall?.sampleSize || 0} Fragen
                  </div>
                )}
              </div>
            </div>

            {/* Score */}
            <div style={scoreRowStyle}>
              <span style={scoreLabelStyle}>Bias-Score</span>
              <span style={scoreValueStyle(catScore)}>
                {catScore > 0 ? '+' : ''}{catScore.toFixed(1)}%
              </span>
            </div>

            {/* Progress Bar */}
            {showBars && (
              <div style={barContainerStyle}>
                <div style={barCenterLineStyle} />
                <div style={barFillStyle(catScore)} />
              </div>
            )}

            {/* Accuracy */}
            {showLabels && (
              <div style={accuracyStyle}>
                Genauigkeit: {(scores.ambiguous?.accuracy || 0).toFixed(1)}%
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CategoryHeatmap
