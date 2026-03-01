import { useState } from 'react'
import { colors, fontSizes, fontWeights, spacing, borderRadius, baseStyles } from '../../config/styleConstants'
import { login } from '../../services/authService'

function LoginPage({ onLoginSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(password)

    if (result.success) {
      onLoginSuccess()
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${colors.gray[50]} 0%, ${colors.gray[100]} 100%)`,
    fontFamily: baseStyles.fontFamily,
  }

  const cardStyle = {
    background: '#fff',
    borderRadius: borderRadius['3xl'],
    padding: spacing[10],
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
  }

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    marginBottom: spacing[8],
  }

  const logoIconStyle = {
    width: '48px',
    height: '48px',
    background: `linear-gradient(135deg, ${colors.purple}, ${colors.indigo})`,
    borderRadius: borderRadius.xl,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  }

  const titleStyle = {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    color: colors.gray[900],
  }

  const subtitleStyle = {
    textAlign: 'center',
    color: colors.gray[600],
    fontSize: fontSizes.md,
    marginBottom: spacing[8],
  }

  const inputStyle = {
    width: '100%',
    padding: `${spacing[4]} ${spacing[5]}`,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.gray[300]}`,
    fontSize: fontSizes.md,
    outline: 'none',
    transition: baseStyles.transition,
    boxSizing: 'border-box',
  }

  const buttonStyle = {
    width: '100%',
    padding: `${spacing[4]} ${spacing[5]}`,
    borderRadius: borderRadius.lg,
    border: 'none',
    background: `linear-gradient(135deg, ${colors.purple}, ${colors.indigo})`,
    color: '#fff',
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: baseStyles.transition,
  }

  const errorStyle = {
    background: colors.status.error.bg,
    color: colors.status.error.text,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[5],
    fontSize: fontSizes.sm,
    textAlign: 'center',
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={logoStyle}>
          <div style={logoIconStyle}>
            <span role="img" aria-label="FairLab">&#9878;</span>
          </div>
          <span style={titleStyle}>FairLab</span>
        </div>

        <p style={subtitleStyle}>
          Bitte geben Sie das Passwort ein, um fortzufahren.
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: spacing[5] }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              style={inputStyle}
              autoFocus
              disabled={loading}
            />
          </div>

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Wird geprüft...' : 'Anmelden'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          color: colors.gray[400],
          fontSize: fontSizes.xs,
          marginTop: spacing[8],
        }}>
          KI-Bias-Testing für HR
        </p>
      </div>
    </div>
  )
}

export default LoginPage
