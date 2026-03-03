// Fragen-Loader für verschiedene Testsets

// Import der deutschen Standard-Fragen
import alterQuestions from '../data/questions/alter.json'
import geschlechtQuestions from '../data/questions/geschlecht.json'
import behinderungQuestions from '../data/questions/behinderung.json'
import ethnieQuestions from '../data/questions/ethnie.json'
import religionQuestions from '../data/questions/religion.json'
import sexuelleIdentitaetQuestions from '../data/questions/sexuelle-identitaet.json'

// Import der englischen BBQ-Fragen
import bbqAgeQuestions from '../data/questions-bbq/age.json'
import bbqDisabilityQuestions from '../data/questions-bbq/disability.json'
import bbqGenderQuestions from '../data/questions-bbq/gender.json'
import bbqNationalityQuestions from '../data/questions-bbq/nationality.json'
import bbqRaceQuestions from '../data/questions-bbq/race.json'
import bbqReligionQuestions from '../data/questions-bbq/religion.json'
import bbqSesQuestions from '../data/questions-bbq/ses.json'
import bbqSexualOrientationQuestions from '../data/questions-bbq/sexual-orientation.json'
import bbqPhysicalAppearanceQuestions from '../data/questions-bbq/physical-appearance.json'

// Deutsche Fragen nach Kategorie
const germanQuestions = {
  'alter': alterQuestions,
  'geschlecht': geschlechtQuestions,
  'behinderung': behinderungQuestions,
  'ethnie': ethnieQuestions,
  'religion': religionQuestions,
  'sexuelle-identitaet': sexuelleIdentitaetQuestions,
}

// Englische BBQ-Fragen nach Kategorie
const bbqQuestions = {
  'age': bbqAgeQuestions,
  'disability': bbqDisabilityQuestions,
  'gender': bbqGenderQuestions,
  'nationality': bbqNationalityQuestions,
  'race': bbqRaceQuestions,
  'religion': bbqReligionQuestions,
  'ses': bbqSesQuestions,
  'sexual-orientation': bbqSexualOrientationQuestions,
  'physical-appearance': bbqPhysicalAppearanceQuestions,
}

// Testset-Zuordnung
const testSetQuestions = {
  'german-hr': germanQuestions,
  'bbq-english': bbqQuestions,
}

function getCustomQuestionsForCategory(category, customQuestionsByCategory = {}) {
  const questions = customQuestionsByCategory?.[category]
  return Array.isArray(questions) ? questions : []
}

/**
 * Konvertiert Fragen im "paired" Format (kontext_ambig/kontext_disambig)
 * zum internen "split" Format mit context_condition
 */
function convertPairedToSplitFormat(questions) {
  const converted = []

  for (const q of questions) {
    // Prüfe ob es das paired Format ist (hat kontext_ambig und kontext_disambig)
    if (q.kontext_ambig && q.kontext_disambig) {
      // Erstelle ambig Version
      converted.push({
        id: `${q.id}_ambig`,
        kategorie: q.kategorie,
        context_condition: 'ambig',
        kontext: q.kontext_ambig,
        frage: q.frage,
        antworten: q.antworten,
        korrekt_ambig: q.korrekt_ambig,
        korrekt_disambig: q.korrekt_disambig,
        stereotyp_ziel: q.stereotyp_ziel,
        quelle: q.quelle,
      })

      // Erstelle disambig Version
      converted.push({
        id: `${q.id}_disambig`,
        kategorie: q.kategorie,
        context_condition: 'disambig',
        kontext: q.kontext_disambig,
        frage: q.frage,
        antworten: q.antworten,
        korrekt_ambig: q.korrekt_ambig,
        korrekt_disambig: q.korrekt_disambig,
        stereotyp_ziel: q.stereotyp_ziel,
        quelle: q.quelle,
      })
    } else {
      // Bereits im split Format
      converted.push(q)
    }
  }

  return converted
}

/**
 * Lädt Fragen für eine Kategorie aus einem bestimmten Testset
 */
export function loadQuestionsByCategory(category, testSetId = 'german-hr', customQuestionsByCategory = {}) {
  const questionsMap = testSetQuestions[testSetId]
  if (!questionsMap) {
    console.warn(`Testset '${testSetId}' nicht gefunden`)
    return []
  }

  let standardQuestions = questionsMap[category] || []

  // BBQ Fragen sind im paired Format, konvertiere zu split Format
  if (testSetId === 'bbq-english') {
    standardQuestions = convertPairedToSplitFormat(standardQuestions)
  }

  // Benutzerdefinierte Fragen nur für deutsche Kategorien hinzufügen
  if (testSetId === 'german-hr') {
    const customQuestions = getCustomQuestionsForCategory(category, customQuestionsByCategory)
    return [...standardQuestions, ...customQuestions]
  }

  return standardQuestions
}

/**
 * Lädt alle Fragen für mehrere Kategorien aus einem Testset
 */
export function loadQuestions(categories, testSetId = 'german-hr', customQuestionsByCategory = {}) {
  const allQuestions = []

  for (const category of categories) {
    const questions = loadQuestionsByCategory(category, testSetId, customQuestionsByCategory)
    allQuestions.push(...questions)
  }

  return allQuestions
}

/**
 * Lädt eine zufällige Stichprobe von Fragen
 */
export function loadRandomQuestions(categories, countPerCategory, testSetId = 'german-hr', customQuestionsByCategory = {}) {
  const selectedQuestions = []

  for (const category of categories) {
    const questions = loadQuestionsByCategory(category, testSetId, customQuestionsByCategory)
    const shuffled = shuffleArray([...questions])
    const selected = shuffled.slice(0, Math.min(countPerCategory, shuffled.length))
    selectedQuestions.push(...selected)
  }

  return selectedQuestions
}

/**
 * Lädt Fragen und teilt sie in ambig/disambig auf
 */
export function loadQuestionsWithContext(categories, countPerCategory, testSetId = 'german-hr', customQuestionsByCategory = {}) {
  const allQuestions = []

  for (const category of categories) {
    const questions = loadQuestionsByCategory(category, testSetId, customQuestionsByCategory)

    // Finde Fragen-Paare (gleiche ID, verschiedene context_condition)
    const questionPairs = groupQuestionPairs(questions)

    // Wähle zufällige Paare
    const shuffledPairs = shuffleArray([...questionPairs])
    const selectedPairs = shuffledPairs.slice(0, Math.min(countPerCategory / 2, shuffledPairs.length))

    // Füge beide Varianten hinzu
    for (const pair of selectedPairs) {
      if (pair.ambig) allQuestions.push(pair.ambig)
      if (pair.disambig) allQuestions.push(pair.disambig)
    }
  }

  return shuffleArray(allQuestions)
}

/**
 * Gruppiert Fragen nach ihrem Basis-ID (ohne ambig/disambig Suffix)
 */
function groupQuestionPairs(questions) {
  const pairs = {}

  for (const question of questions) {
    // Extrahiere Basis-ID
    const baseId = question.id.replace(/_ambig|_disambig/g, '')

    if (!pairs[baseId]) {
      pairs[baseId] = {}
    }

    if (question.context_condition === 'ambig') {
      pairs[baseId].ambig = question
    } else {
      pairs[baseId].disambig = question
    }
  }

  return Object.values(pairs)
}

/**
 * Mischt ein Array zufällig (Fisher-Yates)
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * Gibt Statistiken über verfügbare Fragen für ein Testset zurück
 */
export function getQuestionStats(testSetId = 'german-hr', customQuestionsByCategory = {}) {
  const stats = {}
  const questionsMap = testSetQuestions[testSetId]

  if (!questionsMap) return stats

  for (const [category, questions] of Object.entries(questionsMap)) {
    const customQuestions = testSetId === 'german-hr'
      ? getCustomQuestionsForCategory(category, customQuestionsByCategory)
      : []

    stats[category] = {
      standard: questions.length,
      custom: customQuestions.length,
      total: questions.length + customQuestions.length,
      pairs: Math.floor(questions.length / 2) + Math.floor(customQuestions.length / 2),
    }
  }

  return stats
}

/**
 * Gibt die Gesamtzahl aller verfügbaren Fragen für ein Testset zurück
 */
export function getTotalQuestionCount(testSetId = 'german-hr', customQuestionsByCategory = {}) {
  const stats = getQuestionStats(testSetId, customQuestionsByCategory)
  return Object.values(stats).reduce((sum, cat) => sum + cat.total, 0)
}

/**
 * Gibt alle verfügbaren Kategorien für ein Testset zurück
 */
export function getAvailableCategories(testSetId = 'german-hr') {
  const questionsMap = testSetQuestions[testSetId]
  if (!questionsMap) return []
  return Object.keys(questionsMap)
}

/**
 * Validiert eine Frage gegen das Schema
 */
export function validateQuestion(question) {
  const errors = []

  if (!question.id) errors.push('ID fehlt')
  if (!question.kategorie) errors.push('Kategorie fehlt')
  if (!question.kontext_ambig) errors.push('Mehrdeutiger Kontext fehlt')
  if (!question.kontext_disambig) errors.push('Eindeutiger Kontext fehlt')
  if (!question.frage) errors.push('Frage fehlt')
  if (!question.antworten || question.antworten.length !== 3) {
    errors.push('Genau 3 Antworten erforderlich')
  }
  if (question.korrekt_ambig === undefined) errors.push('Korrekte Antwort (ambig) fehlt')
  if (question.korrekt_disambig === undefined) errors.push('Korrekte Antwort (disambig) fehlt')
  if (question.stereotyp_ziel === undefined) errors.push('Stereotyp-Ziel fehlt')

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Konvertiert eine Frage in das interne Format (ambig/disambig getrennt)
 */
export function convertToInternalFormat(question) {
  return [
    {
      id: `${question.id}_ambig`,
      kategorie: question.kategorie,
      context_condition: 'ambig',
      kontext: question.kontext_ambig,
      frage: question.frage,
      antworten: question.antworten,
      korrekt_ambig: question.korrekt_ambig,
      korrekt_disambig: question.korrekt_disambig,
      stereotyp_ziel: question.stereotyp_ziel,
      quelle: question.quelle,
    },
    {
      id: `${question.id}_disambig`,
      kategorie: question.kategorie,
      context_condition: 'disambig',
      kontext: question.kontext_disambig,
      frage: question.frage,
      antworten: question.antworten,
      korrekt_ambig: question.korrekt_ambig,
      korrekt_disambig: question.korrekt_disambig,
      stereotyp_ziel: question.stereotyp_ziel,
      quelle: question.quelle,
    },
  ]
}

export default {
  loadQuestionsByCategory,
  loadQuestions,
  loadRandomQuestions,
  loadQuestionsWithContext,
  getQuestionStats,
  getTotalQuestionCount,
  getAvailableCategories,
  validateQuestion,
  convertToInternalFormat,
}
