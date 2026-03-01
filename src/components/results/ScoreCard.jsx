import { colors, fontSizes, fontWeights, spacing, borderRadius } from '../../config/styleConstants'

/**
 * ScoreCard - Compact card for displaying a single metric
 *
 * Props:
 * - label: string
 * - value: string | number
 * - suffix: string (e.g., '%', 'm')
 * - color: string (default: gray[800])
 * - icon: string (emoji)
 * - trend: 'up' | 'down' | 'neutral'
 * - size: 'sm' | 'md' | 'lg'
 */
function ScoreCard({
  label,
  value,
  suffix = '',
  color = colors.gray[800],
  icon,
  trend,
  size = 'md',
}) {
  const sizes = {
    sm: {
      padding: spacing[4],
      labelSize: fontSizes.xs,
      valueSize: fontSizes.xl,
    },
    md: {
      padding: spacing[5],
      labelSize: fontSizes.sm,
      valueSize: fontSizes['2xl'],
    },
    lg: {
      padding: spacing[6],
      labelSize: fontSizes.md,
      valueSize: fontSizes['3xl'],
    },
  }

  const config = sizes[size] || sizes.md

  const cardStyle = {
    background: '#fff',
    borderRadius: borderRadius['2xl'],
    padding: config.padding,
    border: `1px solid ${colors.gray[200]}`,
  }

  const labelStyle = {
    fontSize: config.labelSize,
    color: colors.gray[500],
    marginBottom: spacing[2],
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  }

  const valueContainerStyle = {
    display: 'flex',
    alignItems: 'baseline',
    gap: spacing[1],
  }

  const valueStyle = {
    fontSize: config.valueSize,
    fontWeight: fontWeights.bold,
    color: color,
  }

  const suffixStyle = {
    fontSize: fontSizes.md,
    color: colors.gray[500],
    fontWeight: fontWeights.normal,
  }

  const trendStyle = {
    marginLeft: spacing[2],
    fontSize: fontSizes.sm,
    color: trend === 'up' ? colors.green : trend === 'down' ? colors.red : colors.gray[400],
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }

  return (
    <div style={cardStyle}>
      <div style={labelStyle}>
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div style={valueContainerStyle}>
        <span style={valueStyle}>{value}</span>
        {suffix && <span style={suffixStyle}>{suffix}</span>}
        {trend && <span style={trendStyle}>{trendIcons[trend]}</span>}
      </div>
    </div>
  )
}

export default ScoreCard
