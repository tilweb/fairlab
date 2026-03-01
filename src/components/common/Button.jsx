import { colors, fontSizes, fontWeights, spacing, borderRadius, baseStyles } from '../../config/styleConstants'

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  onClick,
  type = 'button',
  fullWidth = false,
  style: customStyle = {},
  ...props
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    fontFamily: baseStyles.fontFamily,
    fontWeight: fontWeights.semibold,
    borderRadius: borderRadius.md,
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: baseStyles.transition,
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
  }

  const sizeStyles = {
    sm: {
      padding: '8px 16px',
      fontSize: fontSizes.sm,
    },
    md: {
      padding: '10px 20px',
      fontSize: fontSizes.md,
    },
    lg: {
      padding: '14px 28px',
      fontSize: fontSizes.lg,
    },
  }

  const variantStyles = {
    primary: {
      background: colors.purple,
      color: '#fff',
    },
    secondary: {
      background: colors.gray[100],
      color: colors.gray[700],
      border: `1px solid ${colors.gray[200]}`,
    },
    danger: {
      background: colors.red,
      color: '#fff',
    },
    success: {
      background: colors.green,
      color: '#fff',
    },
    ghost: {
      background: 'transparent',
      color: colors.gray[600],
    },
    outline: {
      background: 'transparent',
      color: colors.purple,
      border: `2px solid ${colors.purple}`,
    },
  }

  const finalStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...customStyle,
  }

  const spinnerStyle = {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTopColor: variant === 'primary' || variant === 'danger' || variant === 'success' ? '#fff' : colors.gray[500],
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  }

  return (
    <>
      <button
        type={type}
        style={finalStyle}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {loading ? (
          <span style={spinnerStyle} />
        ) : icon ? (
          <span>{icon}</span>
        ) : null}
        {children}
      </button>
      {loading && (
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      )}
    </>
  )
}

export default Button
