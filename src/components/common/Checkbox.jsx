import { colors, fontSizes, fontWeights, spacing, borderRadius, baseStyles } from '../../config/styleConstants'

function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  description,
  color = colors.purple,
  style: customStyle = {},
}) {
  const containerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing[4],
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    ...customStyle,
  }

  const checkboxWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    minWidth: '20px',
    border: `2px solid ${checked ? color : colors.gray[300]}`,
    borderRadius: borderRadius.sm,
    background: checked ? color : '#fff',
    transition: baseStyles.transition,
  }

  const checkmarkStyle = {
    color: '#fff',
    fontSize: '12px',
    fontWeight: fontWeights.bold,
    opacity: checked ? 1 : 0,
  }

  const labelContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[1],
  }

  const labelStyle = {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal,
    color: colors.gray[800],
  }

  const descriptionStyle = {
    fontSize: fontSizes.sm,
    color: colors.gray[500],
  }

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  return (
    <div style={containerStyle} onClick={handleClick}>
      <div style={checkboxWrapperStyle}>
        <span style={checkmarkStyle}>✓</span>
      </div>
      <div style={labelContainerStyle}>
        {label && <span style={labelStyle}>{label}</span>}
        {description && <span style={descriptionStyle}>{description}</span>}
      </div>
    </div>
  )
}

export default Checkbox
