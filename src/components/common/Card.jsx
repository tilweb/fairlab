import { colors, spacing, borderRadius, baseStyles } from '../../config/styleConstants'

function Card({
  children,
  selected = false,
  accentColor = colors.purple,
  onClick,
  padding = 'md',
  style: customStyle = {},
  ...props
}) {
  const paddingValues = {
    sm: spacing[5],
    md: spacing[8],
    lg: spacing[9],
  }

  const cardStyle = {
    background: selected ? `${accentColor}12` : '#fff',
    borderRadius: borderRadius['4xl'],
    padding: paddingValues[padding],
    border: selected ? `2px solid ${accentColor}` : `1px solid ${colors.gray[200]}`,
    cursor: onClick ? 'pointer' : 'default',
    transition: baseStyles.transition,
    ...customStyle,
  }

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
