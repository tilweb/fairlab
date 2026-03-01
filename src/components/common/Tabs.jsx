import { colors, fontSizes, fontWeights, spacing, baseStyles } from '../../config/styleConstants'

function Tabs({
  tabs,
  activeTab,
  onChange,
  style: customStyle = {},
}) {
  const containerStyle = {
    display: 'flex',
    gap: spacing[1],
    borderBottom: `1px solid ${colors.gray[200]}`,
    marginBottom: spacing[9],
    ...customStyle,
  }

  const tabButtonStyle = (isActive) => ({
    padding: '12px 20px',
    background: isActive ? '#fff' : 'transparent',
    border: 'none',
    borderBottom: isActive ? `3px solid ${colors.purple}` : '3px solid transparent',
    fontSize: fontSizes.md,
    fontWeight: isActive ? fontWeights.semibold : 500,
    color: isActive ? colors.purple : colors.gray[500],
    cursor: 'pointer',
    transition: baseStyles.transition,
    fontFamily: baseStyles.fontFamily,
  })

  return (
    <div style={containerStyle}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          style={tabButtonStyle(activeTab === tab.id)}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span style={{ marginRight: spacing[2] }}>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default Tabs
