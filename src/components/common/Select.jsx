import { colors, fontSizes, fontWeights, spacing, borderRadius, baseStyles } from '../../config/styleConstants'

function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Bitte wählen...',
  helpText,
  error,
  disabled = false,
  required = false,
  style: customStyle = {},
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

  const selectStyle = {
    width: '100%',
    padding: '10px 14px',
    fontSize: fontSizes.md,
    border: `1px solid ${error ? colors.red : colors.gray[200]}`,
    borderRadius: borderRadius.md,
    fontFamily: baseStyles.fontFamily,
    transition: baseStyles.transition,
    outline: 'none',
    background: disabled ? colors.gray[50] : '#fff',
    color: disabled ? colors.gray[400] : colors.gray[800],
    cursor: disabled ? 'not-allowed' : 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    backgroundSize: '20px',
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        style={selectStyle}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(helpText || error) && (
        <div style={helpTextStyle}>{error || helpText}</div>
      )}
    </div>
  )
}

export default Select
