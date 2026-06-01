# The Barbelo Prime Tree II – Visualization of OEIS Sequence A333489 (Anti-Run Compositions)

**Autorin / Author:** Nancy Jasmina Barbelo (insleben.com)  
**Entwicklung / Implementation:** Claude (Anthropic)  
**Datum / Date:** Juni 2026  
**Lizenz / License:** CC BY 4.0

---

## Beschreibung

Diese interaktive Visualisierung überlagert die OEIS-Folge **A333489** auf den Primzahlenbaum aus *Primzahlen Baum I* (DOI: https://doi.org/10.5281/zenodo.20475174).

Im Primzahlenbaum bilden Primzahlen den vertikalen Stamm, zusammengesetzte Zahlen formen abwechselnd rechts und links abstehende Äste — wie eine Fischgräte. Alle Zahlen der A333489-Folge werden zusätzlich **magenta** hervorgehoben, unabhängig davon ob Primzahl oder zusammengesetzte Zahl.

**A333489** enthält alle natürlichen Zahlen k, bei denen die k-te Komposition in Standardreihenfolge ein *Anti-Run* ist (keine zwei benachbarten gleichen Teile). Die Berechnung erfolgt direkt aus der Binärdarstellung von k.

Sequenzanfang: `0, 1, 2, 4, 5, 6, 8, 9, 12, 13, 16, 17, 18, 20, 22, 24, 25, 32, ...`

---

## Inhalt / Contents

| Datei | Beschreibung |
|---|---|
| `primzahlenbaum2.html` | Interaktive Visualisierung (HTML5/Canvas, keine externen Bibliotheken) |
| `abstract.html` | Wissenschaftliches Abstract — im Browser öffnen, dann als PDF drucken |
| `README.md` | Diese Datei |

---

## Nutzung / Usage

`primzahlenbaum2.html` direkt im Browser öffnen — keine Installation nötig.

- Schieberegler: Bereich 2–1000
- Linke Spalte: Überblick (scrollbar)
- Rechte Spalte: Zoom & Pan (Mausrad, Drag, Touch)
- Suchfeld: direktes Anspringen einer Zahl
- **Magenta** = Zahl ist in A333489

---

## Vorarbeit / Prior Work

Baut auf *Primzahlen Baum I* auf:  
Barbelo, N.J. & Claude (Anthropic). (2026). *Primzahlen Baum I.* Zenodo.  
https://doi.org/10.5281/zenodo.20475174

---

## Referenzen / References

- Sloane, N.J.A. et al., *The On-Line Encyclopedia of Integer Sequences*, A333489.  
  https://oeis.org/A333489
- Barbelo, N.J. & Claude (Anthropic). (2026). *Primzahlen Baum I.* Zenodo.  
  https://doi.org/10.5281/zenodo.20475174

---

## Lizenz / License

Creative Commons Attribution 4.0 International (CC BY 4.0)  
https://creativecommons.org/licenses/by/4.0/
