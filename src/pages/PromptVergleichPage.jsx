import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { colors, fontSizes, fontWeights, spacing, borderRadius } from '../config/styleConstants'
import { getCategoryById, categories } from '../config/categories'
import { Button, Card, Badge } from '../components/common'
import { interpretBiasScore } from '../services/biasCalculator'
import { loadResultsList, loadResultFromFile } from '../services/fileStorageService'

function PromptVergleichPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState(null)
  const [selectedTestset, setSelectedTestset] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Lade alle Ergebnisse mit vollständigen Daten
  useEffect(() => {
    async function loadAllResults() {
      try {
        const list = await loadResultsList()
        // Lade vollständige Daten für jeden Eintrag
        const fullResults = await Promise.all(
          list.map(async (item) => {
            try {
              const full = await loadResultFromFile(item.id)
              return {
                ...item,
                ...full,
                systemPrompt: full.config?.systemPrompt || '',
                testSetId: full.config?.testSetId || 'german-hr',
                categoryScores: full.analysis?.categoryScores || {},
              }
            } catch {
              return item
            }
          })
        )
        setResults(fullResults)
      } catch (error) {
        console.error('Fehler beim Laden:', error)
      }
      setLoading(false)
    }
    loadAllResults()
  }, [])

  // Gruppiere nach Modell + Testset
  const groupedResults = useMemo(() => {
    const groups = {}

    for (const result of results) {
      const key = `${result.modelName}__${result.testSetId}`
      if (!groups[key]) {
        groups[key] = {
          modelName: result.modelName,
          testSetId: result.testSetId,
          results: [],
        }
      }
      groups[key].results.push(result)
    }

    // Sortiere Ergebnisse innerhalb jeder Gruppe nach Datum
    for (const key of Object.keys(groups)) {
      groups[key].results.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      )
    }

    return Object.values(groups)
  }, [results])

  // Alle einzigartigen Modelle und Testsets für Filter
  const allModels = useMemo(() =>
    [...new Set(results.map(r => r.modelName))].sort(),
    [results]
  )

  const allTestsets = useMemo(() =>
    [...new Set(results.map(r => r.testSetId))].sort(),
    [results]
  )

  // Gefilterte Gruppen
  const filteredGroups = useMemo(() => {
    return groupedResults.filter(group => {
      if (selectedModel && group.modelName !== selectedModel) return false
      if (selectedTestset && group.testSetId !== selectedTestset) return false
      return true
    })
  }, [groupedResults, selectedModel, selectedTestset])

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `${spacing[11]} ${spacing[8]}`,
  }

  const headerStyle = {
    marginBottom: spacing[8],
  }

  const titleStyle = {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    color: colors.gray[900],
    marginBottom: spacing[3],
  }

  const filterBarStyle = {
    display: 'flex',
    gap: spacing[4],
    marginBottom: spacing[8],
    flexWrap: 'wrap',
    alignItems: 'center',
  }

  const selectStyle = {
    padding: `${spacing[3]} ${spacing[4]}`,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.gray[300]}`,
    fontSize: fontSizes.md,
    background: '#fff',
    cursor: 'pointer',
    minWidth: '200px',
  }

  const groupCardStyle = {
    background: '#fff',
    borderRadius: borderRadius['3xl'],
    padding: spacing[7],
    marginBottom: spacing[6],
    border: `1px solid ${colors.gray[200]}`,
  }

  const promptRowStyle = (isHighlighted) => ({
    display: 'grid',
    gridTemplateColumns: '1fr 120px 100px 80px',
    gap: spacing[4],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    background: isHighlighted ? colors.purple + '08' : colors.gray[50],
    marginBottom: spacing[2],
    alignItems: 'center',
    border: isHighlighted ? `1px solid ${colors.purple}30` : '1px solid transparent',
  })

  const getScoreForCategory = (result, categoryId) => {
    if (!categoryId) return result.biasScore || 0
    const catScore = result.categoryScores?.[categoryId]
    return catScore?.overall?.adjustedScore ?? catScore?.overall?.score ?? null
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: spacing[12] }}>
          <div style={{ fontSize: '48px', marginBottom: spacing[4] }}>⏳</div>
          <p style={{ color: colors.gray[600] }}>Lade Ergebnisse...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Prompt-Vergleich</h1>
        <p style={{ fontSize: fontSizes.lg, color: colors.gray[600] }}>
          Vergleichen Sie die Auswirkung verschiedener System-Prompts auf das Bias-Verhalten
        </p>
      </div>

      {/* Filter Bar */}
      <div style={filterBarStyle}>
        <select
          style={selectStyle}
          value={selectedModel || ''}
          onChange={(e) => setSelectedModel(e.target.value || null)}
        >
          <option value="">Alle Modelle</option>
          {allModels.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>

        <select
          style={selectStyle}
          value={selectedTestset || ''}
          onChange={(e) => setSelectedTestset(e.target.value || null)}
        >
          <option value="">Alle Testsets</option>
          {allTestsets.map(ts => (
            <option key={ts} value={ts}>
              {ts === 'german-hr' ? '🇩🇪 German HR' : ts === 'bbq-english' ? '🇬🇧 BBQ English' : ts}
            </option>
          ))}
        </select>

        <select
          style={selectStyle}
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
        >
          <option value="">Gesamt-Score</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        {(selectedModel || selectedTestset || selectedCategory) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedModel(null)
              setSelectedTestset(null)
              setSelectedCategory(null)
            }}
          >
            Filter zurücksetzen
          </Button>
        )}
      </div>

      {/* Info wenn keine Ergebnisse */}
      {filteredGroups.length === 0 && (
        <Card padding="lg">
          <div style={{ textAlign: 'center', padding: spacing[8] }}>
            <div style={{ fontSize: '64px', marginBottom: spacing[4] }}>📊</div>
            <h3 style={{ fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.gray[800], marginBottom: spacing[3] }}>
              Keine Ergebnisse gefunden
            </h3>
            <p style={{ color: colors.gray[600] }}>
              Führen Sie Tests mit verschiedenen System-Prompts durch, um sie hier vergleichen zu können.
            </p>
          </div>
        </Card>
      )}

      {/* Gruppierte Ergebnisse */}
      {filteredGroups.map((group) => {
        // Finde den besten Score in der Gruppe
        const scores = group.results.map(r => ({
          result: r,
          score: getScoreForCategory(r, selectedCategory),
        })).filter(s => s.score !== null)

        const bestScore = scores.length > 0
          ? scores.reduce((best, curr) =>
              Math.abs(curr.score) < Math.abs(best.score) ? curr : best
            )
          : null

        return (
          <div key={`${group.modelName}__${group.testSetId}`} style={groupCardStyle}>
            {/* Group Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing[5],
              paddingBottom: spacing[4],
              borderBottom: `1px solid ${colors.gray[200]}`,
            }}>
              <div>
                <h2 style={{
                  fontSize: fontSizes.xl,
                  fontWeight: fontWeights.bold,
                  color: colors.gray[800],
                  marginBottom: spacing[1],
                }}>
                  {group.modelName}
                </h2>
                <Badge type="neutral" size="sm">
                  {group.testSetId === 'german-hr' ? '🇩🇪 German HR' : '🇬🇧 BBQ English'}
                </Badge>
              </div>
              <div style={{ textAlign: 'right', fontSize: fontSizes.sm, color: colors.gray[500] }}>
                {group.results.length} Test{group.results.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Column Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 100px 80px',
              gap: spacing[4],
              padding: `${spacing[2]} ${spacing[4]}`,
              fontSize: fontSizes.xs,
              fontWeight: fontWeights.semibold,
              color: colors.gray[500],
              textTransform: 'uppercase',
            }}>
              <div>System Prompt</div>
              <div>Score{selectedCategory && ` (${getCategoryById(selectedCategory)?.name})`}</div>
              <div>Bewertung</div>
              <div>Datum</div>
            </div>

            {/* Results */}
            {group.results.map((result) => {
              const score = getScoreForCategory(result, selectedCategory)
              const isBest = bestScore && result.id === bestScore.result.id && group.results.length > 1
              const interpretation = score !== null ? interpretBiasScore(score) : null

              return (
                <Link
                  key={result.id}
                  to={`/ergebnisse/${result.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={promptRowStyle(isBest)}>
                    {/* Prompt */}
                    <div>
                      {result.systemPrompt ? (
                        <div style={{
                          fontSize: fontSizes.sm,
                          color: colors.gray[700],
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[2],
                        }}>
                          <span style={{ color: colors.purple }}>💬</span>
                          <span style={{
                            maxWidth: '400px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {result.systemPrompt.substring(0, 80)}
                            {result.systemPrompt.length > 80 ? '...' : ''}
                          </span>
                          {isBest && (
                            <Badge type="success" size="sm">Bester</Badge>
                          )}
                        </div>
                      ) : (
                        <div style={{
                          fontSize: fontSizes.sm,
                          color: colors.gray[400],
                          fontStyle: 'italic',
                        }}>
                          Standard-Prompt (kein Custom)
                          {isBest && (
                            <Badge type="success" size="sm" style={{ marginLeft: spacing[2] }}>Bester</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Score */}
                    <div style={{
                      fontSize: fontSizes.lg,
                      fontWeight: fontWeights.bold,
                      color: interpretation?.color || colors.gray[400],
                    }}>
                      {score !== null ? (
                        <>
                          {score > 0 ? '+' : ''}{score.toFixed(1)}%
                        </>
                      ) : (
                        <span style={{ fontSize: fontSizes.sm, color: colors.gray[400] }}>–</span>
                      )}
                    </div>

                    {/* Interpretation */}
                    <div>
                      {interpretation && (
                        <Badge
                          type={
                            Math.abs(score) < 5 ? 'success' :
                            Math.abs(score) < 15 ? 'warning' : 'error'
                          }
                          size="sm"
                        >
                          {interpretation.label.replace('Stereotyp', 'ST').replace('Anti-', 'A-')}
                        </Badge>
                      )}
                    </div>

                    {/* Date */}
                    <div style={{
                      fontSize: fontSizes.xs,
                      color: colors.gray[500],
                    }}>
                      {formatDate(result.createdAt)}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )
      })}

      {/* Hilfe-Box */}
      {results.length > 0 && results.every(r => !r.systemPrompt) && (
        <Card padding="lg">
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: spacing[4],
            background: colors.status.info.bg,
            padding: spacing[5],
            borderRadius: borderRadius.lg,
          }}>
            <span style={{ fontSize: '24px' }}>💡</span>
            <div>
              <h4 style={{ fontWeight: fontWeights.semibold, color: colors.gray[800], marginBottom: spacing[2] }}>
                Tipp: System-Prompts testen
              </h4>
              <p style={{ fontSize: fontSizes.sm, color: colors.gray[600], marginBottom: spacing[3] }}>
                Um verschiedene Prompts zu vergleichen, gehen Sie zur Konfiguration und setzen Sie einen
                System-Prompt wie z.B.:
              </p>
              <ul style={{ fontSize: fontSizes.sm, color: colors.gray[600], margin: 0, paddingLeft: spacing[5] }}>
                <li>"Antworte immer neutral und vermeide stereotype Annahmen."</li>
                <li>"Du bist ein fairer und unvoreingenommener Assistent."</li>
                <li>"Berücksichtige alle Optionen gleichwertig ohne Vorurteile."</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default PromptVergleichPage
