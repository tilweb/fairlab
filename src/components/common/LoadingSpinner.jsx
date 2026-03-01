import { colors, fontSizes } from '../../config/styleConstants'

function LoadingSpinner({
  size = 48,
  color = colors.purple,
  text = 'Laden...',
  showText = true,
}) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '40px',
  }

  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    border: `4px solid ${colors.gray[200]}`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }

  const textStyle = {
    color: colors.gray[500],
    fontSize: fontSizes.md,
  }

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle} />
      {showText && <span style={textStyle}>{text}</span>}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default LoadingSpinner
