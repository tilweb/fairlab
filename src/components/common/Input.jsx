import { colors, fontSizes, fontWeights, spacing, borderRadius, baseStyles } from '../../config/styleConstants'

function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  helpText,
  error,
  disabled = false,
  required = false,
  icon,
  style: customStyle = {},
  inputStyle: customInputStyle = {},
  ...props
}) {
  const containerStyle = {
    marginBottom: spacing[6],
    ...customStyle,
  }

  const labelStyle = {
    display: 'block',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.gray[700],
    marginBottom: spacing[2],
  }

  const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  }

  const inputBaseStyle = {
    width: '100%',
    padding: icon ? '10px 14px 10px 40px' : '10px 14px',
    fontSize: fontSizes.md,
    border: `1px solid ${error ? colors.red : colors.gray[200]}`,
    borderRadius: borderRadius.md,
    fontFamily: baseStyles.fontFamily,
    transition: baseStyles.transition,
    outline: 'none',
    background: disabled ? colors.gray[50] : '#fff',
    color: disabled ? colors.gray[400] : colors.gray[800],
    ...customInputStyle,
  }

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    fontSize: fontSizes.lg,
    color: colors.gray[400],
  }

  const helpTextStyle = {
    fontSize: fontSizes.sm,
    color: error ? colors.red : colors.gray[500],
    marginTop: spacing[2],
  }

  return (
    <div style={containerStyle}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: colors.red }}> *</span>}
        </label>
      )}
      <div style={inputWrapperStyle}>
        {icon && <span style={iconStyle}>{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={inputBaseStyle}
          {...props}
        />
      </div>
      {(helpText || error) && (
        <div style={helpTextStyle}>{error || helpText}</div>
      )}
    </div>
  )
}

export default Input
