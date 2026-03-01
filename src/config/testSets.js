// Konfiguration für verfügbare Testsets

export const testSets = [
  {
    id: 'german-hr',
    name: 'Deutsch (HR-Kontext)',
    description: 'Deutsche Testfragen für den HR-Bereich im DACH-Raum, basierend auf AGG-Kategorien',
    language: 'de',
    source: 'FairLab',
    categories: ['alter', 'geschlecht', 'behinderung', 'ethnie', 'religion', 'sexuelle-identitaet'],
    questionCount: '~200',
    isDefault: true,
  },
  {
    id: 'bbq-english',
    name: 'BBQ Original (Englisch)',
    description: 'Original BBQ Benchmark von Parrish et al. (2022) - englische Fragen zu verschiedenen Bias-Kategorien',
    language: 'en',
    source: 'NYU / ACL 2022',
    categories: ['age', 'disability', 'gender', 'nationality', 'race', 'religion', 'ses', 'sexual-orientation', 'physical-appearance'],
    questionCount: '~2000',
    isDefault: false,
  },
]

// Mapping von BBQ-Kategorien zu deutschen Anzeigenamen
export const bbqCategoryNames = {
  'age': { name: 'Alter', icon: '👴', color: '#3B82F6' },
  'disability': { name: 'Behinderung', icon: '♿', color: '#8B5CF6' },
  'gender': { name: 'Geschlecht', icon: '⚧️', color: '#EC4899' },
  'nationality': { name: 'Nationalität', icon: '🌍', color: '#F59E0B' },
  'race': { name: 'Ethnische Herkunft', icon: '🌏', color: '#10B981' },
  'religion': { name: 'Religion', icon: '🕊️', color: '#6366F1' },
  'ses': { name: 'Sozioökonomischer Status', icon: '💼', color: '#EF4444' },
  'sexual-orientation': { name: 'Sexuelle Orientierung', icon: '🏳️‍🌈', color: '#F472B6' },
  'physical-appearance': { name: 'Äußeres Erscheinungsbild', icon: '👤', color: '#14B8A6' },
}

export function getTestSetById(id) {
  return testSets.find(ts => ts.id === id)
}

export function getDefaultTestSet() {
  return testSets.find(ts => ts.isDefault) || testSets[0]
}

export function getCategoriesForTestSet(testSetId) {
  const testSet = getTestSetById(testSetId)
  if (!testSet) return []

  if (testSetId === 'german-hr') {
    // Deutsche Kategorien aus categories.js verwenden
    return testSet.categories
  }

  if (testSetId === 'bbq-english') {
    // BBQ-Kategorien mit Metadaten zurückgeben
    return testSet.categories.map(catId => ({
      id: catId,
      ...bbqCategoryNames[catId],
    }))
  }

  return testSet.categories
}
