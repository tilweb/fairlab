/**
 * Skript zum Extrahieren von Beispiel-Fragen aus den BBQ-Dateien
 * Konvertiert JSONL zu JSON im FairLab-Format
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BBQ_DIR = path.join(__dirname, '../data/bbq')
const OUTPUT_DIR = path.join(__dirname, '../src/data/questions-bbq')

// Mapping von BBQ-Dateinamen zu Kategorie-IDs
const FILE_TO_CATEGORY = {
  'Age.jsonl': 'age',
  'Disability_status.jsonl': 'disability',
  'Gender_identity.jsonl': 'gender',
  'Nationality.jsonl': 'nationality',
  'Race_ethnicity.jsonl': 'race',
  'Religion.jsonl': 'religion',
  'SES.jsonl': 'ses',
  'Sexual_orientation.jsonl': 'sexual-orientation',
  'Physical_appearance.jsonl': 'physical-appearance',
}

// Anzahl der Fragen-Paare pro Kategorie
const QUESTIONS_PER_CATEGORY = 50

function parseJSONL(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.trim().split('\n')
  return lines.map(line => JSON.parse(line))
}

function findStereotypeTarget(answerInfo) {
  // Finde welche Antwort das Stereotyp-Ziel ist
  for (const [key, value] of Object.entries(answerInfo)) {
    if (value[1] && ['old', 'disabled', 'female', 'lowSES', 'Muslim', 'Black', 'gay'].some(s =>
      value[1].toLowerCase().includes(s.toLowerCase())
    )) {
      return parseInt(key.replace('ans', ''))
    }
  }
  return 0 // Fallback
}

function convertToPairFormat(questions, categoryId) {
  // Gruppiere nach question_index (ambig und disambig gehören zusammen)
  const grouped = {}

  for (const q of questions) {
    const idx = q.question_index
    if (!grouped[idx]) {
      grouped[idx] = {}
    }
    grouped[idx][q.context_condition] = q
  }

  // Konvertiere zu FairLab-Format
  const converted = []
  let id = 1

  for (const [questionIdx, pair] of Object.entries(grouped)) {
    if (!pair.ambig || !pair.disambig) continue

    const ambig = pair.ambig
    const disambig = pair.disambig

    // Bestimme Stereotyp-Ziel
    const stereotypTarget = findStereotypeTarget(ambig.answer_info)

    converted.push({
      id: `${categoryId}_${String(id).padStart(3, '0')}`,
      kategorie: categoryId,
      kontext_ambig: ambig.context,
      kontext_disambig: disambig.context,
      frage: ambig.question,
      antworten: [ambig.ans0, ambig.ans1, ambig.ans2],
      korrekt_ambig: ambig.label,
      korrekt_disambig: disambig.label,
      stereotyp_ziel: stereotypTarget,
      quelle: ambig.additional_metadata?.source || 'BBQ Benchmark',
    })

    id++

    if (converted.length >= QUESTIONS_PER_CATEGORY) break
  }

  return converted
}

function main() {
  // Erstelle Output-Verzeichnis falls nicht vorhanden
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  console.log('Extrahiere BBQ-Beispiele...\n')

  for (const [filename, categoryId] of Object.entries(FILE_TO_CATEGORY)) {
    const filePath = path.join(BBQ_DIR, filename)

    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  ${filename} nicht gefunden, überspringe...`)
      continue
    }

    console.log(`  📄 Verarbeite ${filename}...`)

    try {
      const questions = parseJSONL(filePath)
      const converted = convertToPairFormat(questions, categoryId)

      const outputPath = path.join(OUTPUT_DIR, `${categoryId}.json`)
      fs.writeFileSync(outputPath, JSON.stringify(converted, null, 2))

      console.log(`     ✅ ${converted.length} Fragen-Paare extrahiert -> ${categoryId}.json`)
    } catch (error) {
      console.log(`     ❌ Fehler: ${error.message}`)
    }
  }

  console.log('\n✅ Fertig!')
}

main()
