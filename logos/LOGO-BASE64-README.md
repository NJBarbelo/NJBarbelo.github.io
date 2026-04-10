# Barbelo Logo - Base64 Daten

## Übersicht
Die Datei `logo-base64.txt` enthält die Base64-kodierten Daten des Barbelo-Logos (`barbelo-logo.png`).

## Verwendung
Die Base64-Daten werden in allen 9 HTML-Seiten als Data URL eingebettet:
```html
<img src="data:image/png;base64,[BASE64_DATEN_HIER]" alt="Barbelo Logo" width="202" height="80" />
```

## Größe
- Original PNG: 130 KB
- Base64 Text: 177 KB

## Regenerieren der Base64-Daten
Falls die PNG-Datei aktualisiert wird, können die Base64-Daten mit diesem Befehl neu generiert werden:

```bash
cd "$(dirname "$0")"
base64 -i barbelo-logo.png | tr -d '\n' > logo-base64.txt
```

## Aktualisierung in HTML-Dateien
Um alle HTML-Dateien mit neuen Base64-Daten zu aktualisieren, kann dieses Python-Skript verwendet werden:

```python
import re

# Lese neue Base64-Daten
with open('logo-base64.txt', 'r') as f:
    base64_data = f.read().strip()

new_data_url = f"data:image/png;base64,{base64_data}"

files = ['index.html', 'blog.html', 'angebot.html', 'methodik.html', 'ueber-mich.html', 'impressum.html', 'datenschutz.html', 'gemeinsame-projekte.html', 'theorien.html']

for filename in files:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Ersetze nur die Data URL im header-logo
    content = re.sub(
        r'<div id="header-logo">.*?</div>',
        f'<div id="header-logo">\n      <img src="{new_data_url}" alt="Barbelo Logo" width="202" height="80" />\n    </div>',
        content,
        flags=re.DOTALL
    )
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ {filename}")
```

## Dateien
- `barbelo-logo.png` - Original PNG (130 KB)
- `logo-base64.txt` - Base64-kodierte Version (177 KB, ohne Zeilenumbrüche)

**Zuletzt aktualisiert:** 2026-04-08
