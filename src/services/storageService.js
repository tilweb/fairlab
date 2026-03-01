// localStorage Persistenz Service für FairLab

const STORAGE_KEYS = {
  API_CONFIG: 'fairlab_api_config',
  API_CONNECTIONS: 'fairlab_api_connections',
  TEST_RESULTS: 'fairlab_test_results',
  CUSTOM_QUESTIONS: 'fairlab_custom_questions',
  USER_PREFERENCES: 'fairlab_preferences',
}

// Generische Speicher-Funktionen
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error(`Fehler beim Speichern von ${key}:`, error)
    return false
  }
}

const loadFromStorage = (key, defaultValue = null) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.error(`Fehler beim Laden von ${key}:`, error)
    return defaultValue
  }
}

const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Fehler beim Löschen von ${key}:`, error)
    return false
  }
}

// API-Konfiguration
export const saveApiConfig = (config) => {
  return saveToStorage(STORAGE_KEYS.API_CONFIG, {
    ...config,
    savedAt: new Date().toISOString(),
  })
}

export const loadApiConfig = () => {
  return loadFromStorage(STORAGE_KEYS.API_CONFIG, {
    apiEndpoint: '',
    apiKey: '',
    modelName: 'gpt-4',
    selectedCategories: ['alter', 'geschlecht', 'behinderung', 'ethnie', 'religion', 'sexuelle-identitaet'],
    questionsPerCategory: 50,
  })
}

export const clearApiConfig = () => {
  return removeFromStorage(STORAGE_KEYS.API_CONFIG)
}

// Gespeicherte API-Verbindungen
export const saveApiConnection = (connection) => {
  const connections = loadApiConnections()
  const newConnection = {
    ...connection,
    id: connection.id || `conn_${Date.now()}`,
    createdAt: connection.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Prüfen ob bereits eine Verbindung mit dieser ID existiert
  const existingIndex = connections.findIndex(c => c.id === newConnection.id)
  if (existingIndex >= 0) {
    connections[existingIndex] = newConnection
  } else {
    connections.unshift(newConnection)
  }

  return saveToStorage(STORAGE_KEYS.API_CONNECTIONS, connections) ? newConnection : null
}

export const loadApiConnections = () => {
  return loadFromStorage(STORAGE_KEYS.API_CONNECTIONS, [])
}

export const loadApiConnectionById = (id) => {
  const connections = loadApiConnections()
  return connections.find(c => c.id === id) || null
}

export const deleteApiConnection = (id) => {
  const connections = loadApiConnections()
  const filtered = connections.filter(c => c.id !== id)
  return saveToStorage(STORAGE_KEYS.API_CONNECTIONS, filtered)
}

export const updateApiConnection = (id, updates) => {
  const connections = loadApiConnections()
  const index = connections.findIndex(c => c.id === id)
  if (index >= 0) {
    connections[index] = {
      ...connections[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return saveToStorage(STORAGE_KEYS.API_CONNECTIONS, connections)
  }
  return false
}

// Test-Ergebnisse
export const saveTestResult = (result) => {
  const results = loadTestResults()
  const newResult = {
    ...result,
    id: result.id || `test_${Date.now()}`,
    createdAt: result.createdAt || new Date().toISOString(),
  }
  results.unshift(newResult) // Neuestes zuerst
  return saveToStorage(STORAGE_KEYS.TEST_RESULTS, results)
}

export const loadTestResults = () => {
  return loadFromStorage(STORAGE_KEYS.TEST_RESULTS, [])
}

export const loadTestResultById = (id) => {
  const results = loadTestResults()
  return results.find(r => r.id === id) || null
}

export const deleteTestResult = (id) => {
  const results = loadTestResults()
  const filtered = results.filter(r => r.id !== id)
  return saveToStorage(STORAGE_KEYS.TEST_RESULTS, filtered)
}

export const clearAllTestResults = () => {
  return removeFromStorage(STORAGE_KEYS.TEST_RESULTS)
}

// Benutzerdefinierte Fragen
export const saveCustomQuestions = (questions) => {
  return saveToStorage(STORAGE_KEYS.CUSTOM_QUESTIONS, questions)
}

export const loadCustomQuestions = () => {
  return loadFromStorage(STORAGE_KEYS.CUSTOM_QUESTIONS, {})
}

export const saveCustomQuestionsByCategory = (category, questions) => {
  const allCustom = loadCustomQuestions()
  allCustom[category] = questions
  return saveToStorage(STORAGE_KEYS.CUSTOM_QUESTIONS, allCustom)
}

export const loadCustomQuestionsByCategory = (category) => {
  const allCustom = loadCustomQuestions()
  return allCustom[category] || []
}

// Benutzer-Einstellungen
export const savePreferences = (preferences) => {
  return saveToStorage(STORAGE_KEYS.USER_PREFERENCES, preferences)
}

export const loadPreferences = () => {
  return loadFromStorage(STORAGE_KEYS.USER_PREFERENCES, {
    darkMode: false,
    language: 'de',
    showAdvancedStats: false,
  })
}

// Export für Backup
export const exportAllData = () => {
  return {
    apiConfig: loadApiConfig(),
    testResults: loadTestResults(),
    customQuestions: loadCustomQuestions(),
    preferences: loadPreferences(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  }
}

// Import für Restore
export const importAllData = (data) => {
  try {
    if (data.apiConfig) saveToStorage(STORAGE_KEYS.API_CONFIG, data.apiConfig)
    if (data.testResults) saveToStorage(STORAGE_KEYS.TEST_RESULTS, data.testResults)
    if (data.customQuestions) saveToStorage(STORAGE_KEYS.CUSTOM_QUESTIONS, data.customQuestions)
    if (data.preferences) saveToStorage(STORAGE_KEYS.USER_PREFERENCES, data.preferences)
    return true
  } catch (error) {
    console.error('Fehler beim Import:', error)
    return false
  }
}

// JSON-Datei Download
export const downloadResultAsJson = (result, filename = null) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const modelName = (result.config?.modelName || 'unknown').replace(/[^a-zA-Z0-9-]/g, '_')
  const defaultFilename = `fairlab_${modelName}_${timestamp}.json`

  const data = {
    ...result,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename || defaultFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return defaultFilename
}

// Storage-Status prüfen
export const getStorageStatus = () => {
  const results = loadTestResults()
  const config = loadApiConfig()
  return {
    hasApiConfig: !!(config.apiEndpoint && config.apiKey),
    testResultsCount: results.length,
    lastTestDate: results[0]?.createdAt || null,
  }
}

export default {
  saveApiConfig,
  loadApiConfig,
  clearApiConfig,
  saveApiConnection,
  loadApiConnections,
  loadApiConnectionById,
  deleteApiConnection,
  updateApiConnection,
  saveTestResult,
  loadTestResults,
  loadTestResultById,
  deleteTestResult,
  clearAllTestResults,
  saveCustomQuestions,
  loadCustomQuestions,
  saveCustomQuestionsByCategory,
  loadCustomQuestionsByCategory,
  savePreferences,
  loadPreferences,
  exportAllData,
  importAllData,
  downloadResultAsJson,
  getStorageStatus,
}
