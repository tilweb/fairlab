import { colors, borderRadius, fontSizes, fontWeights, spacing } from '../../config/styleConstants'

function ProgressBar({
  value = 0,
  max = 100,
  color = colors.purple,
  showLabel = true,
  size = 'md',
  animated = false,
  style: customStyle = {},
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeValues = {
    sm: '6px',
    md: '10px',
    lg: '16px',
  }

  const containerStyle = {
    width: '100%',
    ...customStyle,
  }

  const trackStyle = {
    width: '100%',
    height: sizeValues[size],
    background: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  }

  const fillStyle = {
    height: '100%',
    width: `${percentage}%`,
    background: color,
    borderRadius: borderRadius.full,
    transition: 'width 0.3s ease',
    ...(animated && {
      backgroundImage: `linear-gradient(
        45deg,
        rgba(255,255,255,0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255,255,255,0.15) 50%,
        rgba(255,255,255,0.15) 75%,
        transparent 75%
      )`,
      backgroundSize: '1rem 1rem',
      animation: 'progressAnimation 1s linear infinite',
    }),
  }

  const labelStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
    fontSize: fontSizes.sm,
    color: colors.gray[600],
  }

  return (
    <div style={containerStyle}>
      <div style={trackStyle}>
        <div style={fillStyle} />
      </div>
      {showLabel && (
        <div style={labelStyle}>
          <span>{value} / {max}</span>
          <span style={{ fontWeight: fontWeights.semibold }}>{percentage.toFixed(0)}%</span>
        </div>
      )}
      {animated && (
        <style>{`
          @keyframes progressAnimation {
            from { background-position: 1rem 0; }
            to { background-position: 0 0; }
          }
        `}</style>
      )}
    </div>
  )
}

export default ProgressBar
