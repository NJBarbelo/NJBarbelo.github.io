# 📁 Projektstruktur - insleben.com

## Überblick

```
insleben2026HTML/
├── pages/                          # 📄 Alle HTML-Seiten
│   ├── index.html                 # Landing Page
│   ├── blog.html                  # Blog & Inspirationen
│   ├── angebot.html               # Angebote
│   ├── methodik.html              # Methodik
│   ├── ueber-mich.html            # Über mich
│   ├── impressum.html             # Impressum
│   ├── datenschutz.html           # Datenschutz
│   ├── gemeinsame-projekte.html   # Gemeinsame Projekte
│   └── theorien.html              # Theorien & Konzepte
│
├── logos/                          # 🖼️  Logo Assets
│   ├── barbelo-logo.png           # Original PNG (130 KB)
│   ├── logo-base64.txt            # Base64-kodierte Version (174 KB)
│   ├── LOGO-BASE64-README.md      # Dokumentation
│   └── update-logo-base64.py      # Script zur Aktualisierung
│
├── fonts/                          # 🔤 Schriftarten (lokal)
│   ├── cinzel-*.woff2
│   └── nunito-sans-*.woff2
│
├── PROJECT-GUIDELINES.md           # 📋 Projektrichtlinien
├── sitemap.xml                     # 🗺️  SEO Sitemap
├── robots.txt                      # 🤖 Robots Meta
└── STRUKTUR.md                     # 📖 Diese Datei
```

## 🔄 Navigation zwischen Seiten

Alle HTML-Seiten im `pages/` Ordner verwenden relative Links zueinander:
```html
<!-- Von pages/blog.html zu pages/angebot.html: -->
<a href="angebot.html">Angebot</a>

<!-- Von index.html zu anderen Seiten: -->
<a href="ueber-mich.html">Über mich</a>
```

## 🖼️  Logo-Verwaltung

Das Barbelo-Logo wird als **Data URL eingebettet** (Base64) in allen HTML-Seiten.

### Logo aktualisieren:

1. **Neue PNG speichern**: `logos/barbelo-logo.png` ersetzen
2. **Script ausführen**:
   ```bash
   cd logos/
   python3 update-logo-base64.py
   ```
3. **Cache leeren**: `Ctrl+Shift+R` im Browser

Das Script wird automatisch:
- ✅ Base64-Daten regenerieren
- ✅ Alle 9 HTML-Seiten aktualisieren
- ✅ `logo-base64.txt` aktualisieren

## 🔗 Wichtige Links

- **Original PNG**: `logos/barbelo-logo.png` (130 KB)
- **Base64 Data**: `logos/logo-base64.txt` (174 KB)
- **Update Script**: `logos/update-logo-base64.py`
- **Dokumentation**: `logos/LOGO-BASE64-README.md`

## 📱 Öffnen der Seiten lokal

```bash
# Mit Python HTTP Server:
cd ..
python3 -m http.server 8000

# Dann im Browser:
# http://localhost:8000/pages/index.html
```

## ✅ Checkliste für Änderungen

Wenn Sie etwas ändern:

- [ ] HTML in `pages/` aktualisieren
- [ ] Logo in `logos/` aktualisieren? → `update-logo-base64.py` ausführen
- [ ] Links überprüfen (sollten relativ sein)
- [ ] Browser-Cache leeren (`Ctrl+Shift+R`)
- [ ] Auf mehreren Seiten testen

## 📝 Dateigröße-Referenz

| Datei | Größe | Format |
|-------|-------|--------|
| barbelo-logo.png | 130 KB | PNG (Original) |
| logo-base64.txt | 174 KB | Text (Base64 ohne Zeilenumbrüche) |
| HTML-Seite (mit eingebetteter Base64) | ~250 KB | HTML |

## 🎯 Zukünftige Verbesserungen

- [ ] Assets (CSS, JS) in separate Ordner organisieren
- [ ] ASSETS Ordner für Bilder, Ikonen, etc.
- [ ] Build-Script für Produktion
- [ ] Minification der HTML/CSS/JS

**Zuletzt aktualisiert:** 2026-04-08
