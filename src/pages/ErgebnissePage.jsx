import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { colors, fontSizes, fontWeights, spacing, borderRadius, getBiasScoreColor } from '../config/styleConstants'
import { getCategoryById } from '../config/categories'
import { uiStrings } from '../config/uiStrings'
import { useApp } from '../context/AppContext'
import { Button, Card, Badge, ImportDialog } from '../components/common'
import { interpretBiasScore } from '../services/biasCalculator'
import { loadResultsList, deleteResultFile, saveResultToFile } from '../services/fileStorageService'

function ErgebnissePage() {
  const { state, actions } = useApp()
  const [fileResults, setFileResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [showImportDialog, setShowImportDialog] = useState(false)

  // Lade Ergebnisse aus dem /results Ordner
  useEffect(() => {
    async function loadFiles() {
      try {
        const results = await loadResultsList()
        setFileResults(results)
      } catch (error) {
        console.error('Fehler beim Laden der Dateien:', error)
      }
      setLoading(false)
    }
    loadFiles()
  }, [])

  const containerStyle = {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: `${spacing[11]} ${spacing[8]}`,
  }

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[10],
  }

  const titleStyle = {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    color: colors.gray[900],
  }

  const emptyStateStyle = {
    textAlign: 'center',
    padding: `${spacing[12]} ${spacing[8]}`,
    background: '#fff',
    borderRadius: borderRadius['4xl'],
    border: `1px solid ${colors.gray[200]}`,
  }

  const resultsListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[5],
  }

  const resultCardStyle = {
    background: '#fff',
    borderRadius: borderRadius['3xl'],
    padding: spacing[7],
    border: `1px solid ${colors.gray[200]}`,
    display: 'grid',
    gridTemplateColumns: '1fr 200px 150px',
    gap: spacing[6],
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }

  const scoreGaugeStyle = (score) => {
    const interpretation = interpretBiasScore(score)
    return {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[4],
    }
  }

  const miniGaugeStyle = (score) => {
    const position = ((score + 100) / 200) * 100
    return {
      width: '120px',
      height: '8px',
      background: `linear-gradient(to right, ${colors.blue}, ${colors.gray[200]}, ${colors.red})`,
      borderRadius: '4px',
      position: 'relative',
    }
  }

  const gaugeMarkerStyle = (score) => ({
    position: 'absolute',
    top: '-4px',
    left: `calc(${((score + 100) / 200) * 100}% - 8px)`,
    width: '16px',
    height: '16px',
    background: '#fff',
    border: `3px solid ${interpretBiasScore(score).color}`,
    borderRadius: '50%',
  })

  const handleDeleteFile = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(uiStrings.results.confirmDelete)) {
      try {
        await deleteResultFile(id)
        setFileResults(prev => prev.filter(r => r.id !== id))
        actions.showNotification('Ergebnis gelöscht', 'success')
      } catch (error) {
        actions.showNotification('Fehler beim Löschen', 'error')
      }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  const handleImportResults = async (files) => {
    const errors = []
    let successCount = 0

    for (const file of files) {
      try {
        await saveResultToFile(file.data)
        successCount++
      } catch {
        errors.push(`${file.name}: Import fehlgeschlagen.`)
      }
    }

    // Reload results list
    const results = await loadResultsList()
    setFileResults(results)

    if (errors.length > 0) {
      throw new Error(`${successCount} importiert, ${errors.length} fehlgeschlagen: ${errors.join(' ')}`)
    }

    actions.showNotification(
      successCount === 1
        ? '1 Ergebnis erfolgreich importiert.'
        : `${successCount} Ergebnisse erfolgreich importiert.`,
      'success'
    )
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>{uiStrings.results.title}</h1>
          <p style={{ fontSize: fontSizes.lg, color: colors.gray[600], marginTop: spacing[2] }}>
            {uiStrings.results.subtitle}
          </p>
        </div>
        <div style={{ display: 'flex', gap: spacing[3] }}>
          <Button
            onClick={() => setShowImportDialog(true)}
            variant="secondary"
            icon="📥"
          >
            Ergebnisse importieren
          </Button>
          <Link to="/test">
            <Button icon="▶️">Neuen Test starten</Button>
          </Link>
        </div>
      </div>

      <ImportDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImportResults}
        title="Ergebnisse importieren"
        description="Importieren Sie eine oder mehrere JSON-Ergebnisdateien aus früheren Tests."
        multiple
      />

      {loading ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '48px', marginBottom: spacing[4] }}>⏳</div>
          <p style={{ color: colors.gray[600] }}>Lade Ergebnisse...</p>
        </div>
      ) : fileResults.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '64px', marginBottom: spacing[6] }}>📊</div>
          <h2 style={{ fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color: colors.gray[800], marginBottom: spacing[4] }}>
            {uiStrings.results.noResults}
          </h2>
          <p style={{ color: colors.gray[600], marginBottom: spacing[6] }}>
            {uiStrings.results.runFirstTest}
          </p>
          <Link to="/test">
            <Button icon="🧪">Test durchführen</Button>
          </Link>
        </div>
      ) : (
        <div style={resultsListStyle}>
          {fileResults.map((result) => {
            const score = result.biasScore || 0
            const interpretation = interpretBiasScore(score)

            return (
              <Link
                key={result.id}
                to={`/ergebnisse/${result.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={resultCardStyle}>
                  {/* Left: Info */}
                  <div>
                    <div style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.gray[800], marginBottom: spacing[2] }}>
                      {result.modelName || 'Unbekanntes Modell'}
                    </div>
                    <div style={{ fontSize: fontSizes.sm, color: colors.gray[500], marginBottom: spacing[2] }}>
                      {formatDate(result.createdAt)}
                    </div>
                    {result.systemPrompt && (
                      <div style={{
                        fontSize: fontSizes.xs,
                        color: colors.gray[600],
                        marginBottom: spacing[2],
                        padding: `${spacing[1]} ${spacing[2]}`,
                        background: colors.purple + '15',
                        borderRadius: borderRadius.md,
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        💬 {result.systemPrompt.substring(0, 50)}{result.systemPrompt.length > 50 ? '...' : ''}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
                      {result.categories?.slice(0, 4).map(catId => {
                        const cat = getCategoryById(catId)
                        return cat ? (
                          <Badge key={catId} type="neutral" size="sm">
                            {cat.icon}
                          </Badge>
                        ) : null
                      })}
                      {result.categories?.length > 4 && (
                        <Badge type="neutral" size="sm">
                          +{result.categories.length - 4}
                        </Badge>
                      )}
                    </div>
                    <div style={{ fontSize: fontSizes.xs, color: colors.gray[400], marginTop: spacing[2] }}>
                      📁 {result.filename}
                    </div>
                  </div>

                  {/* Middle: Score Gauge */}
                  <div style={scoreGaugeStyle(score)}>
                    <div>
                      <div style={miniGaugeStyle(score)}>
                        <div style={gaugeMarkerStyle(score)} />
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: fontSizes.xs,
                        color: colors.gray[400],
                        marginTop: spacing[1],
                      }}>
                        <span>-100%</span>
                        <span>+100%</span>
                      </div>
                    </div>
                    <div style={{
                      fontSize: fontSizes['2xl'],
                      fontWeight: fontWeights.bold,
                      color: interpretation.color,
                    }}>
                      {score > 0 ? '+' : ''}{score.toFixed(1)}%
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', gap: spacing[3], justifyContent: 'flex-end' }}>
                    <Badge type={
                      Math.abs(score) < 5 ? 'success' :
                      Math.abs(score) < 15 ? 'warning' : 'error'
                    }>
                      {interpretation.label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteFile(result.id, e)}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ErgebnissePage
