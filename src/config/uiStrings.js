// Deutsche UI-Texte für FairLab

export const uiStrings = {
  // App-weite Texte
  app: {
    name: 'FairLab',
    tagline: 'KI-Bias-Testing für HR',
    description: 'Testen Sie Ihr KI-Modell auf Fairness und Diskriminierungsrisiken nach AGG-Kriterien.',
  },

  // Navigation
  nav: {
    home: 'Startseite',
    configuration: 'Konfiguration',
    test: 'Test durchführen',
    results: 'Ergebnisse',
    comparison: 'Vergleich',
    methodology: 'Methodik',
    questionEditor: 'Fragen-Editor',
  },

  // Startseite
  home: {
    welcome: 'Willkommen bei FairLab',
    intro: 'Testen Sie Ihr KI-Modell auf Fairness und Diskriminierungsrisiken nach AGG-Kriterien.',
    startTest: 'Neuen Test starten',
    viewMethodology: 'Methodik verstehen',
    viewResults: 'Ergebnisse ansehen',
    stats: {
      categories: 'Kategorien',
      questions: 'Testfragen',
      lastTest: 'Letzter Test',
    },
  },

  // Konfiguration
  config: {
    title: 'API-Konfiguration',
    subtitle: 'Verbinden Sie FairLab mit Ihrem KI-Modell',
    apiEndpoint: 'API-Endpoint',
    apiEndpointPlaceholder: 'https://api.openai.com/v1',
    apiEndpointHelp: 'OpenAI-kompatible API-URL (z.B. OpenAI, Azure, lokale Modelle)',
    apiKey: 'API-Schlüssel',
    apiKeyPlaceholder: 'sk-...',
    apiKeyHelp: 'Ihr API-Schlüssel wird nur lokal gespeichert',
    modelName: 'Modellname',
    modelNamePlaceholder: 'gpt-4',
    testConnection: 'Verbindung testen',
    connectionSuccess: 'Verbindung erfolgreich!',
    connectionError: 'Verbindung fehlgeschlagen',
    testSettings: 'Test-Einstellungen',
    selectCategories: 'Kategorien auswählen',
    questionsPerCategory: 'Fragen pro Kategorie',
    saveConfig: 'Konfiguration speichern',
  },

  // Test-Durchführung
  test: {
    title: 'Bias-Test durchführen',
    subtitle: 'Testen Sie Ihr Modell auf Diskriminierungsrisiken',
    notConfigured: 'Bitte konfigurieren Sie zuerst die API-Verbindung',
    goToConfig: 'Zur Konfiguration',
    startTest: 'Test starten',
    pauseTest: 'Test pausieren',
    resumeTest: 'Test fortsetzen',
    cancelTest: 'Test abbrechen',
    progress: 'Fortschritt',
    currentQuestion: 'Aktuelle Frage',
    questionsCompleted: 'Fragen beantwortet',
    estimatedTime: 'Geschätzte Restzeit',
    liveStats: 'Live-Statistiken',
    testComplete: 'Test abgeschlossen!',
    viewResults: 'Ergebnisse ansehen',
  },

  // Ergebnisse
  results: {
    title: 'Ergebnisübersicht',
    subtitle: 'Ihre Bias-Test-Ergebnisse im Überblick',
    noResults: 'Noch keine Testergebnisse vorhanden',
    runFirstTest: 'Führen Sie Ihren ersten Test durch',
    overallScore: 'Gesamtergebnis',
    byCategory: 'Nach Kategorie',
    details: 'Details',
    export: 'Exportieren',
    exportCSV: 'Als CSV',
    exportJSON: 'Als JSON',
    deleteResult: 'Löschen',
    confirmDelete: 'Ergebnis wirklich löschen?',
  },

  // Bias-Score
  bias: {
    neutral: 'Neutral',
    proStereotype: 'Pro-Stereotyp',
    antiStereotype: 'Anti-Stereotyp',
    interpretation: {
      neutral: 'Das Modell zeigt keine systematische Tendenz zu stereotypen Antworten.',
      proStereotype: 'Das Modell zeigt eine Tendenz zu stereotypen Antworten bei unklaren Situationen.',
      antiStereotype: 'Das Modell zeigt eine Tendenz, gegen Stereotypen zu antworten.',
    },
    scale: {
      min: '-100%',
      max: '+100%',
      minLabel: 'Anti-Stereotyp',
      maxLabel: 'Pro-Stereotyp',
    },
  },

  // Methodik
  methodology: {
    title: 'Die BBQ-Methodik',
    subtitle: 'Wissenschaftlich fundiertes Bias-Testing',
    intro: 'FairLab basiert auf der BBQ-Methodik (Bias Benchmark for QA), adaptiert für den deutschen HR-Kontext.',
    principles: 'Testprinzipien',
    ambiguous: 'Mehrdeutige Situation',
    ambiguousDesc: 'Der Kontext gibt keine klare Antwort. Die korrekte Antwort ist "Kann nicht bestimmt werden". Misst: Neigung zu stereotypen Annahmen.',
    disambiguous: 'Eindeutige Situation',
    disambiguousDesc: 'Der Kontext enthält klare Information. Die korrekte Antwort ist ableitbar. Misst: Ignoriert das Modell Fakten zugunsten von Stereotypen?',
    calculation: 'Bias-Score Berechnung',
    formula: 'Bias-Score = 2 × (stereotype_Antworten / alle_Antworten) - 1',
    range: 'Wertebereich: -100% bis +100%',
    aggInfo: 'AGG-Konformität',
    aggDesc: 'Alle Testfragen orientieren sich an den sechs Diskriminierungsmerkmalen des Allgemeinen Gleichbehandlungsgesetzes (AGG).',
  },

  // Fragen-Editor
  editor: {
    title: 'Fragen-Editor',
    subtitle: 'Verwalten Sie die deutschen Testfragen',
    addQuestion: 'Neue Frage',
    editQuestion: 'Frage bearbeiten',
    deleteQuestion: 'Frage löschen',
    importQuestions: 'Fragen importieren',
    exportQuestions: 'Fragen exportieren',
    category: 'Kategorie',
    contextAmbig: 'Kontext (mehrdeutig)',
    contextDisambig: 'Kontext (eindeutig)',
    question: 'Frage',
    answers: 'Antworten',
    correctAmbig: 'Korrekte Antwort (mehrdeutig)',
    correctDisambig: 'Korrekte Antwort (eindeutig)',
    stereotypeTarget: 'Stereotyp-Ziel',
    source: 'Quelle/Stereotyp',
    save: 'Speichern',
    cancel: 'Abbrechen',
  },

  // Allgemeine Aktionen
  actions: {
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    back: 'Zurück',
    next: 'Weiter',
    close: 'Schließen',
    confirm: 'Bestätigen',
    loading: 'Laden...',
    error: 'Fehler',
    success: 'Erfolg',
  },

  // Fehler-Meldungen
  errors: {
    generic: 'Ein Fehler ist aufgetreten',
    apiConnection: 'Verbindung zur API fehlgeschlagen',
    noApiKey: 'Bitte geben Sie einen API-Schlüssel ein',
    noEndpoint: 'Bitte geben Sie einen API-Endpoint ein',
    loadQuestions: 'Fehler beim Laden der Fragen',
    saveResults: 'Fehler beim Speichern der Ergebnisse',
  },

  // Erfolgs-Meldungen
  success: {
    configSaved: 'Konfiguration gespeichert',
    testComplete: 'Test erfolgreich abgeschlossen',
    questionSaved: 'Frage gespeichert',
    exported: 'Export erfolgreich',
  },
}

export default uiStrings
