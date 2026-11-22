# Hinweise für KI-Assistenten

## Projekt

Dieses Projekt plant eine rein clientseitige Anwendung zur Unterstützung von drei manuellen Blutdruckmessungen. Maßgeblich für den vorgesehenen Ablauf sind [README.md](README.md) und die Dokumente in [docs/](docs/).

## Arbeitsweise

- Änderungen auf die jeweilige Aufgabe beschränken und bestehende Dokumentation bei Bedarf aktualisieren.
- Keine Diagnose, Therapieempfehlung oder medizinische Bewertung ergänzen. Medizinische Hinweise anhand vertrauenswürdiger Quellen prüfen.
- Messwerte vertraulich behandeln. Keine Übertragung, dauerhafte Speicherung, Analyse- oder Tracking-Dienste ohne ausdrückliche Entscheidung einführen.
- Die Anwendung soll ohne Backend auskommen. Neue Abhängigkeiten und Abweichungen vom technischen Konzept begründen.
- Barrierefreiheit und verständliche deutschsprachige Bedienung berücksichtigen.
- Bei der späteren Implementierung die in [docs/technik.md](docs/technik.md) beschriebenen Kernabläufe testen.

## Aktueller Stand

Die Anwendung ist als ausführbare Vite-/TypeScript-Frontend-Anwendung umgesetzt. Sie wird mit `npm run dev` entwickelt, mit `npm run build` gebaut und mit `npm test` geprüft. Der Produktions-Build wird über GitHub Pages veröffentlicht.
