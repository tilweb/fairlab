import { useState, useEffect } from 'react'
import { colors, fontSizes, fontWeights, spacing, borderRadius } from '../config/styleConstants'
import { categories, getCategoryById } from '../config/categories'
import { uiStrings } from '../config/uiStrings'
import { useApp } from '../context/AppContext'
import { Button, Card, Input, Select, Tabs, Badge, InfoBox } from '../components/common'
import { loadQuestionsByCategory, validateQuestion, getQuestionStats } from '../services/questionLoader'

function FragenEditorPage() {
  const { state, actions } = useApp()
  const [selectedCategory, setSelectedCategory] = useState('alter')
  const [questions, setQuestions] = useState([])
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [stats, setStats] = useState({})

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

  const layoutStyle = {
    display: 'grid',
    gridTemplateColumns: '300px 1fr 400px',
    gap: spacing[6],
    alignItems: 'start',
  }

  const sidebarStyle = {
    background: '#fff',
    borderRadius: borderRadius['3xl'],
    padding: spacing[6],
    border: `1px solid ${colors.gray[200]}`,
    position: 'sticky',
    top: spacing[8],
  }

  const categoryButtonStyle = (isActive, color) => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    border: `2px solid ${isActive ? color : 'transparent'}`,
    background: isActive ? `${color}10` : 'transparent',
    cursor: 'pointer',
    marginBottom: spacing[2],
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  })

  const questionListStyle = {
    background: '#fff',
    borderRadius: borderRadius['3xl'],
    padding: spacing[6],
    border: `1px solid ${colors.gray[200]}`,
    maxHeight: 'calc(100vh - 200px)',
    overflow: 'auto',
  }

  const questionItemStyle = (isSelected) => ({
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    border: `1px solid ${isSelected ? colors.purple : colors.gray[200]}`,
    background: isSelected ? `${colors.purple}08` : '#fff',
    marginBottom: spacing[3],
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  })

  const detailPanelStyle = {
    background: '#fff',
    borderRadius: borderRadius['3xl'],
    padding: spacing[7],
    border: `1px solid ${colors.gray[200]}`,
    position: 'sticky',
    top: spacing[8],
  }

  const placeholderStyle = {
    background: colors.gray[50],
    borderRadius: borderRadius['3xl'],
    padding: spacing[10],
    border: `2px dashed ${colors.gray[300]}`,
    textAlign: 'center',
  }

  useEffect(() => {
    loadCategoryQuestions(selectedCategory, state.customQuestions)
    setStats(getQuestionStats('german-hr', state.customQuestions))
  }, [selectedCategory, state.customQuestions])

  const loadCategoryQuestions = (category, customQuestions = state.customQuestions) => {
    const loaded = loadQuestionsByCategory(category, 'german-hr', customQuestions)
    // Group by base ID (remove _ambig/_disambig suffix)
    const grouped = {}
    loaded.forEach(q => {
      const baseId = q.id.replace(/_ambig|_disambig/g, '')
      if (!grouped[baseId]) {
        grouped[baseId] = { ambig: null, disambig: null }
      }
      if (q.context_condition === 'ambig') {
        grouped[baseId].ambig = q
      } else {
        grouped[baseId].disambig = q
      }
    })
    setQuestions(Object.entries(grouped).map(([id, pair]) => ({
      id,
      ...pair,
      frage: pair.ambig?.frage || pair.disambig?.frage,
      kategorie: pair.ambig?.kategorie || pair.disambig?.kategorie,
    })))
    setSelectedQuestion(null)
  }

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question)
    setIsEditing(false)
    setEditForm(null)
  }

  const handleNewQuestion = () => {
    setSelectedQuestion(null)
    setIsEditing(true)
    setEditForm({
      id: `${selectedCategory}_${Date.now()}`,
      kategorie: selectedCategory,
      kontext_ambig: '',
      kontext_disambig: '',
      frage: '',
      antworten: ['', '', 'Kann nicht bestimmt werden'],
      korrekt_ambig: 2,
      korrekt_disambig: 0,
      stereotyp_ziel: 0,
      quelle: '',
    })
  }

  const handleEditQuestion = () => {
    if (!selectedQuestion) return
    const q = selectedQuestion.ambig || selectedQuestion.disambig
    setIsEditing(true)
    setEditForm({
      id: selectedQuestion.id,
      kategorie: q.kategorie,
      kontext_ambig: selectedQuestion.ambig?.kontext || '',
      kontext_disambig: selectedQuestion.disambig?.kontext || '',
      frage: q.frage,
      antworten: [...q.antworten],
      korrekt_ambig: q.korrekt_ambig,
      korrekt_disambig: q.korrekt_disambig,
      stereotyp_ziel: q.stereotyp_ziel,
      quelle: q.quelle || '',
    })
  }

  const handleSave = () => {
    const validation = validateQuestion(editForm)
    if (!validation.isValid) {
      actions.showNotification(`Fehler: ${validation.errors.join(', ')}`, 'error')
      return
    }

    // Save to custom questions (App-Context + dateibasierte Persistenz)
    const customQuestions = state.customQuestions[selectedCategory] || []
    const updatedQuestions = customQuestions.filter(q => !q.id.startsWith(editForm.id))

    // Create ambig and disambig versions
    updatedQuestions.push({
      ...editForm,
      id: `${editForm.id}_ambig`,
      context_condition: 'ambig',
      kontext: editForm.kontext_ambig,
    })
    updatedQuestions.push({
      ...editForm,
      id: `${editForm.id}_disambig`,
      context_condition: 'disambig',
      kontext: editForm.kontext_disambig,
    })

    const nextCustomQuestions = { ...state.customQuestions, [selectedCategory]: updatedQuestions }
    actions.updateCategoryQuestions(selectedCategory, updatedQuestions)
    actions.showNotification(uiStrings.success.questionSaved, 'success')

    setIsEditing(false)
    setEditForm(null)
    loadCategoryQuestions(selectedCategory, nextCustomQuestions)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm(null)
  }

  const handleExport = () => {
    const allQuestions = []
    categories.forEach(cat => {
      const catQuestions = loadQuestionsByCategory(cat.id, 'german-hr', state.customQuestions)
      allQuestions.push(...catQuestions)
    })

    const blob = new Blob([JSON.stringify(allQuestions, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fairlab-fragen.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    actions.showNotification(uiStrings.success.exported, 'success')
  }

  const selectedCat = getCategoryById(selectedCategory)

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={titleStyle}>{uiStrings.editor.title}</h1>
            <p style={{ fontSize: fontSizes.lg, color: colors.gray[600] }}>
              {uiStrings.editor.subtitle}
            </p>
          </div>
          <div style={{ display: 'flex', gap: spacing[3] }}>
            <Button variant="secondary" onClick={handleExport} icon="📤">
              {uiStrings.editor.exportQuestions}
            </Button>
            <Button onClick={handleNewQuestion} icon="➕">
              {uiStrings.editor.addQuestion}
            </Button>
          </div>
        </div>
      </div>

      <div style={layoutStyle}>
        {/* Category Sidebar */}
        <div style={sidebarStyle}>
          <div style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.gray[500], marginBottom: spacing[4] }}>
            KATEGORIEN
          </div>
          {categories.map((cat) => (
            <button
              key={cat.id}
              style={categoryButtonStyle(selectedCategory === cat.id, cat.color)}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span style={{ fontSize: '20px' }}>{cat.icon}</span>
              <div>
                <div style={{ fontWeight: fontWeights.semibold, color: colors.gray[800], fontSize: fontSizes.sm }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: fontSizes.xs, color: colors.gray[500] }}>
                  {stats[cat.id]?.total || 0} Fragen
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Question List */}
        <div style={questionListStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[5] }}>
            <h3 style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.gray[800] }}>
              {selectedCat?.icon} {selectedCat?.name}
            </h3>
            <Badge type="neutral">{questions.length} Fragen-Paare</Badge>
          </div>

          {questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: spacing[8], color: colors.gray[500] }}>
              Keine Fragen in dieser Kategorie
            </div>
          ) : (
            questions.map((q) => (
              <div
                key={q.id}
                style={questionItemStyle(selectedQuestion?.id === q.id)}
                onClick={() => handleSelectQuestion(q)}
              >
                <div style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.gray[800], marginBottom: spacing[2] }}>
                  {q.frage}
                </div>
                <div style={{ fontSize: fontSizes.xs, color: colors.gray[500] }}>
                  ID: {q.id}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div>
          {isEditing ? (
            <div style={detailPanelStyle}>
              <h3 style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.gray[800], marginBottom: spacing[6] }}>
                {selectedQuestion ? uiStrings.editor.editQuestion : uiStrings.editor.addQuestion}
              </h3>

              <Input
                label={uiStrings.editor.question}
                value={editForm.frage}
                onChange={(value) => setEditForm({ ...editForm, frage: value })}
                required
              />

              <div style={{ marginBottom: spacing[4] }}>
                <label style={{ display: 'block', fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.gray[700], marginBottom: spacing[2] }}>
                  {uiStrings.editor.contextAmbig}
                </label>
                <textarea
                  value={editForm.kontext_ambig}
                  onChange={(e) => setEditForm({ ...editForm, kontext_ambig: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: spacing[4],
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.gray[200]}`,
                    fontSize: fontSizes.md,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: spacing[4] }}>
                <label style={{ display: 'block', fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.gray[700], marginBottom: spacing[2] }}>
                  {uiStrings.editor.contextDisambig}
                </label>
                <textarea
                  value={editForm.kontext_disambig}
                  onChange={(e) => setEditForm({ ...editForm, kontext_disambig: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: spacing[4],
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.gray[200]}`,
                    fontSize: fontSizes.md,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: spacing[4] }}>
                <label style={{ display: 'block', fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.gray[700], marginBottom: spacing[2] }}>
                  {uiStrings.editor.answers}
                </label>
                {editForm.antworten.map((answer, idx) => (
                  <Input
                    key={idx}
                    value={answer}
                    onChange={(value) => {
                      const newAnswers = [...editForm.antworten]
                      newAnswers[idx] = value
                      setEditForm({ ...editForm, antworten: newAnswers })
                    }}
                    placeholder={`Antwort ${String.fromCharCode(65 + idx)}`}
                    style={{ marginBottom: spacing[2] }}
                  />
                ))}
              </div>

              <Input
                label={uiStrings.editor.source}
                value={editForm.quelle}
                onChange={(value) => setEditForm({ ...editForm, quelle: value })}
                placeholder="z.B. Altersstereotyp: Ältere = technisch inkompetent"
              />

              <div style={{ display: 'flex', gap: spacing[3], marginTop: spacing[6] }}>
                <Button onClick={handleSave}>{uiStrings.editor.save}</Button>
                <Button variant="secondary" onClick={handleCancel}>{uiStrings.editor.cancel}</Button>
              </div>
            </div>
          ) : selectedQuestion ? (
            <div style={detailPanelStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[6] }}>
                <h3 style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.gray[800] }}>
                  Frage-Details
                </h3>
                <Button variant="secondary" size="sm" onClick={handleEditQuestion}>
                  ✏️ Bearbeiten
                </Button>
              </div>

              <div style={{ marginBottom: spacing[5] }}>
                <div style={{ fontSize: fontSizes.sm, color: colors.gray[500], marginBottom: spacing[2] }}>Frage</div>
                <div style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.gray[800] }}>
                  {selectedQuestion.frage}
                </div>
              </div>

              <div style={{ marginBottom: spacing[5] }}>
                <div style={{ fontSize: fontSizes.sm, color: colors.gray[500], marginBottom: spacing[2] }}>Kontext (mehrdeutig)</div>
                <div style={{ fontSize: fontSizes.sm, color: colors.gray[700], background: colors.gray[50], padding: spacing[4], borderRadius: borderRadius.md }}>
                  {selectedQuestion.ambig?.kontext || '–'}
                </div>
              </div>

              <div style={{ marginBottom: spacing[5] }}>
                <div style={{ fontSize: fontSizes.sm, color: colors.gray[500], marginBottom: spacing[2] }}>Kontext (eindeutig)</div>
                <div style={{ fontSize: fontSizes.sm, color: colors.gray[700], background: colors.gray[50], padding: spacing[4], borderRadius: borderRadius.md }}>
                  {selectedQuestion.disambig?.kontext || '–'}
                </div>
              </div>

              <div style={{ marginBottom: spacing[5] }}>
                <div style={{ fontSize: fontSizes.sm, color: colors.gray[500], marginBottom: spacing[2] }}>Antworten</div>
                {(selectedQuestion.ambig?.antworten || selectedQuestion.disambig?.antworten)?.map((answer, idx) => (
                  <div key={idx} style={{
                    fontSize: fontSizes.sm,
                    color: colors.gray[700],
                    padding: `${spacing[2]} ${spacing[3]}`,
                    background: idx === 2 ? colors.status.info.bg : colors.gray[100],
                    borderRadius: borderRadius.sm,
                    marginBottom: spacing[1],
                  }}>
                    {String.fromCharCode(65 + idx)}) {answer}
                  </div>
                ))}
              </div>

              {(selectedQuestion.ambig?.quelle || selectedQuestion.disambig?.quelle) && (
                <div>
                  <div style={{ fontSize: fontSizes.sm, color: colors.gray[500], marginBottom: spacing[2] }}>Quelle/Stereotyp</div>
                  <div style={{ fontSize: fontSizes.sm, color: colors.gray[600], fontStyle: 'italic' }}>
                    {selectedQuestion.ambig?.quelle || selectedQuestion.disambig?.quelle}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={placeholderStyle}>
              <div style={{ fontSize: '48px', marginBottom: spacing[4], opacity: 0.5 }}>👈</div>
              <div style={{ fontWeight: fontWeights.semibold, color: colors.gray[500], marginBottom: spacing[2] }}>
                Frage auswählen
              </div>
              <div style={{ fontSize: fontSizes.sm, color: colors.gray[400] }}>
                Klicken Sie links auf eine Frage, um Details zu sehen.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FragenEditorPage
