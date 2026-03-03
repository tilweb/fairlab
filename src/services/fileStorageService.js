// Lokaler Datei-Speicher Service für FairLab
// Speichert alle Daten als JSON-Dateien auf der Festplatte

const RESULTS_API = '/api/results'
const CONNECTIONS_API = '/api/connections'
const CONFIG_API = '/api/config'
const PREFERENCES_API = '/api/preferences'
const CUSTOM_QUESTIONS_API = '/api/custom-questions'

/**
 * Prüft Response auf Auth-Fehler
 */
function handleAuthError(response) {
  if (response.status === 401) {
    // Fehler werfen - Auth-Handling läuft über App.jsx
    throw new Error('Nicht authentifiziert')
  }
  return response
}

// === API-Verbindungen ===

/**
 * Lädt alle gespeicherten API-Verbindungen
 */
export async function loadConnections() {
  try {
    const response = handleAuthError(await fetch(CONNECTIONS_API))
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.error('Fehler beim Laden der Verbindungen:', error)
    return []
  }
}

/**
 * Speichert eine API-Verbindung
 */
export async function saveConnection(connection) {
  try {
    const response = await fetch(CONNECTIONS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(connection),
    })
    if (!response.ok) {
      let details = 'Fehler beim Speichern'
      try {
        const body = await response.json()
        if (body?.error) details = body.error
      } catch {
        // ignore response parse errors
      }
      throw new Error(details)
    }
    return await response.json()
  } catch (error) {
    console.error('Fehler beim Speichern der Verbindung:', error)
    throw error
  }
}

/**
 * Löscht eine API-Verbindung
 */
export async function deleteConnection(id) {
  try {
    const response = await fetch(`${CONNECTIONS_API}/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Fehler beim Löschen')
    return await response.json()
  } catch (error) {
    console.error('Fehler beim Löschen der Verbindung:', error)
    throw error
  }
}

// === API-Konfiguration ===

export async function loadApiConfig() {
  try {
    const response = handleAuthError(await fetch(CONFIG_API))
    if (!response.ok) throw new Error('Fehler beim Laden')
    return await response.json()
  } catch (error) {
    console.error('Fehler beim Laden der Konfiguration:', error)
    return {
      apiEndpoint: '',
      apiKey: '',
      modelName: 'gpt-4',
      selectedCategories: ['alter', 'geschlecht', 'behinderung', 'ethnie', 'religion', 'sexuelle-identitaet'],
      questionsPerCategory: 50,
      testSetId: 'german-hr',
      systemPrompt: ''
    }
  }
}

export async function saveApiConfig(config) {
  try {
    const response = await fetch(CONFIG_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    if (!response.ok) throw new Error('Fehler beim Speichern')
    return true
  } catch (error) {
    console.error('Fehler beim Speichern der Konfiguration:', error)
    return false
  }
}

// === Benutzereinstellungen ===

export async function loadPreferences() {
  try {
    const response = await fetch(PREFERENCES_API)
    if (!response.ok) throw new Error('Fehler beim Laden')
    return await response.json()
  } catch (error) {
    console.error('Fehler beim Laden der Einstellungen:', error)
    return { darkMode: false, language: 'de', showAdvancedStats: false }
  }
}

export async function savePreferences(preferences) {
  try {
    const response = await fetch(PREFERENCES_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    })
    if (!response.ok) throw new Error('Fehler beim Speichern')
    return true
  } catch (error) {
    console.error('Fehler beim Speichern der Einstellungen:', error)
    return false
  }
}

// === Benutzerdefinierte Fragen ===

export async function loadCustomQuestions() {
  try {
    const response = await fetch(CUSTOM_QUESTIONS_API)
    if (!response.ok) throw new Error('Fehler beim Laden')
    return await response.json()
  } catch (error) {
    console.error('Fehler beim Laden der Fragen:', error)
    return {}
  }
}

export async function saveCustomQuestions(questions) {
  try {
    const response = await fetch(CUSTOM_QUESTIONS_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questions),
    })
    if (!response.ok) throw new Error('Fehler beim Speichern')
    return true
  } catch (error) {
    console.error('Fehler beim Speichern der Fragen:', error)
    return false
  }
}

// === Testergebnisse ===

/**
 * Speichert ein Testergebnis als JSON-Datei
 */
export async function saveResultToFile(result) {
  try {
    const response = await fetch(RESULTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...result,
        savedAt: new Date().toISOString(),
        version: '1.0.0',
      }),
    })

    if (!response.ok) {
      throw new Error('Fehler beim Speichern der Datei')
    }

    return await response.json()
  } catch (error) {
    console.error('Fehler beim Speichern:', error)
    throw error
  }
}

/**
 * Lädt alle gespeicherten Ergebnisse (Metadaten)
 */
export async function loadResultsList() {
  try {
    const response = handleAuthError(await fetch(RESULTS_API))

    if (!response.ok) {
      throw new Error('Fehler beim Laden der Ergebnisliste')
    }

    return await response.json()
  } catch (error) {
    console.error('Fehler beim Laden der Liste:', error)
    return []
  }
}

/**
 * Lädt ein einzelnes Ergebnis
 */
export async function loadResultFromFile(id) {
  try {
    const response = await fetch(`${RESULTS_API}/${id}`)

    if (!response.ok) {
      throw new Error('Ergebnis nicht gefunden')
    }

    return await response.json()
  } catch (error) {
    console.error('Fehler beim Laden:', error)
    throw error
  }
}

/**
 * Löscht ein Ergebnis
 */
export async function deleteResultFile(id) {
  try {
    const response = await fetch(`${RESULTS_API}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Fehler beim Löschen')
    }

    return await response.json()
  } catch (error) {
    console.error('Fehler beim Löschen:', error)
    throw error
  }
}

export default {
  saveResultToFile,
  loadResultsList,
  loadResultFromFile,
  deleteResultFile,
}
