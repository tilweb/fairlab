// Authentifizierungs-Service für FairLab

/**
 * Prüft den Auth-Status beim Server
 * Gibt zurück ob Auth aktiviert ist und ob der User authentifiziert ist
 */
export async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/status')
    if (!response.ok) {
      throw new Error('Auth-Status konnte nicht abgerufen werden')
    }
    return await response.json()
  } catch (error) {
    console.error('Auth-Status Fehler:', error)
    // Im Fehlerfall: Annehmen dass Auth nicht aktiviert ist
    return { authEnabled: false, authenticated: true }
  }
}

/**
 * Login mit Passwort
 */
export async function login(password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Login fehlgeschlagen',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Login Fehler:', error)
    return {
      success: false,
      error: 'Verbindungsfehler beim Login',
    }
  }
}

/**
 * Logout
 */
export async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
    })
    return { success: true }
  } catch (error) {
    console.error('Logout Fehler:', error)
    return { success: false }
  }
}

export default {
  checkAuthStatus,
  login,
  logout,
}
