# Blutdruckmessung

Geplant ist eine reine Frontend-Anwendung, die durch drei Blutdruckmessungen mit einem vorhandenen Oberarm-Blutdruckmessgerät führt. Die Messwerte werden manuell eingegeben. Die Anwendung stellt keine Diagnose und ersetzt keine ärztliche Beratung.

## Status

Eine erste ausführbare Version ist umgesetzt. Sie läuft vollständig im Browser, verarbeitet Messwerte nur im Arbeitsspeicher und benötigt kein Backend.

## Entwicklung

```bash
npm install
npm run dev
```

Für einen Produktions-Build:

```bash
npm run build
```

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

Das Verzeichnis `src/` ist für den späteren Anwendungscode vorgesehen.
