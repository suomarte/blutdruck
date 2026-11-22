# Blutdruckmessung

Die reine Frontend-Anwendung führt durch drei Blutdruckmessungen mit einem vorhandenen Oberarm-Blutdruckmessgerät. Die Messwerte werden manuell eingegeben. Die Anwendung stellt keine Diagnose und ersetzt keine ärztliche Beratung.

## Status

Eine erste ausführbare Version ist umgesetzt. Sie läuft vollständig im Browser, verarbeitet Messwerte nur im Arbeitsspeicher und benötigt kein Backend.

Die Anwendung wird nach jedem Push auf `main` automatisch über GitHub Pages veröffentlicht:

<https://suomarte.github.io/blutdruck/>

Auf dem iPhone kann die Anwendung über Safari und „Teilen“ → „Zum Home-Bildschirm“ für den Start ohne Safari-Leiste eingerichtet werden. Safari zeigt anschließend das eigene Blutdruck-Icon an.

## Entwicklung

```bash
npm install
npm run dev
```

Für einen Produktions-Build:

```bash
npm run build
```

Der Produktions-Build liegt anschließend im Verzeichnis `dist/`. Die GitHub-Actions-Konfiguration für den automatischen Pages-Deploy befindet sich unter `.github/workflows/deploy-pages.yml`.

## Geplanter Ablauf

1. Allgemeine Hinweise zur Vorbereitung lesen.
2. Eine fünfminütige Ruhephase starten und die Manschette anlegen.
3. Drei Messungen durchführen und die Werte eingeben; zwischen den Messungen jeweils eine Minute pausieren.
4. Alle Messwerte und den Durchschnitt der zweiten und dritten Messung ansehen.

## Dokumentation

- [Messablauf](docs/ablauf.md)
- [Technisches Konzept](docs/technik.md)
- [Datenschutz](docs/datenschutz.md)
- [Hinweise für KI-Assistenten](AGENTS.md)

Der Anwendungscode liegt unter `src/`.
