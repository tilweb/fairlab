import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { colors, fontSizes, fontWeights, spacing, borderRadius } from '../config/styleConstants'
import { getCategoryById } from '../config/categories'
import { uiStrings } from '../config/uiStrings'
import { useApp } from '../context/AppContext'
import { Button, ProgressBar, Badge, InfoBox } from '../components/common'
import { useTestRunner } from '../hooks/useTestRunner'
import { saveResultToFile } from '../services/fileStorageService'

function TestPage() {
  const { state, actions } = useApp()

  const testRunner = useTestRunner(state.apiConfig, {
    customQuestions: state.customQuestions,
    onComplete: async (result) => {
      // Legacy-Callback (Speicherung läuft dateibasiert über fileStorageService)
      actions.saveCompletedTest({
        analysis: result.analysis,
        config: result.config,
        duration: result.duration,
      })

      // Als JSON-Datei im /results Ordner speichern
      try {
        const saved = await saveResultToFile(result)
        actions.showNotification(`Test abgeschlossen! Gespeichert als ${saved.filename}`, 'success')
      } catch (error) {
        actions.showNotification(`Test abgeschlossen, aber Datei konnte nicht gespeichert werden: ${error.message}`, 'warning')
      }
    },
    onError: (errorMessage) => {
      actions.showNotification(errorMessage, 'error')
    },
  })

  const containerStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: `${spacing[11]} ${spacing[8]}`,
  }

  const headerStyle = {
    marginBottom: spacing[10],
  }

  const titleStyle = {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    color: colors.gray[900],
    marginBottom: spacing[3],
  }

  const configWarningStyle = {
    textAlign: 'center',
    padding: spacing[12],
  }

  const testAreaStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: spacing[8],
    alignItems: 'start',
  }

  const mainPanelStyle = {
    background: '#fff',
    borderRadius: borderRadius['4xl'],
    padding: spacing[9],
    border: `1px solid ${colors.gray[200]}`,
  }

  const sidePanelStyle = {
    background: '#fff',
    borderRadius: borderRadius['4xl'],
    padding: spacing[7],
    border: `1px solid ${colors.gray[200]}`,
    position: 'sticky',
    top: spacing[8],
  }

  const questionCardStyle = {
    background: colors.gray[50],
    borderRadius: borderRadius.xl,
    padding: spacing[7],
    marginTop: spacing[6],
    border: `1px solid ${colors.gray[200]}`,
  }

  const answersStyle = {
    marginTop: spacing[5],
  }

  // Finde das letzte Ergebnis - zeige nur wenn es zur aktuellen Frage passt
  const lastResult = testRunner.results[testRunner.results.length - 1]
  const currentQuestionId = testRunner.currentQuestion?.id
  const showLastAnswer = lastResult?.questionId === currentQuestionId
  const lastAnswerIndex = showLastAnswer ? (lastResult?.modelAnswer ?? -1) : -1

  const getAnswerOptionStyle = (index) => {
    const isModelAnswer = index === lastAnswerIndex && lastAnswerIndex >= 0
    const isCorrect = lastResult?.isCorrect && isModelAnswer
    const isStereotype = lastResult?.isStereotype && isModelAnswer && !isCorrect

    let background = colors.gray[100]
    let borderColor = 'transparent'

    if (isModelAnswer) {
      if (isCorrect) {
        background = colors.status.success.bg
        borderColor = colors.green
      } else if (isStereotype) {
        background = colors.status.error.bg
        borderColor = colors.red
      } else {
        background = colors.status.info.bg
        borderColor = colors.blue
      }
    }

    return {
      padding: spacing[4],
      borderRadius: borderRadius.md,
      background,
      border: `2px solid ${borderColor}`,
      marginBottom: spacing[2],
      fontSize: fontSizes.sm,
      color: colors.gray[700],
      fontWeight: isModelAnswer ? fontWeights.semibold : fontWeights.normal,
    }
  }

  const statRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing[4]} 0`,
    borderBottom: `1px solid ${colors.gray[100]}`,
  }

  const isConfigured = state.apiConfig.apiEndpoint && state.apiConfig.apiKey

  // Load questions when configuration is ready
  useEffect(() => {
    if (isConfigured) {
      testRunner.loadQuestions()
    }
  }, [isConfigured, state.apiConfig.selectedCategories, state.apiConfig.questionsPerCategory])

  if (!isConfigured) {
    return (
      <div style={containerStyle}>
        <div style={configWarningStyle}>
          <div style={{ fontSize: '64px', marginBottom: spacing[6] }}>⚙️</div>
          <h2 style={{ fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color: colors.gray[800], marginBottom: spacing[4] }}>
            {uiStrings.test.notConfigured}
          </h2>
          <Link to="/konfiguration">
            <Button icon="🔧">{uiStrings.test.goToConfig}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>{uiStrings.test.title}</h1>
        <p style={{ fontSize: fontSizes.lg, color: colors.gray[600] }}>
          {uiStrings.test.subtitle}
        </p>
      </div>

      <div style={testAreaStyle}>
        {/* Main Panel */}
        <div style={mainPanelStyle}>
          {testRunner.status === 'idle' && (
            <div style={{ padding: spacing[8] }}>
              <div style={{ textAlign: 'center', marginBottom: spacing[6] }}>
                <div style={{ fontSize: '48px', marginBottom: spacing[4] }}>🧪</div>
                <h3 style={{ fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color: colors.gray[800] }}>
                  Bereit zum Testen
                </h3>
              </div>

              {/* Kompakte Konfigurationsübersicht */}
              <div style={{
                background: colors.gray[50],
                borderRadius: borderRadius.xl,
                padding: spacing[5],
                marginBottom: spacing[6],
                fontSize: fontSizes.sm,
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: `${spacing[2]} ${spacing[4]}`, alignItems: 'start' }}>
                  <span style={{ color: colors.gray[500] }}>Modell:</span>
                  <span style={{ fontWeight: fontWeights.semibold, color: colors.gray[800] }}>{state.apiConfig.modelName}</span>

                  <span style={{ color: colors.gray[500] }}>Endpoint:</span>
                  <span style={{ color: colors.gray[700], wordBreak: 'break-all' }}>{state.apiConfig.apiEndpoint.replace(/https?:\/\//, '').split('/')[0]}</span>

                  <span style={{ color: colors.gray[500] }}>Testset:</span>
                  <span style={{ color: colors.gray[700] }}>{state.apiConfig.testSetId === 'german-hr' ? '🇩🇪 German HR' : '🇬🇧 BBQ English'}</span>

                  <span style={{ color: colors.gray[500] }}>Fragen:</span>
                  <span style={{ color: colors.gray[700] }}>{testRunner.totalQuestions} ({state.apiConfig.questionsPerCategory} × {state.apiConfig.selectedCategories.length} Kategorien)</span>

                  <span style={{ color: colors.gray[500] }}>Kategorien:</span>
                  <span style={{ color: colors.gray[700] }}>
                    {state.apiConfig.selectedCategories.map(catId => getCategoryById(catId)?.icon).join(' ')}
                  </span>

                  <span style={{ color: colors.gray[500] }}>Prompt:</span>
                  <span style={{ color: colors.gray[600], fontStyle: 'italic' }}>
                    {(state.apiConfig.systemPrompt || 'Standard').substring(0, 50)}...
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Button onClick={testRunner.start} size="lg" icon="▶️">
                  {uiStrings.test.startTest}
                </Button>
                <div style={{ marginTop: spacing[3] }}>
                  <Link to="/konfiguration" style={{ fontSize: fontSizes.sm, color: colors.gray[500] }}>
                    Konfiguration ändern
                  </Link>
                </div>
              </div>
            </div>
          )}

          {(testRunner.isRunning || testRunner.isPaused) && (
            <>
              <div style={{ marginBottom: spacing[6] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
                  <span style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.gray[800] }}>
                    {uiStrings.test.progress}
                  </span>
                  <Badge type={testRunner.isPaused ? 'warning' : 'info'}>
                    {testRunner.isPaused ? 'Pausiert' : 'Läuft'}
                  </Badge>
                </div>
                <ProgressBar
                  value={testRunner.progress}
                  max={testRunner.totalQuestions}
                  color={colors.purple}
                  animated={testRunner.isRunning}
                />
              </div>

              {testRunner.currentQuestion && (
                <div style={questionCardStyle}>
                  <Badge type="neutral" style={{ marginBottom: spacing[4] }}>
                    {getCategoryById(testRunner.currentQuestion.kategorie)?.name || testRunner.currentQuestion.kategorie}
                  </Badge>
                  <div style={{ fontSize: fontSizes.sm, color: colors.gray[600], marginBottom: spacing[4] }}>
                    {testRunner.currentQuestion.kontext}
                  </div>
                  <div style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.gray[800] }}>
                    {testRunner.currentQuestion.frage}
                  </div>
                  <div style={answersStyle}>
                    {testRunner.currentQuestion.antworten.map((answer, idx) => (
                      <div key={idx} style={getAnswerOptionStyle(idx)}>
                        {String.fromCharCode(65 + idx)}) {answer}
                        {idx === lastAnswerIndex && lastAnswerIndex >= 0 && (
                          <span style={{ marginLeft: spacing[2], fontSize: fontSizes.xs }}>
                            ← {lastResult?.isCorrect ? '✓' : lastResult?.isStereotype ? '⚠' : '✗'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: spacing[4], marginTop: spacing[6] }}>
                {testRunner.isRunning ? (
                  <Button onClick={testRunner.pause} variant="secondary" icon="⏸️">
                    {uiStrings.test.pauseTest}
                  </Button>
                ) : (
                  <Button onClick={testRunner.resume} icon="▶️">
                    {uiStrings.test.resumeTest}
                  </Button>
                )}
                <Button onClick={testRunner.cancel} variant="danger" icon="✕">
                  {uiStrings.test.cancelTest}
                </Button>
              </div>
            </>
          )}

          {testRunner.isCompleted && (
            <div style={{ textAlign: 'center', padding: spacing[10] }}>
              <div style={{ fontSize: '64px', marginBottom: spacing[6] }}>✅</div>
              <h3 style={{ fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color: colors.green, marginBottom: spacing[4] }}>
                {uiStrings.test.testComplete}
              </h3>
              <p style={{ color: colors.gray[600], marginBottom: spacing[6] }}>
                {testRunner.results.length} Fragen ausgewertet
              </p>
              <div style={{ display: 'flex', gap: spacing[4], justifyContent: 'center' }}>
                <Link to="/ergebnisse">
                  <Button icon="📊">{uiStrings.test.viewResults}</Button>
                </Link>
                <Button onClick={testRunner.reset} variant="secondary">
                  Neuer Test
                </Button>
              </div>
            </div>
          )}

          {testRunner.hasError && (
            <div style={{ textAlign: 'center', padding: spacing[10] }}>
              <div style={{ fontSize: '64px', marginBottom: spacing[6] }}>❌</div>
              <h3 style={{ fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color: colors.red, marginBottom: spacing[4] }}>
                Fehler beim Test
              </h3>
              <InfoBox type="error">
                {testRunner.error}
              </InfoBox>
              <div style={{ marginTop: spacing[6] }}>
                <Button onClick={testRunner.reset} variant="secondary">
                  Zurück
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel - Live Stats */}
        <div style={sidePanelStyle}>
          <h3 style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.gray[800], marginBottom: spacing[5] }}>
            {uiStrings.test.liveStats}
          </h3>

          <div style={statRowStyle}>
            <span style={{ color: colors.gray[600] }}>{uiStrings.test.questionsCompleted}</span>
            <span style={{ fontWeight: fontWeights.bold, color: colors.gray[800] }}>
              {testRunner.liveStats.total} / {testRunner.totalQuestions}
            </span>
          </div>

          <div style={statRowStyle}>
            <span style={{ color: colors.gray[600] }}>Korrekte Antworten</span>
            <span style={{ fontWeight: fontWeights.bold, color: colors.green }}>
              {testRunner.liveStats.correct} ({testRunner.currentAccuracy.toFixed(0)}%)
            </span>
          </div>

          <div style={statRowStyle}>
            <span style={{ color: colors.gray[600] }}>Stereotype Antworten</span>
            <span style={{ fontWeight: fontWeights.bold, color: colors.red }}>
              {testRunner.liveStats.stereotype} ({testRunner.liveStats.total > 0 ? Math.round(testRunner.liveStats.stereotype / testRunner.liveStats.total * 100) : 0}%)
            </span>
          </div>

          <div style={statRowStyle}>
            <span style={{ color: colors.gray[600] }}>Aktueller Bias-Score</span>
            <span style={{ fontWeight: fontWeights.bold, color: testRunner.currentBiasScore > 5 ? colors.red : testRunner.currentBiasScore < -5 ? colors.blue : colors.gray[600] }}>
              {testRunner.currentBiasScore > 0 ? '+' : ''}{testRunner.currentBiasScore.toFixed(1)}%
            </span>
          </div>

          <div style={{ marginTop: spacing[6], paddingTop: spacing[5], borderTop: `1px solid ${colors.gray[200]}` }}>
            <div style={{ fontSize: fontSizes.sm, color: colors.gray[500], marginBottom: spacing[3] }}>
              Modell
            </div>
            <div style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.gray[800] }}>
              {state.apiConfig.modelName}
            </div>
          </div>

          <div style={{ marginTop: spacing[4] }}>
            <div style={{ fontSize: fontSizes.sm, color: colors.gray[500], marginBottom: spacing[3] }}>
              Kategorien
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
              {state.apiConfig.selectedCategories.map(catId => {
                const cat = getCategoryById(catId)
                return cat ? (
                  <Badge key={catId} type="neutral">
                    {cat.icon} {cat.name}
                  </Badge>
                ) : null
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPage
