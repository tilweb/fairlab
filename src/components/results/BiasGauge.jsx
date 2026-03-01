import { colors, fontSizes, fontWeights, spacing, borderRadius } from '../../config/styleConstants'
import { interpretBiasScore } from '../../services/biasCalculator'
import { uiStrings } from '../../config/uiStrings'
import { Badge, InfoBox } from '../common'

/**
 * BiasGauge - Visual representation of a bias score
 *
 * Props:
 * - score: number (-100 to +100)
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - showLabel: boolean (default: true)
 * - showDescription: boolean (default: false)
 * - animated: boolean (default: false)
 */
function BiasGauge({
  score = 0,
  size = 'md',
  showLabel = true,
  showDescription = false,
  animated = false
}) {
  const interpretation = interpretBiasScore(score)

  // Size configurations
  const sizes = {
    sm: {
      gaugeHeight: 8,
      markerSize: 16,
      fontSize: fontSizes.sm,
      scoreSize: fontSizes.lg,
    },
    md: {
      gaugeHeight: 16,
      markerSize: 32,
      fontSize: fontSizes.md,
      scoreSize: fontSizes['3xl'],
    },
    lg: {
      gaugeHeight: 24,
      markerSize: 40,
      fontSize: fontSizes.lg,
      scoreSize: fontSizes['5xl'],
    },
  }

  const config = sizes[size] || sizes.md

  // Calculate marker position (0-100%)
  const markerPosition = ((score + 100) / 200) * 100

  const containerStyle = {
    width: '100%',
  }

  const scoreDisplayStyle = {
    textAlign: 'center',
    marginBottom: spacing[4],
  }

  const scoreValueStyle = {
    fontSize: config.scoreSize,
    fontWeight: fontWeights.bold,
    color: interpretation.color,
    transition: animated ? 'color 0.3s ease' : undefined,
  }

  const gaugeTrackStyle = {
    position: 'relative',
    width: '100%',
    height: `${config.gaugeHeight}px`,
    background: `linear-gradient(to right,
      ${colors.blue} 0%,
      ${colors.gray[200]} 50%,
      ${colors.red} 100%
    )`,
    borderRadius: `${config.gaugeHeight / 2}px`,
    marginBottom: spacing[3],
  }

  const gaugeMarkerStyle = {
    position: 'absolute',
    top: '50%',
    left: `calc(${markerPosition}% - ${config.markerSize / 2}px)`,
    transform: 'translateY(-50%)',
    width: `${config.markerSize}px`,
    height: `${config.markerSize}px`,
    background: '#fff',
    border: `3px solid ${interpretation.color}`,
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size === 'lg' ? fontSizes.sm : fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: interpretation.color,
    transition: animated ? 'left 0.5s ease, border-color 0.3s ease' : undefined,
  }

  const labelsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: fontSizes.xs,
    color: colors.gray[500],
  }

  const centerLineStyle = {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: '2px',
    background: 'rgba(255,255,255,0.5)',
    transform: 'translateX(-50%)',
  }

  return (
    <div style={containerStyle}>
      {/* Score Display */}
      <div style={scoreDisplayStyle}>
        <div style={scoreValueStyle}>
          {score > 0 ? '+' : ''}{score.toFixed(1)}%
        </div>
        {showLabel && (
          <Badge
            type={
              Math.abs(score) < 5 ? 'success' :
              Math.abs(score) < 15 ? 'warning' : 'error'
            }
            size={size === 'sm' ? 'sm' : 'md'}
            style={{ marginTop: spacing[2] }}
          >
            {interpretation.label}
          </Badge>
        )}
      </div>

      {/* Gauge Track */}
      <div style={gaugeTrackStyle}>
        <div style={centerLineStyle} />
        <div style={gaugeMarkerStyle}>
          {size !== 'sm' && (score > 0 ? '+' : '') + Math.round(score)}
        </div>
      </div>

      {/* Labels */}
      <div style={labelsStyle}>
        <span>{uiStrings.bias.scale.minLabel}</span>
        <span style={{ color: colors.gray[400] }}>0%</span>
        <span>{uiStrings.bias.scale.maxLabel}</span>
      </div>

      {/* Description */}
      {showDescription && (
        <InfoBox
          type={Math.abs(score) < 5 ? 'success' : Math.abs(score) < 15 ? 'warning' : 'error'}
          style={{ marginTop: spacing[5] }}
        >
          {interpretation.description}
        </InfoBox>
      )}
    </div>
  )
}

export default BiasGauge
