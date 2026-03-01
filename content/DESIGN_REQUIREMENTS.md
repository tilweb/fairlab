# Design & Style Requirements für Adacor Apps

> Dieses Dokument beschreibt das Design-System, die Technologie und die UI-Patterns der KI-Wissen App. Es dient als Vorlage für die Entwicklung weiterer Apps im gleichen Stil (z.B. Nachhaltigkeitsbericht-App).

---

## 1. Tech-Stack

### Basis-Technologien
- **Framework**: React 18+
- **Routing**: React Router v6+
- **Sprache**: JavaScript (JSX) - keine TypeScript-Pflicht, aber TypeScript-kompatibel
- **Build-Tool**: Vite (bevorzugt) oder Create React App
- **Styling**: Inline Styles (kein CSS-Framework wie Tailwind)

### Keine externen UI-Libraries
- Kein Material UI, Chakra, Ant Design etc.
- Alle Komponenten sind custom-built
- Emojis als Icons (keine Icon-Libraries notwendig)

### Datei-Struktur
```
src/
├── components/          # Wiederverwendbare Komponenten
│   ├── Layout.tsx       # Haupt-Layout mit Header, Sidebar, Content
│   ├── Header.tsx       # Top-Navigation
│   ├── Sidebar.tsx      # Seitennavigation mit Modulen
│   └── LessonWrapper.tsx # Wrapper für Content-Seiten
├── pages/
│   ├── HomePage.tsx     # Startseite/Dashboard
│   └── lessons/         # Einzelne Inhaltsseiten
├── visualizations/      # Interaktive Visualisierungs-Komponenten
├── config/
│   └── modules.ts       # Modul- und Lektions-Konfiguration
├── assets/              # Logos, Bilder
└── App.tsx              # Router-Konfiguration
```

---

## 2. Farbschema

### Modul-Farben (jeweils eine Hauptfarbe pro Themenbereich)
```javascript
const moduleColors = {
  purple: '#8b5cf6',   // Grundlagen, Technisches
  orange: '#f59e0b',   // Prozesse, Methoden
  green: '#22c55e',    // Praxis, Umsetzung, Positives
  blue: '#3b82f6',     // Systeme, Technologie
  red: '#ef4444',      // Regulierung, Risiken, Warnungen
  cyan: '#06b6d4',     // Datenschutz, Sicherheit
  pink: '#ec4899',     // Organisation, Strategie
  indigo: '#6366f1',   // Spezial-Themen
  teal: '#14b8a6',     // Nachhaltigkeit, Umwelt
};
```

### Graustufen (für Texte und Hintergründe)
```javascript
const grays = {
  50: '#f8fafc',   // Hellster Hintergrund
  100: '#f1f5f9',  // Leichter Hintergrund
  200: '#e2e8f0',  // Borders, Divider
  300: '#cbd5e1',  // Disabled, Placeholder
  400: '#94a3b8',  // Sekundärer Text
  500: '#64748b',  // Muted Text
  600: '#475569',  // Body Text
  700: '#334155',  // Starker Text
  800: '#1e293b',  // Headings
  900: '#0f172a',  // Dunkelster Text
};
```

### Status-Farben
```javascript
const statusColors = {
  success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
  warning: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
  error: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
  info: { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
};
```

### Farbverwendung mit Transparenz
- Hintergrund mit 10% Deckkraft: `${farbe}10` (z.B. `#8b5cf610`)
- Hintergrund mit 15% Deckkraft: `${farbe}15`
- Border mit 30% Deckkraft: `${farbe}30`

---

## 3. Typografie

### Schriftart
```css
font-family: '"Source Sans Pro", "Segoe UI", sans-serif'
```

### Schriftgrößen
```javascript
const fontSizes = {
  xs: '10px',    // Labels, Tags
  sm: '12px',    // Kleine Texte, Hinweise
  base: '13px',  // Standard Body
  md: '14px',    // Body Text
  lg: '15px',    // Größerer Body
  xl: '16px',    // Subheadings
  '2xl': '18px', // Section Headings
  '3xl': '20px', // Card Titles
  '4xl': '24px', // Page Headings
};
```

### Font Weights
- `400` - Normal (Body)
- `600` - Semi-Bold (Subheadings, Labels)
- `700` - Bold (Headings, wichtige Elemente)

---

## 4. Abstände & Größen

### Spacing-System
```javascript
const spacing = {
  1: '4px',
  2: '6px',
  3: '8px',
  4: '10px',
  5: '12px',
  6: '14px',
  7: '16px',
  8: '20px',
  9: '24px',
  10: '30px',
  11: '40px',
  12: '50px',
};
```

### Border Radius
```javascript
const borderRadius = {
  sm: '4px',    // Tags, kleine Elemente
  md: '6px',    // Buttons, Inputs
  lg: '8px',    // Kleine Cards
  xl: '10px',   // Medium Cards
  '2xl': '12px', // Icon-Container
  '3xl': '14px', // Cards
  '4xl': '16px', // Große Cards
  '5xl': '20px', // Panels, Container
  full: '9999px', // Pills, runde Elemente
};
```

---

## 5. Layout-Patterns

### Haupt-Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header (Logo + Navigation)                      60px Höhe  │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   Sidebar    │              Content Area                    │
│   280px      │              (flex: 1)                       │
│              │                                              │
│   - Module   │    ┌─────────────────────────────────┐      │
│   - Lektionen│    │  Tabs (optional)                │      │
│              │    ├─────────────────────────────────┤      │
│              │    │                                 │      │
│   ─────────  │    │  Main Content                   │      │
│   Promotion  │    │  (max-width: 1000-1200px)       │      │
│   Box        │    │                                 │      │
│              │    └─────────────────────────────────┘      │
└──────────────┴──────────────────────────────────────────────┘
```

### Content-Container
```javascript
const contentContainer = {
  maxWidth: '1000px',  // Standard
  // oder '1100px', '1200px' für breitere Inhalte
  margin: '0 auto',
  padding: '40px 20px',
};
```

### Zwei-Spalten-Layout mit Detail-Panel
```javascript
// WICHTIG: Immer festes Layout, nicht dynamisch!
const twoColumnLayout = {
  display: 'grid',
  gridTemplateColumns: '1fr 450px', // oder '1fr 480px', '1fr 500px'
  gap: '20px',
  alignItems: 'start',
};

// Inner Grid für Cards
const cardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)', // Immer 2 Spalten
  gap: '16px',
};
```

---

## 6. Komponenten-Patterns

### Tabs
```jsx
const tabs = [
  { id: 'tab1', label: '📊 Tab Eins' },
  { id: 'tab2', label: '📈 Tab Zwei' },
];

// Tab-Button Style
const tabButtonStyle = (isActive) => ({
  padding: '12px 20px',
  background: isActive ? '#fff' : 'transparent',
  border: 'none',
  borderBottom: isActive ? '3px solid #8b5cf6' : '3px solid transparent',
  fontSize: '14px',
  fontWeight: isActive ? '600' : '500',
  color: isActive ? '#8b5cf6' : '#64748b',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});
```

### Klickbare Cards
```jsx
const cardStyle = (isSelected, farbe) => ({
  background: isSelected ? `${farbe}15` : '#fff',
  borderRadius: '16px',
  padding: '20px',
  border: isSelected ? `2px solid ${farbe}` : '1px solid #e2e8f0',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});
```

### Icon-Container
```jsx
const iconContainer = (farbe) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: farbe,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
});
```

### Detail-Panel
```jsx
const detailPanel = (farbe) => ({
  background: '#fff',
  borderRadius: '20px',
  padding: '24px',
  border: `2px solid ${farbe}`,
  position: 'sticky',
  top: '20px',
});
```

### Placeholder-Box (wenn nichts ausgewählt)
```jsx
const placeholderBox = {
  background: '#f1f5f9',
  borderRadius: '20px',
  padding: '40px 24px',
  border: '2px dashed #cbd5e1',
  textAlign: 'center',
  position: 'sticky',
  top: '20px',
};

// Inhalt:
<div style={placeholderBox}>
  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>👈</div>
  <div style={{ fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>
    Element auswählen
  </div>
  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
    Klicken Sie links auf ein Element, um Details zu sehen.
  </div>
</div>
```

### Gradient-Header-Box
```jsx
const gradientHeader = (farbe1, farbe2) => ({
  background: `linear-gradient(135deg, ${farbe1}, ${farbe2})`,
  borderRadius: '16px',
  padding: '20px',
  border: '1px solid ...',
  marginBottom: '30px',
  textAlign: 'center',
});
```

### Status-Badge / Tag
```jsx
const badge = (type) => {
  const colors = {
    success: { bg: '#dcfce7', text: '#166534' },
    warning: { bg: '#fef3c7', text: '#92400e' },
    error: { bg: '#fee2e2', text: '#991b1b' },
  };
  return {
    display: 'inline-block',
    padding: '4px 10px',
    background: colors[type].bg,
    color: colors[type].text,
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
  };
};
```

---

## 7. Interaktionsmuster

### State-Management für Auswahl
```jsx
const [selectedItem, setSelectedItem] = useState(null);
const selectedItemData = selectedItem
  ? items.find(i => i.id === selectedItem)
  : null;

// Toggle-Logik beim Klicken
onClick={() => setSelectedItem(
  selectedItem === item.id ? null : item.id
)}
```

### Ternary für Detail-Panel vs. Placeholder
```jsx
{selectedItemData ? (
  <DetailPanel data={selectedItemData} />
) : (
  <PlaceholderBox />
)}
```

---

## 8. Sidebar-Struktur

### Modul-Konfiguration
```typescript
interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  path: string;
}

interface Module {
  id: string;
  title: string;
  icon: string;      // Emoji
  color: string;     // Hex-Farbe
  description: string;
  lessons: Lesson[];
}
```

### Sidebar-Elemente
1. **Logo** (oben)
2. **Module** (aufklappbar, mit Lektionen)
3. **Promotion-Box** (unten, optional)
4. **Footer-Links** (Impressum, Datenschutz)

---

## 9. Responsive Verhalten

### Breakpoints
```javascript
const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1280px',
};
```

### Mobile-Anpassungen
- Sidebar wird zu Hamburger-Menü
- Zwei-Spalten-Layout wird zu einer Spalte
- Cards in voller Breite
- Detail-Panel unter den Cards (nicht nebeneinander)

---

## 10. Animation & Transitions

### Standard-Transition
```javascript
transition: 'all 0.2s ease'
```

### Hover-Effekte
- Cards: Leichter Schatten oder Border-Änderung
- Buttons: Hintergrund-Änderung
- Links: Farb-Änderung

### Loading-Spinner
```jsx
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      border: '4px solid #e2e8f0',
      borderTopColor: '#8b5cf6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <span style={{ color: '#64748b', fontSize: '14px' }}>Laden...</span>
  </div>
);
```

---

## 11. Spezielle Visualisierungen

### Tabellen
```jsx
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
};

const thStyle = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #e2e8f0',
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
};

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid #e2e8f0',
  color: '#334155',
};
```

### Info-Boxen
```jsx
const infoBox = (type) => ({
  padding: '16px 20px',
  borderRadius: '12px',
  background: type === 'info' ? '#dbeafe' : '#f0fdf4',
  border: `1px solid ${type === 'info' ? '#93c5fd' : '#86efac'}`,
});
```

### Timeline / Prozess-Schritte
```jsx
// Horizontale Verbindungslinie
<div style={{
  height: '4px',
  background: 'linear-gradient(90deg, #color1, #color2, #color3)',
  borderRadius: '2px',
}} />

// Schritte darunter als Buttons/Cards
```

---

## 12. Beispiel: Neue Seite erstellen

```jsx
import React, { useState } from 'react';

const NeueLektionsSeite = () => {
  const [activeTab, setActiveTab] = useState('tab1');
  const [selectedItem, setSelectedItem] = useState(null);

  const items = [
    { id: 'item1', name: 'Element 1', icon: '📊', farbe: '#8b5cf6', ... },
    // ...
  ];

  const selectedItemData = selectedItem
    ? items.find(i => i.id === selectedItem)
    : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: '"Source Sans Pro", sans-serif',
      padding: '40px 20px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1>Seitentitel</h1>
        <p>Beschreibung</p>
      </div>

      {/* Tabs */}
      <div style={{ /* Tab-Container */ }}>
        {/* Tab-Buttons */}
      </div>

      {/* Content mit Two-Column Layout */}
      {activeTab === 'tab1' && (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 450px',
            gap: '20px',
            alignItems: 'start'
          }}>
            {/* Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              {items.map(item => (
                <Card key={item.id} ... />
              ))}
            </div>

            {/* Detail Panel oder Placeholder */}
            {selectedItemData ? (
              <DetailPanel data={selectedItemData} />
            ) : (
              <PlaceholderBox />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NeueLektionsSeite;
```

---

## 13. Branding-Elemente

### Adacor Solutions
- **Team-Kontakt**: Adacor Solutions Team
- **E-Mail**: solutions@adacor.com
- **Workplace-Link**: workplace.adacor.com

### Kontakt-Box (CTA)
```jsx
<div style={{
  maxWidth: '800px',
  margin: '60px auto 0',
  textAlign: 'center',
  padding: '40px',
  background: 'linear-gradient(135deg, #color1, #color2)',
  borderRadius: '24px',
  border: '1px solid #borderColor'
}}>
  <h3>Interesse an [Produkt]?</h3>
  <p>Beschreibungstext</p>
  <a href="mailto:solutions@adacor.com" style={{
    display: 'inline-block',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #color1, #color2)',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '16px'
  }}>
    📧 Kontakt aufnehmen
  </a>
  <div style={{ marginTop: '16px', fontSize: '14px' }}>
    Adacor Solutions Team · solutions@adacor.com
  </div>
</div>
```

---

## 14. Checkliste für neue App

- [ ] React-Projekt mit Vite erstellen
- [ ] React Router einrichten
- [ ] Layout-Komponenten erstellen (Header, Sidebar, Content)
- [ ] Modul-Konfiguration anlegen
- [ ] Farbschema definieren (themenspezifisch)
- [ ] Basis-Styles als Konstanten
- [ ] Erste Seiten mit Tabs und Cards
- [ ] Detail-Panel-Pattern implementieren
- [ ] Placeholder-Boxen hinzufügen
- [ ] Responsive Anpassungen
- [ ] Branding (Logo, Kontakt-Box)
