import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// Verzeichnisse für persistente Daten
const RESULTS_DIR = path.resolve(process.cwd(), 'results')
const CONFIG_DIR = path.resolve(process.cwd(), 'config')
const DATA_DIR = path.resolve(process.cwd(), 'data/custom')

// === Authentifizierung ===
// Passwort aus Environment-Variable (für Railway: FAIRLAB_PASSWORD setzen)
const AUTH_PASSWORD = process.env.FAIRLAB_PASSWORD || null
const AUTH_ENABLED = !!AUTH_PASSWORD

// Einfaches Session-Management (in-memory, reicht für Single-Instance)
const sessions = new Map()
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 Stunden

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

// API-Key Maskierung
function maskApiKey(key) {
  if (!key || key.length < 8) return '****'
  return key.substring(0, 7) + '...' + key.substring(key.length - 4)
}

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

// Dateien
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

export default defineConfig({
  plugins: [
    react(),
    // Custom Proxy Plugin für dynamische API-Endpoints
    {
      name: 'dynamic-proxy',
      configureServer(server) {
        // === Auth-Endpoints (immer zugänglich) ===

        // GET /api/auth/status - Prüft ob Auth aktiviert ist und ob Session gültig
        server.middlewares.use('/api/auth/status', async (req, res) => {
          if (req.method !== 'GET') return
          const token = getSessionFromRequest(req)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            authEnabled: AUTH_ENABLED,
            authenticated: isValidSession(token),
          }))
        })

        // POST /api/auth/login - Login mit Passwort
        server.middlewares.use('/api/auth/login', async (req, res) => {
          if (req.method !== 'POST') return

          try {
            let body = ''
            for await (const chunk of req) {
              body += chunk
            }
            const { password } = JSON.parse(body)

            if (!AUTH_ENABLED) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, message: 'Auth nicht aktiviert' }))
              return
            }

            if (password === AUTH_PASSWORD) {
              const token = createSession()
              res.setHeader('Set-Cookie', `fairlab_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DURATION / 1000}`)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            } else {
              res.statusCode = 401
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: 'Falsches Passwort' }))
            }
          } catch (error) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: error.message }))
          }
        })

        // POST /api/auth/logout - Logout
        server.middlewares.use('/api/auth/logout', async (req, res) => {
          if (req.method !== 'POST') return
          const token = getSessionFromRequest(req)
          if (token) {
            sessions.delete(token)
          }
          res.setHeader('Set-Cookie', 'fairlab_session=; Path=/; HttpOnly; Max-Age=0')
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true }))
        })

        // === Session-Check Middleware für alle /api/* Endpoints (außer /api/auth/*) ===
        server.middlewares.use((req, res, next) => {
          // Nur /api/* Pfade prüfen, aber nicht /api/auth/*
          if (!req.url?.startsWith('/api') || req.url?.startsWith('/api/auth')) {
            return next()
          }

          // /api-proxy ist ein Sonderfall (wird separat geprüft)
          if (req.url?.startsWith('/api-proxy')) {
            return next()
          }

          const token = getSessionFromRequest(req)
          if (!isValidSession(token)) {
            res.statusCode = 401
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Nicht authentifiziert', authRequired: true }))
            return
          }
          next()
        })

        // === Proxy mit Domain-Whitelist und Session-Check ===
        server.middlewares.use('/api-proxy', async (req, res) => {
          // Session-Check
          const token = getSessionFromRequest(req)
          if (!isValidSession(token)) {
            res.statusCode = 401
            res.end(JSON.stringify({ error: 'Nicht authentifiziert' }))
            return
          }

          // Ziel-URL aus Header lesen
          const targetUrl = req.headers['x-target-url']

          if (!targetUrl) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'X-Target-URL header is required' }))
            return
          }

          // Domain-Whitelist prüfen
          if (!isAllowedProxyDomain(targetUrl)) {
            res.statusCode = 403
            res.end(JSON.stringify({
              error: 'Domain nicht erlaubt',
              allowedDomains: ALLOWED_PROXY_DOMAINS,
            }))
            return
          }

          try {
            const url = new URL(targetUrl)

            // Request-Body sammeln
            let body = ''
            for await (const chunk of req) {
              body += chunk
            }

            // Proxy-Anfrage durchführen
            const proxyHeaders = { ...req.headers }
            delete proxyHeaders['host']
            delete proxyHeaders['x-target-url']
            delete proxyHeaders['cookie'] // Keine Cookies an externe APIs
            proxyHeaders['host'] = url.host
            proxyHeaders['origin'] = url.origin

            const response = await fetch(targetUrl, {
              method: req.method,
              headers: proxyHeaders,
              body: req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined,
            })

            // Response-Headers kopieren
            res.statusCode = response.status
            response.headers.forEach((value, key) => {
              // Skip problematische Headers
              if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
                res.setHeader(key, value)
              }
            })

            // CORS-Headers hinzufügen
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', '*')

            const responseBody = await response.text()
            res.end(responseBody)
          } catch (error) {
            console.error('Proxy error:', error)
            res.statusCode = 500
            res.end(JSON.stringify({ error: error.message }))
          }
        })

        // OPTIONS preflight handler
        server.middlewares.use('/api-proxy', (req, res, next) => {
          if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', '*')
            res.statusCode = 204
            res.end()
            return
          }
          next()
        })

        // === Einfache JSON-Datei Endpoints (GET/PUT) ===

        const simpleJsonEndpoint = (urlPath, filePath) => {
          // GET
          server.middlewares.use(urlPath, async (req, res, next) => {
            if (req.method !== 'GET') return next()
            try {
              const content = fs.readFileSync(filePath, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(content)
            } catch (error) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: error.message }))
            }
          })

          // PUT
          server.middlewares.use(urlPath, async (req, res, next) => {
            if (req.method !== 'PUT') return next()
            try {
              let body = ''
              for await (const chunk of req) {
                body += chunk
              }
              fs.writeFileSync(filePath, JSON.stringify(JSON.parse(body), null, 2))
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            } catch (error) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: error.message }))
            }
          })
        }

        // Einfache Config-Endpoints
        simpleJsonEndpoint('/api/config', API_CONFIG_FILE)
        simpleJsonEndpoint('/api/preferences', PREFERENCES_FILE)
        simpleJsonEndpoint('/api/custom-questions', CUSTOM_QUESTIONS_FILE)

        // === API-Verbindungen (Datei-basiert) ===

        // GET /api/connections - Alle Verbindungen laden
        server.middlewares.use('/api/connections', async (req, res, next) => {
          if (req.method !== 'GET') return next()
          if (req.url && req.url !== '/' && req.url !== '') return next()

          try {
            const connections = JSON.parse(fs.readFileSync(CONNECTIONS_FILE, 'utf-8'))
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(connections))
          } catch (error) {
            res.setHeader('Content-Type', 'application/json')
            res.end('[]')
          }
        })

        // POST /api/connections - Neue Verbindung speichern
        server.middlewares.use('/api/connections', async (req, res, next) => {
          if (req.method !== 'POST') return next()

          try {
            let body = ''
            for await (const chunk of req) {
              body += chunk
            }

            const newConnection = JSON.parse(body)
            const connections = JSON.parse(fs.readFileSync(CONNECTIONS_FILE, 'utf-8'))

            newConnection.id = newConnection.id || `conn_${Date.now()}`
            newConnection.createdAt = newConnection.createdAt || new Date().toISOString()
            newConnection.updatedAt = new Date().toISOString()

            // Prüfen ob bereits existiert
            const existingIndex = connections.findIndex(c => c.id === newConnection.id)
            if (existingIndex >= 0) {
              connections[existingIndex] = newConnection
            } else {
              connections.unshift(newConnection)
            }

            fs.writeFileSync(CONNECTIONS_FILE, JSON.stringify(connections, null, 2))
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(newConnection))
          } catch (error) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: error.message }))
          }
        })

        // DELETE /api/connections/:id - Verbindung löschen
        server.middlewares.use('/api/connections/', async (req, res, next) => {
          if (req.method !== 'DELETE') return next()

          const id = req.url?.replace('/', '')
          if (!id) return next()

          try {
            const connections = JSON.parse(fs.readFileSync(CONNECTIONS_FILE, 'utf-8'))
            const filtered = connections.filter(c => c.id !== id)
            fs.writeFileSync(CONNECTIONS_FILE, JSON.stringify(filtered, null, 2))
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
          } catch (error) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: error.message }))
          }
        })

        // === Lokaler Datei-Speicher für Testergebnisse ===

        // GET /api/results - Alle Ergebnisse auflisten
        server.middlewares.use('/api/results', async (req, res, next) => {
          if (req.method !== 'GET') return next()
          if (req.url && req.url !== '/' && req.url !== '') return next()

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

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(files))
          } catch (error) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: error.message }))
          }
        })

        // POST /api/results - Neues Ergebnis speichern
        server.middlewares.use('/api/results', async (req, res, next) => {
          if (req.method !== 'POST') return next()

          try {
            let body = ''
            for await (const chunk of req) {
              body += chunk
            }

            const data = JSON.parse(body)
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
            const modelName = (data.config?.modelName || 'unknown').replace(/[^a-zA-Z0-9-]/g, '_')
            const filename = `fairlab_${modelName}_${timestamp}.json`
            const filepath = path.join(RESULTS_DIR, filename)

            fs.writeFileSync(filepath, JSON.stringify(data, null, 2))

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, filename, id: filename.replace('.json', '') }))
          } catch (error) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: error.message }))
          }
        })

        // GET /api/results/:id - Einzelnes Ergebnis laden
        server.middlewares.use('/api/results/', async (req, res, next) => {
          if (req.method !== 'GET') return next()

          const id = req.url?.replace('/', '').replace('.json', '')
          if (!id) return next()

          try {
            const filepath = path.join(RESULTS_DIR, `${id}.json`)
            if (!fs.existsSync(filepath)) {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'Ergebnis nicht gefunden' }))
              return
            }

            const content = fs.readFileSync(filepath, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(content)
          } catch (error) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: error.message }))
          }
        })

        // DELETE /api/results/:id - Ergebnis löschen
        server.middlewares.use('/api/results/', async (req, res, next) => {
          if (req.method !== 'DELETE') return next()

          const id = req.url?.replace('/', '').replace('.json', '')
          if (!id) return next()

          try {
            const filepath = path.join(RESULTS_DIR, `${id}.json`)
            if (!fs.existsSync(filepath)) {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'Ergebnis nicht gefunden' }))
              return
            }

            fs.unlinkSync(filepath)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
          } catch (error) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: error.message }))
          }
        })
      }
    }
  ],
  server: {
    port: 5173,
    open: true,
  }
})
