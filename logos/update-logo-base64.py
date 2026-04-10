#!/usr/bin/env python3
"""
Script zur Aktualisierung der Base64-Logo-Daten in allen HTML-Seiten

Verwendung:
  1. Die barbelo-logo.png Datei aktualisieren (falls gewünscht)
  2. Dieses Script ausführen: python3 update-logo-base64.py
  3. Die HTML-Dateien werden automatisch aktualisiert

Dies ist nützlich, wenn das Logo geändert wird und alle Seiten aktualisiert werden sollen.
"""

import os
import re
from pathlib import Path

def update_logo_base64():
    """Aktualisiert die Base64-Logo-Daten in allen HTML-Seiten"""

    script_dir = Path(__file__).parent
    os.chdir(script_dir)

    print("🔄 Aktualisiere Base64-Logo-Daten...\n")

    # 1. Regeneriere Base64 aus PNG
    print("1️⃣  Konvertiere barbelo-logo.png zu Base64...")
    os.system('base64 -i barbelo-logo.png | tr -d "\\n" > logo-base64.txt')

    # 2. Lese die Base64-Daten
    with open('logo-base64.txt', 'r') as f:
        base64_data = f.read().strip()

    print(f"   ✅ Base64 erstellt ({len(base64_data)} Zeichen)\n")

    # 3. Erstelle die Data URL
    data_url = f"data:image/png;base64,{base64_data}"

    # 4. Aktualisiere alle HTML-Dateien (im pages/ Verzeichnis)
    pages_dir = Path(__file__).parent.parent / 'pages'
    files = [
        'index.html',
        'blog.html',
        'angebot.html',
        'methodik.html',
        'ueber-mich.html',
        'impressum.html',
        'datenschutz.html',
        'gemeinsame-projekte.html',
        'theorien.html'
    ]

    print("2️⃣  Aktualisiere HTML-Dateien:\n")

    for filename in files:
        try:
            filepath = pages_dir / filename
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Ersetze nur die Data URL im header-logo div
            # Pattern: <div id="header-logo"> ... </div>
            pattern = r'<div id="header-logo">.*?</div>'
            replacement = f'''<div id="header-logo">
      <img src="{data_url}" alt="Barbelo Logo" width="202" height="80" />
    </div>'''

            new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)

            print(f"   ✅ {filename}")
        except Exception as e:
            print(f"   ❌ {filename}: {e}")

    print("\n✨ Fertig! Alle HTML-Dateien wurden aktualisiert.")
    print("💡 Tipp: Browser-Cache leeren (Ctrl+Shift+R) um die Änderungen zu sehen.")

if __name__ == '__main__':
    update_logo_base64()
