import { colors, fontSizes, fontWeights, borderRadius } from '../../config/styleConstants'

function Badge({
  children,
  type = 'info',
  size = 'md',
  style: customStyle = {},
}) {
  const typeStyles = {
    success: {
      background: colors.status.success.bg,
      color: colors.status.success.text,
    },
    warning: {
      background: colors.status.warning.bg,
      color: colors.status.warning.text,
    },
    error: {
      background: colors.status.error.bg,
      color: colors.status.error.text,
    },
    info: {
      background: colors.status.info.bg,
      color: colors.status.info.text,
    },
    neutral: {
      background: colors.gray[100],
      color: colors.gray[600],
    },
  }

  const sizeStyles = {
    sm: {
      padding: '2px 6px',
      fontSize: fontSizes.xs,
    },
    md: {
      padding: '4px 10px',
      fontSize: fontSizes.xs,
    },
    lg: {
      padding: '6px 12px',
      fontSize: fontSizes.sm,
    },
  }

  const badgeStyle = {
    display: 'inline-block',
    borderRadius: borderRadius.md,
    fontWeight: fontWeights.semibold,
    ...typeStyles[type],
    ...sizeStyles[size],
    ...customStyle,
  }

  return <span style={badgeStyle}>{children}</span>
}

export default Badge
