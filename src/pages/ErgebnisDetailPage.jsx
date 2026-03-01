import { useParams, Link, useNavigate } from 'react-router-dom'
import { colors, fontSizes, fontWeights, spacing, borderRadius } from '../config/styleConstants'
import { getCategoryById } from '../config/categories'
import { uiStrings } from '../config/uiStrings'
import { useApp } from '../context/AppContext'
import { loadTestResultById } from '../services/storageService'
import { loadResultFromFile } from '../services/fileStorageService'
import { Button, Card, Tabs, Badge } from '../components/common'
import { BiasGauge, CategoryHeatmap, ScoreCard } from '../components/results'
import { interpretBiasScore, exportResultsAsCSV, exportResultsAsJSON } from '../services/biasCalculator'
import { useState, useEffect } from 'react'

function ErgebnisDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, actions } = useApp()
  const [activeTab, setActiveTab] = useState('overview')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  // Lade Ergebnis aus Datei oder localStorage
  useEffect(() => {
    async function loadResult() {
      try {
        // Versuche zuerst aus Datei zu laden
        const fileResult = await loadResultFromFile(id)
        setResult(fileResult)
      } catch {
        // Fallback auf localStorage
        const localResult = loadTestResultById(id)
        setResult(localResult)
      }
      setLoading(false)
    }
    loadResult()
  }, [id])

  const containerStyle = {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: `${spacing[11]} ${spacing[8]}`,
  }

  const headerStyle = {
    marginBottom: spacing[8],
  }

  const backLinkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[2],
    color: colors.gray[500],
    textDecoration: 'none',
    fontSize: fontSizes.md,
    marginBottom: spacing[5],
  }

  const titleStyle = {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    color: colors.gray[900],
    marginBottom: spacing[3],
  }

  const gaugeContainerStyle = {
    background: '#fff',
    borderRadius: borderRadius['4xl'],
    padding: spacing[9],
    marginBottom: spacing[8],
    border: `1px solid ${colors.gray[200]}`,
    textAlign: 'center',
  }

  const handleExport = (format) => {
    if (!result?.analysis) return

    let content, filename, type
    if (format === 'csv') {
      content = exportResultsAsCSV(result.analysis)
      filename = `fairlab-ergebnis-${id}.csv`
      type = 'text/csv'
    } else {
      content = exportResultsAsJSON(result.analysis)
      filename = `fairlab-ergebnis-${id}.json`
      type = 'application/json'
    }

    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    actions.showNotification(uiStrings.success.exported, 'success')
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: spacing[12] }}>
          <div style={{ fontSize: '48px', marginBottom: spacing[4] }}>⏳</div>
          <p style={{ color: colors.gray[600] }}>Lade Ergebnis...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: spacing[12] }}>
          <div style={{ fontSize: '64px', marginBottom: spacing[6] }}>❓</div>
          <h2 style={{ fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color: colors.gray[800], marginBottom: spacing[4] }}>
            Ergebnis nicht gefunden
          </h2>
          <Link to="/ergebnisse">
            <Button variant="secondary">Zurück zur Übersicht</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { analysis, config, createdAt, duration } = result
  const score = analysis?.summary?.overallBiasScore || 0

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: '📊' },
    { id: 'categories', label: 'Kategorien', icon: '📋' },
    { id: 'questions', label: 'Fragen', icon: '❓' },
    { id: 'details', label: 'Details', icon: '🔍' },
  ]

  const formatDuration = (ms) => {
    if (!ms) return '–'
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <Link to="/ergebnisse" style={backLinkStyle}>
          ← Zurück zur Übersicht
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={titleStyle}>{config?.modelName || 'Testergebnis'}</h1>
            <div style={{ color: colors.gray[500], fontSize: fontSizes.md }}>
              {new Date(createdAt).toLocaleDateString('de-DE', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            {config?.systemPrompt && (
              <div style={{
                marginTop: spacing[2],
                fontSize: fontSizes.sm,
                color: colors.purple,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}>
                💬 Custom Prompt: "{config.systemPrompt.substring(0, 60)}{config.systemPrompt.length > 60 ? '...' : ''}"
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: spacing[3] }}>
            <Button variant="secondary" size="sm" onClick={() => handleExport('csv')}>
              📄 CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleExport('json')}>
              📦 JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Main Gauge */}
      <div style={gaugeContainerStyle}>
        <h2 style={{ fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color: colors.gray[800], marginBottom: spacing[6] }}>
          {uiStrings.results.overallScore}
        </h2>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <BiasGauge
            score={score}
            size="lg"
            showLabel={true}
            showDescription={true}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing[5] }}>
          <ScoreCard
            label="Gesamtfragen"
            value={analysis?.summary?.totalQuestions || 0}
            size="md"
          />
          <ScoreCard
            label="Korrekte Antworten"
            value={(analysis?.summary?.overallAccuracy || 0).toFixed(1)}
            suffix="%"
            color={colors.green}
            size="md"
          />
          <ScoreCard
            label="Stereotype Antworten"
            value={analysis?.summary?.stereotypeAnswers || 0}
            color={colors.red}
            size="md"
          />
        </div>
      )}

      {activeTab === 'categories' && (
        <CategoryHeatmap
          categories={analysis?.sortedCategories || []}
          showLabels={true}
          showBars={true}
        />
      )}

      {activeTab === 'questions' && (
        <Card padding="lg">
          <div style={{ marginBottom: spacing[5], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.gray[800] }}>
              Alle Fragen ({result.results?.length || 0})
            </h3>
            <div style={{ fontSize: fontSizes.sm, color: colors.gray[500] }}>
              <span style={{ color: colors.green, marginRight: spacing[4] }}>● Korrekt</span>
              <span style={{ color: colors.red, marginRight: spacing[4] }}>● Stereotyp</span>
              <span style={{ color: colors.gray[400] }}>● Falsch</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            {result.results?.map((q, idx) => {
              const cat = getCategoryById(q.kategorie)
              const answerLetter = q.modelAnswer >= 0 ? String.fromCharCode(65 + q.modelAnswer) : '–'
              const correctLetter = q.korrektIndex >= 0 ? String.fromCharCode(65 + q.korrektIndex) : '–'

              let resultColor = colors.gray[400]
              let resultText = 'Falsch'
              let resultBg = colors.gray[50]
              if (q.isCorrect) {
                resultColor = colors.green
                resultText = 'Korrekt'
                resultBg = colors.status.success.bg
              } else if (q.isStereotype) {
                resultColor = colors.red
                resultText = 'Stereotyp'
                resultBg = colors.status.error.bg
              }

              return (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${colors.gray[200]}`,
                    borderLeft: `4px solid ${resultColor}`,
                    borderRadius: borderRadius.lg,
                    padding: spacing[4],
                    background: resultBg,
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                      <span style={{ fontSize: fontSizes.xs, color: colors.gray[400] }}>#{idx + 1}</span>
                      <Badge type="neutral" size="sm">{cat?.icon} {cat?.name || q.kategorie}</Badge>
                      <Badge type={q.contextCondition === 'ambig' ? 'warning' : 'info'} size="sm">
                        {q.contextCondition === 'ambig' ? 'Mehrdeutig' : 'Eindeutig'}
                      </Badge>
                    </div>
                    <span style={{ color: resultColor, fontWeight: fontWeights.bold, fontSize: fontSizes.sm }}>
                      {resultText}
                    </span>
                  </div>

                  {/* Kontext & Frage */}
                  {q.kontext && (
                    <div style={{ fontSize: fontSizes.sm, color: colors.gray[600], marginBottom: spacing[3], lineHeight: 1.5 }}>
                      {q.kontext}
                    </div>
                  )}
                  {q.frage && (
                    <div style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.gray[800], marginBottom: spacing[3] }}>
                      {q.frage}
                    </div>
                  )}

                  {/* Antworten */}
                  {q.antworten && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2], marginBottom: spacing[3] }}>
                      {q.antworten.map((antwort, aIdx) => {
                        const letter = String.fromCharCode(65 + aIdx)
                        const isModelAnswer = aIdx === q.modelAnswer
                        const isCorrectAnswer = aIdx === q.korrektIndex
                        const isStereotypeAnswer = aIdx === q.stereotypZiel

                        let answerStyle = {
                          padding: `${spacing[2]} ${spacing[3]}`,
                          borderRadius: borderRadius.md,
                          fontSize: fontSizes.sm,
                          background: '#fff',
                          border: `1px solid ${colors.gray[200]}`,
                        }

                        if (isModelAnswer) {
                          answerStyle.border = `2px solid ${q.isCorrect ? colors.green : colors.red}`
                          answerStyle.fontWeight = fontWeights.bold
                        }
                        if (isCorrectAnswer && !isModelAnswer) {
                          answerStyle.background = colors.status.success.bg
                        }

                        return (
                          <div key={aIdx} style={answerStyle}>
                            <span style={{ fontWeight: fontWeights.bold, marginRight: spacing[2] }}>{letter})</span>
                            {antwort}
                            {isModelAnswer && <span style={{ marginLeft: spacing[2] }}>← Modell</span>}
                            {isCorrectAnswer && !isModelAnswer && <span style={{ marginLeft: spacing[2], color: colors.green }}>← Korrekt</span>}
                            {isStereotypeAnswer && !isModelAnswer && !isCorrectAnswer && <span style={{ marginLeft: spacing[2], color: colors.gray[400] }}>(Stereotyp)</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Keine Fragen-Daten verfügbar (alte Ergebnisse) */}
                  {!q.kontext && !q.frage && (
                    <div style={{ fontSize: fontSizes.sm, color: colors.gray[400], fontStyle: 'italic' }}>
                      Frageninhalt nicht verfügbar (älteres Ergebnis)
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {activeTab === 'details' && (
        <Card padding="lg">
          <h3 style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.gray[800], marginBottom: spacing[5] }}>
            Testdetails
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[6] }}>
            <div>
              <div style={{ fontSize: fontSizes.sm, color: colors.gray[500], marginBottom: spacing[2] }}>
                Mehrdeutige Fragen (Ambig)
              </div>
              <div style={{ fontSize: fontSizes.md, color: colors.gray[700] }}>
                Bias-Score: {analysis?.ambiguous?.adjustedScore?.toFixed(1) || 0}%
                <br />
                Genauigkeit: {analysis?.ambiguous?.accuracy?.toFixed(1) || 0}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: fontSizes.sm, color: colors.gray[500], marginBottom: spacing[2] }}>
                Eindeutige Fragen (Disambig)
              </div>
              <div style={{ fontSize: fontSizes.md, color: colors.gray[700] }}>
                Bias-Score: {analysis?.disambiguous?.score?.toFixed(1) || 0}%
                <br />
                Genauigkeit: {analysis?.disambiguous?.accuracy?.toFixed(1) || 0}%
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div style={{ marginTop: spacing[8] }}>
            <div style={{ fontSize: fontSizes.sm, color: colors.gray[500], marginBottom: spacing[3] }}>
              💬 System Prompt
            </div>
            <div style={{
              background: config?.systemPrompt ? colors.purple + '10' : colors.gray[50],
              padding: spacing[5],
              borderRadius: borderRadius.lg,
              fontSize: fontSizes.sm,
              border: config?.systemPrompt ? `1px solid ${colors.purple}30` : 'none',
            }}>
              {config?.systemPrompt ? (
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: colors.gray[700] }}>
                  {config.systemPrompt}
                </div>
              ) : (
                <div style={{ color: colors.gray[400], fontStyle: 'italic' }}>
                  Standard-Prompt (keine benutzerdefinierte Anweisung)
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: spacing[8] }}>
            <div style={{ fontSize: fontSizes.sm, color: colors.gray[500], marginBottom: spacing[3] }}>
              Testkonfiguration
            </div>
            <div style={{ background: colors.gray[50], padding: spacing[5], borderRadius: borderRadius.lg, fontSize: fontSizes.sm, fontFamily: 'monospace' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default ErgebnisDetailPage
