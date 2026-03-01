import { colors, fontSizes, spacing, borderRadius } from '../../config/styleConstants'

function InfoBox({
  children,
  type = 'info',
  title,
  icon,
  style: customStyle = {},
}) {
  const typeStyles = {
    success: {
      background: colors.status.success.bg,
      border: `1px solid ${colors.status.success.border}`,
      iconColor: colors.status.success.text,
    },
    warning: {
      background: colors.status.warning.bg,
      border: `1px solid ${colors.status.warning.border}`,
      iconColor: colors.status.warning.text,
    },
    error: {
      background: colors.status.error.bg,
      border: `1px solid ${colors.status.error.border}`,
      iconColor: colors.status.error.text,
    },
    info: {
      background: colors.status.info.bg,
      border: `1px solid ${colors.status.info.border}`,
      iconColor: colors.status.info.text,
    },
  }

  const defaultIcons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
  }

  const boxStyle = {
    padding: `${spacing[6]} ${spacing[7]}`,
    borderRadius: borderRadius['2xl'],
    background: typeStyles[type].background,
    border: typeStyles[type].border,
    ...customStyle,
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: title ? spacing[3] : 0,
  }

  const iconStyle = {
    fontSize: fontSizes.lg,
  }

  const titleStyle = {
    fontSize: fontSizes.md,
    fontWeight: 600,
    color: typeStyles[type].iconColor,
  }

  const contentStyle = {
    fontSize: fontSizes.md,
    color: colors.gray[700],
    lineHeight: 1.5,
  }

  return (
    <div style={boxStyle}>
      {(icon || title) && (
        <div style={headerStyle}>
          <span style={iconStyle}>{icon || defaultIcons[type]}</span>
          {title && <span style={titleStyle}>{title}</span>}
        </div>
      )}
      <div style={contentStyle}>{children}</div>
    </div>
  )
}

export default InfoBox
