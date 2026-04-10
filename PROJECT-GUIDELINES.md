# Projekt-Guidelines – insleben.com / Barbelo

## 1. Technologie

- Ausschließlich **HTML, CSS und JavaScript** (Vanilla)
- Keine Frameworks, keine Build-Tools, keine Abhängigkeiten von Drittanbietern
- Kein serverseitiger Code (rein statische Website)

## 2. DSGVO-Konformität

- **Keine Cookies** – weder eigene noch von Drittanbietern
- **Keine externen Ressourcen zur Laufzeit** – keine Google Fonts, keine CDNs, kein externes Tracking
- **Kein Tracking** – kein Google Analytics, kein Facebook Pixel, keine Analyse-Tools
- **Keine eingebetteten Drittanbieter-Inhalte** (YouTube, Google Maps etc.) ohne Consent-Lösung
- **Kontaktformulare** (falls vorhanden): nur mit Datenschutzhinweis und ohne unnötige Datenerhebung
- **Impressum und Datenschutzerklärung** müssen auf jeder Seite erreichbar sein
- Keine Weitergabe personenbezogener Daten an Dritte

## 3. Schriftarten – Lokal installiert

- Google Fonts werden **lokal eingebunden**, nicht von Google-Servern nachgeladen
- Schriftdateien liegen im Ordner `fonts/` (WOFF2-Format bevorzugt)
- Einbindung per `@font-face` in CSS
- Aktuell verwendete Schriften:
  - **Cinzel** (400, 600) – für Überschriften, Button und Logo "Barbelo"
  - **Nunito Sans** (200, 300, 400) – für Fließtext (klar, geometrisch, rundes "a")
- **Kein Italic** – grundsätzlich keine kursive Schrift verwenden

## 4. Suchmaschinenoptimierung (SEO)

### Technisches SEO
- Semantisches HTML5 (`<header>`, `<main>`, `<nav>`, `<article>`, `<section>`, `<footer>`)
- Korrekte Heading-Hierarchie (`<h1>` bis `<h6>`)
- `<meta charset>`, `<meta viewport>`, `<meta description>`, `<meta robots>`
- `<title>` auf jeder Seite eindeutig und aussagekräftig
- `<html lang="de">` korrekt gesetzt
- Canonical-Tags auf jeder Seite
- Open Graph Meta-Tags (`og:title`, `og:description`, `og:image`, `og:url`)

### Performance
- Bilder optimiert (WebP bevorzugt, mit Fallback)
- Lazy Loading für Bilder unterhalb des sichtbaren Bereichs
- Minimale CSS- und JS-Dateien
- Keine render-blockierenden Ressourcen

### Struktur & Inhalte
- `sitemap.xml` im Root-Verzeichnis
- `robots.txt` im Root-Verzeichnis
- Strukturierte Daten (JSON-LD) für Person/Organisation
- Alt-Texte für alle Bilder
- Interne Verlinkung zwischen Seiten
- Mobile-First-Design (responsive)

### Core Web Vitals
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- Interaction to Next Paint (INP) < 200ms
