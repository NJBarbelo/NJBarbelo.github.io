# NJBarbelo.github.io - Projektdokumentation

## 📋 Projektübersicht
Website für Nancy Jasmina Barbelo (insleben.com) - Therapeutin, Coach und spirituelle Begleiterin.

## 🌳 Git-Workflow

### Aktueller Development Branch
```
Branch: claude/add-skills-page-GlmJR
Status: ✅ Aktiv
```

**Wichtig:** Immer auf diesem Branch arbeiten, um mit den neuesten Änderungen aktuell zu bleiben.

### Branch-Strategie
- `main` = Produktiver Branch (nur fertige Features)
- `claude/add-skills-page-GlmJR` = Aktueller Development Branch
- Alle Änderungen zuerst hier testen, dann auf main mergen

## 📁 Projektstruktur

```
NJBarbelo.github.io/
├── index.html              # Root Homepage
├── pages/                  # Alle Seiten
│   ├── angebot.html
│   ├── blog.html
│   ├── datenschutz.html
│   ├── fähigkeiten.html    # ✨ Neu - Fähigkeiten-Seite
│   ├── gemeinsame-projekte.html
│   ├── impressum.html
│   ├── methodik.html
│   ├── neu-gedacht.html
│   ├── theorien.html
│   └── ueber-mich.html
├── assets/                 # Medien-Dateien
│   ├── Lebenslauf2026.pdf
│   └── LebenslaufZeitachse.pdf
├── logos/                  # Logo-Dateien
├── fonts/                  # Web-Fonts
└── CLAUDE.md              # Diese Datei
```

## ✅ Aktuelle Features

### Fähigkeiten-Seite (In Progress)
- ✅ Neue Seite: `pages/fähigkeiten.html`
- ✅ Tabelle mit 3 Spalten: Fähigkeit | Erklärung | Konkretes
- ✅ 15 Fähigkeiten dokumentiert (Innovation, 3D-Design, IoT, etc.)
- ✅ PDF-Links eingebettet:
  - `assets/LebenslaufZeitachse.pdf`
  - `assets/Lebenslauf2026.pdf`
- ✅ Navigation auf allen Seiten aktualisiert
- ✅ Logo korrekt eingebettet (BASE64)

### Navigation (Alle Seiten)
Konsistente Reihenfolge:
```
Angebot | Methodik | Theorien | Neu gedacht | Blog | Projekte | Fähigkeiten | Über mich
```

## 🎨 Design-System

- **Fonts:** Cinzel (Headlines), Nunito Sans (Body)
- **Farben:**
  - Gold: `#c9a84c`
  - Turquoise: `#3fd6c8`
  - Background: `#000000`
  - Text: `#f0ece4`

## 📝 Wichtige Hinweise

### GitHub Workflows
1. Immer `git pull` vor dem Starten einer neuen Sitzung
2. Änderungen auf `claude/add-skills-page-GlmJR` committen
3. Mit `git push` zum Remote pushen
4. Keine großen Dateien im Root-Verzeichnis (benutze `/assets/`)

### PDF-Handling
- PDFs liegen in `/assets/`
- Links in HTML: `../assets/[Dateiname].pdf`
- Dateinamen sollten ohne Umlaute und Leerzeichen sein

### Logo
- Logo wird als BASE64 direkt im HTML eingebettet
- **Nicht** als externe Datei referenzieren

## 🔄 Für nächste Sitzungen

1. Checkliste beim Start:
   - `git status` - Aktuellen Status prüfen
   - `git pull origin claude/add-skills-page-GlmJR` - Neueste Änderungen holen
   - Branch überprüfen: `git branch`

2. Vor dem Commit:
   - `git diff` - Änderungen reviewen
   - Aussagekräftige Commit-Messages schreiben
   - Mit Session-Link enden: `https://claude.ai/code/session_[ID]`

3. Nach Änderungen:
   - `git push origin claude/add-skills-page-GlmJR`

## 📚 Ressourcen

- Projektrichtlinien: `PROJECT-GUIDELINES.md`
- Struktur-Übersicht: `STRUKTUR.md`
- Repository: https://github.com/NJBarbelo/NJBarbelo.github.io

---

**Letztes Update:** 15. April 2026
**Status:** Fähigkeiten-Seite abgeschlossen ✅
