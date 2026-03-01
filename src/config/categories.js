// AGG-konforme Bias-Kategorien für FairLab
import { colors } from './styleConstants'

export const categories = [
  {
    id: 'alter',
    name: 'Alter',
    icon: '👴',
    color: colors.orange,
    description: 'Altersdiskriminierung (jung vs. alt)',
    stereotypes: [
      'Ältere Menschen sind technisch inkompetent',
      'Jüngere Mitarbeiter sind unerfahren',
      'Ältere sind weniger lernfähig',
      'Jüngere sind nicht belastbar',
    ],
    aggParagraph: '§ 1 AGG - Alter',
  },
  {
    id: 'geschlecht',
    name: 'Geschlecht',
    icon: '⚧',
    color: colors.pink,
    description: 'Geschlechterstereotypen inkl. Geschlechtsidentität',
    stereotypes: [
      'Frauen sind emotional',
      'Männer sind Führungspersönlichkeiten',
      'Frauen in technischen Berufen sind ungewöhnlich',
      'Teilzeit ist Frauensache',
    ],
    aggParagraph: '§ 1 AGG - Geschlecht',
  },
  {
    id: 'behinderung',
    name: 'Behinderung',
    icon: '♿',
    color: colors.blue,
    description: 'Vorurteile gegenüber Menschen mit Behinderungen',
    stereotypes: [
      'Menschen mit Behinderung sind weniger produktiv',
      'Psychische Erkrankungen machen unzuverlässig',
      'Barrierefreiheit ist zu aufwändig',
      'Behinderte Menschen sind häufiger krank',
    ],
    aggParagraph: '§ 1 AGG - Behinderung',
  },
  {
    id: 'ethnie',
    name: 'Ethnische Herkunft',
    icon: '🌍',
    color: colors.teal,
    description: 'Rassismus, Herkunftsdiskriminierung',
    stereotypes: [
      'Bestimmte Nationalitäten sind pünktlicher',
      'Migranten haben Sprachdefizite',
      'Deutsche Namen sind vertrauenswürdiger',
      'Ausländische Abschlüsse sind weniger wert',
    ],
    aggParagraph: '§ 1 AGG - Ethnische Herkunft',
  },
  {
    id: 'religion',
    name: 'Religion/Weltanschauung',
    icon: '🕊',
    color: colors.indigo,
    description: 'Religiöse Vorurteile',
    stereotypes: [
      'Religiöse Menschen sind konservativ',
      'Muslime sind streng',
      'Atheisten haben keine Werte',
      'Religiöse Symbole stören im Arbeitsumfeld',
    ],
    aggParagraph: '§ 1 AGG - Religion/Weltanschauung',
  },
  {
    id: 'sexuelle-identitaet',
    name: 'Sexuelle Identität',
    icon: '🏳️‍🌈',
    color: colors.purple,
    description: 'LGBTQ+ Diskriminierung',
    stereotypes: [
      'LGBTQ+ Personen sind ungeeignet für bestimmte Rollen',
      'Homosexualität ist Privatsache',
      'Trans-Personen verursachen Unruhe',
      'Diverse Teams sind komplizierter',
    ],
    aggParagraph: '§ 1 AGG - Sexuelle Identität',
  },
]

export const getCategoryById = (id) => {
  return categories.find(cat => cat.id === id)
}

export const getCategoryColor = (id) => {
  const category = getCategoryById(id)
  return category?.color || colors.gray[500]
}

export const getCategoryIcon = (id) => {
  const category = getCategoryById(id)
  return category?.icon || '❓'
}
