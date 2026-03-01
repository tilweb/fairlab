// Production Server für FairLab
// Express-basiert mit allen API-Endpoints

import express from 'express'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// === Verzeichnisse ===
const RESULTS_DIR = path.resolve(process.cwd(), 'results')
const CONFIG_DIR = path.resolve(process.cwd(), 'config')
const DATA_DIR = path.resolve(process.cwd(), 'data/custom')

const CONNECTIONS_FILE = path.join(CONFIG_DIR, 'api-connections.json')
const API_CONFIG_FILE = path.join(CONFIG_DIR, 'api-config.json')
const PREFERENCES_FILE = path.join(CONFIG_DIR, 'preferences.json')
const CUSTOM_QUESTIONS_FILE = path.join(DATA_DIR, 'custom-questions.json')

// Stelle sicher, dass die Verzeichnisse existieren
for (const dir of [RESULTS_DIR, CONFIG_DIR, DATA_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Initialisiere Dateien falls nicht vorhanden
const defaultFiles = {
  [CONNECTIONS_FILE]: '[]',
  [API_CONFIG_FILE]: JSON.stringify({
    apiEndpoint: '',
    apiKey: '',
    modelName: 'gpt-4',
    selectedCategories: ['alter', 'geschlecht', 'behinderung', 'ethnie', 'religion', 'sexuelle-identitaet'],
    questionsPerCategory: 50,
    testSetId: 'german-hr',
    systemPrompt: ''
  }, null, 2),
  [PREFERENCES_FILE]: JSON.stringify({ darkMode: false, language: 'de', showAdvancedStats: false }, null, 2),
  [CUSTOM_QUESTIONS_FILE]: '{}'
}

for (const [file, defaultContent] of Object.entries(defaultFiles)) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, defaultContent)
  }
}

// === Authentifizierung ===
const AUTH_PASSWORD = process.env.FAIRLAB_PASSWORD || null
const AUTH_ENABLED = !!AUTH_PASSWORD
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 Stunden

const sessions = new Map()

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex')
}

function createSession() {
  const token = generateSessionToken()
  sessions.set(token, {
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  })
  return token
}

function isValidSession(token) {
  if (!AUTH_ENABLED) return true
  if (!token) return false
  const session = sessions.get(token)
  if (!session) return false
  if (Date.now() > session.expiresAt) {
    sessions.delete(token)
    return false
  }
  return true
}

function getSessionFromRequest(req) {
  const cookieHeader = req.headers.cookie || ''
  const match = cookieHeader.match(/fairlab_session=([^;]+)/)
  return match ? match[1] : null
}

// Cleanup abgelaufener Sessions alle 10 Minuten
setInterval(() => {
  const now = Date.now()
  for (const [token, session] of sessions) {
    if (now > session.expiresAt) {
      sessions.delete(token)
    }
  }
}, 10 * 60 * 1000)

// Erlaubte Proxy-Domains
const ALLOWED_PROXY_DOMAINS = [
  'api.openai.com',
  'api.anthropic.com',
  'api.mistral.ai',
  'api.together.xyz',
  'api.groq.com',
  'openrouter.ai',
  'api.deepseek.com',
  'generativelanguage.googleapis.com',
]

function isAllowedProxyDomain(url) {
  try {
    const parsed = new URL(url)
    return ALLOWED_PROXY_DOMAINS.some(domain =>
      parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    )
  } catch {
    return false
  }
}

// === Middleware ===
app.use(express.json({ limit: '50mb' }))

// Auth-Check Middleware (für alle /api/* außer /api/auth/*)
const authMiddleware = (req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    return next()
  }

  const token = getSessionFromRequest(req)
  if (!isValidSession(token)) {
    return res.status(401).json({ error: 'Nicht authentifiziert', authRequired: true })
  }
  next()
}

// === Auth Endpoints ===

app.get('/api/auth/status', (req, res) => {
  const token = getSessionFromRequest(req)
  res.json({
    authEnabled: AUTH_ENABLED,
    authenticated: isValidSession(token),
  })
})

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body

  if (!AUTH_ENABLED) {
    return res.json({ success: true, message: 'Auth nicht aktiviert' })
  }

  if (password === AUTH_PASSWORD) {
    const token = createSession()
    res.setHeader('Set-Cookie', `fairlab_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DURATION / 1000}`)
    res.json({ success: true })
  } else {
    res.status(401).json({ success: false, error: 'Falsches Passwort' })
  }
})

app.post('/api/auth/logout', (req, res) => {
  const token = getSessionFromRequest(req)
  if (token) {
    sessions.delete(token)
  }
  res.setHeader('Set-Cookie', 'fairlab_session=; Path=/; HttpOnly; Max-Age=0')
  res.json({ success: true })
})

// Auth-Middleware für alle anderen API-Endpoints
app.use('/api', authMiddleware)

// === Proxy Endpoint ===

app.all('/api-proxy', async (req, res) => {
  // Session-Check
  const token = getSessionFromRequest(req)
  if (!isValidSession(token)) {
    return res.status(401).json({ error: 'Nicht authentifiziert' })
  }

  const targetUrl = req.headers['x-target-url']

  if (!targetUrl) {
    return res.status(400).json({ error: 'X-Target-URL header is required' })
  }

  // Domain-Whitelist prüfen
  if (!isAllowedProxyDomain(targetUrl)) {
    return res.status(403).json({
      error: 'Domain nicht erlaubt',
      allowedDomains: ALLOWED_PROXY_DOMAINS,
    })
  }

  try {
    const url = new URL(targetUrl)

    // Proxy-Headers vorbereiten
    const proxyHeaders = { ...req.headers }
    delete proxyHeaders['host']
    delete proxyHeaders['x-target-url']
    delete proxyHeaders['cookie']
    delete proxyHeaders['content-length']
    proxyHeaders['host'] = url.host
    proxyHeaders['origin'] = url.origin

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: proxyHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    })

    // Response-Headers kopieren
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value)
      }
    })

    const responseBody = await response.text()
    res.status(response.status).send(responseBody)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: error.message })
  }
})

// === Config Endpoints ===

app.get('/api/config', (req, res) => {
  try {
    const content = fs.readFileSync(API_CONFIG_FILE, 'utf-8')
    res.json(JSON.parse(content))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/config', (req, res) => {
  try {
    fs.writeFileSync(API_CONFIG_FILE, JSON.stringify(req.body, null, 2))
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/preferences', (req, res) => {
  try {
    const content = fs.readFileSync(PREFERENCES_FILE, 'utf-8')
    res.json(JSON.parse(content))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/preferences', (req, res) => {
  try {
    fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(req.body, null, 2))
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/custom-questions', (req, res) => {
  try {
    const content = fs.readFileSync(CUSTOM_QUESTIONS_FILE, 'utf-8')
    res.json(JSON.parse(content))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/custom-questions', (req, res) => {
  try {
    fs.writeFileSync(CUSTOM_QUESTIONS_FILE, JSON.stringify(req.body, null, 2))
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// === Connections Endpoints ===

app.get('/api/connections', (req, res) => {
  try {
    const connections = JSON.parse(fs.readFileSync(CONNECTIONS_FILE, 'utf-8'))
    res.json(connections)
  } catch (error) {
    res.json([])
  }
})

app.post('/api/connections', (req, res) => {
  try {
    const newConnection = req.body
    const connections = JSON.parse(fs.readFileSync(CONNECTIONS_FILE, 'utf-8'))

    newConnection.id = newConnection.id || `conn_${Date.now()}`
    newConnection.createdAt = newConnection.createdAt || new Date().toISOString()
    newConnection.updatedAt = new Date().toISOString()

    const existingIndex = connections.findIndex(c => c.id === newConnection.id)
    if (existingIndex >= 0) {
      connections[existingIndex] = newConnection
    } else {
      connections.unshift(newConnection)
    }

    fs.writeFileSync(CONNECTIONS_FILE, JSON.stringify(connections, null, 2))
    res.json(newConnection)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/connections/:id', (req, res) => {
  try {
    const connections = JSON.parse(fs.readFileSync(CONNECTIONS_FILE, 'utf-8'))
    const filtered = connections.filter(c => c.id !== req.params.id)
    fs.writeFileSync(CONNECTIONS_FILE, JSON.stringify(filtered, null, 2))
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// === Results Endpoints ===

app.get('/api/results', (req, res) => {
  try {
    const files = fs.readdirSync(RESULTS_DIR)
      .filter(f => f.endsWith('.json'))
      .map(filename => {
        const filepath = path.join(RESULTS_DIR, filename)
        const stats = fs.statSync(filepath)
        const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
        return {
          id: filename.replace('.json', ''),
          filename,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          modelName: content.config?.modelName || 'Unbekannt',
          biasScore: content.analysis?.summary?.overallBiasScore,
          categories: content.config?.categories || [],
          systemPrompt: content.config?.systemPrompt || '',
        }
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    res.json(files)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/results', (req, res) => {
  try {
    const data = req.body
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const modelName = (data.config?.modelName || 'unknown').replace(/[^a-zA-Z0-9-]/g, '_')
    const filename = `fairlab_${modelName}_${timestamp}.json`
    const filepath = path.join(RESULTS_DIR, filename)

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2))

    res.json({ success: true, filename, id: filename.replace('.json', '') })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/results/:id', (req, res) => {
  try {
    const filepath = path.join(RESULTS_DIR, `${req.params.id}.json`)
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Ergebnis nicht gefunden' })
    }

    const content = fs.readFileSync(filepath, 'utf-8')
    res.json(JSON.parse(content))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/results/:id', (req, res) => {
  try {
    const filepath = path.join(RESULTS_DIR, `${req.params.id}.json`)
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Ergebnis nicht gefunden' })
    }

    fs.unlinkSync(filepath)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// === Statische Dateien (Frontend) ===
const distPath = path.join(__dirname, 'dist')

// Statische Assets (JS, CSS, Images) direkt servieren
app.use(express.static(distPath, {
  index: false, // index.html nicht automatisch servieren
}))

// HTML mit eingebettetem Auth-Status servieren
// Das vermeidet Flackern weil React sofort den Auth-Status kennt
let indexHtmlCache = null

function getIndexHtml(req) {
  // HTML nur einmal lesen und cachen
  if (!indexHtmlCache) {
    indexHtmlCache = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8')
  }

  const token = getSessionFromRequest(req)
  const authStatus = {
    authEnabled: AUTH_ENABLED,
    authenticated: isValidSession(token),
  }

  // Auth-Status als globale Variable einbetten
  const authScript = `<script>window.__FAIRLAB_AUTH__=${JSON.stringify(authStatus)}</script>`

  // Script vor </head> einfügen
  return indexHtmlCache.replace('</head>', `${authScript}</head>`)
}

// SPA Fallback - alle anderen Routen zum Frontend
app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.send(getIndexHtml(req))
})

// === Server starten ===
app.listen(PORT, () => {
  console.log(`FairLab Server läuft auf Port ${PORT}`)
  console.log(`Auth: ${AUTH_ENABLED ? 'AKTIVIERT' : 'deaktiviert'}`)
  if (!AUTH_ENABLED) {
    console.log('Hinweis: Setze FAIRLAB_PASSWORD für Passwortschutz')
  }
})
