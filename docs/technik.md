# Technisches Konzept

## Stand und Umfang

Die Anwendung ist als reine Frontend-Anwendung mit Vite und TypeScript umgesetzt, ohne zusätzliche UI-Bibliothek oder Backend. Ein vorhandenes Blutdruckmessgerät wird nicht angebunden; Messwerte werden manuell erfasst. Der Produktions-Build wird über GitHub Actions auf GitHub Pages veröffentlicht.

Der geplante Ablauf ist in [ablauf.md](ablauf.md) beschrieben. Der Anwendungscode liegt unter `src/`.
Die Ablauflogik liegt unabhängig von der DOM-Darstellung in `src/measurement-flow.ts` und wird automatisiert getestet.

## Home-Bildschirm und App-Icon

Die Anwendung stellt ein Web-App-Manifest mit `display: standalone` und eigenem App-Icon bereit. Auf iOS Safari erfolgt die Einrichtung manuell über das Teilen-Symbol in der Safari-Browserleiste und „Zum Home-Bildschirm“; ein Teilen-Menü der Webanwendung öffnet dafür nicht das passende Safari-Menü.

## Zustände und Zeitmessung

- Die Anwendung unterscheidet Hinweise, Ruhephase, Messung, Pause und Ergebnis.
- Während des Messablaufs werden die aktuelle Messungsnummer und die eingegebenen Werte im Arbeitsspeicher gehalten.
- Die Ruhephase beginnt erst mit dem Start-Button. Eine Pause beginnt nach Übernahme der ersten beziehungsweise zweiten Messung.
- Timer sollen anhand eines Endzeitpunkts statt durch bloßes Zählen von Intervallen berechnet werden. So bleibt die Anzeige nach einem Tabwechsel korrekt.
- Die jeweilige nächste Messung darf erst nach Ablauf des zugehörigen Timers beginnen.
- Nach Ablauf der Ruhephase oder einer Pause wechselt die Anwendung automatisch zum nächsten Schritt.
- Bei einem Tabwechsel, einer Gerätesperre oder einer vorübergehenden Browser-Pause läuft der Timer anhand des Endzeitpunkts weiter. Nach der Rückkehr wird der abgelaufene Zustand freigegeben.
- Timerabläufe und automatische Zustandswechsel müssen als verständliche Statusänderung und für Screenreader angekündigt werden.

## Eingaben und Ergebnis

- Für jede Messung sind systolischer und diastolischer Wert erforderlich. Eingaben müssen vor dem Weitergehen gültig sein.
- Akzeptiert werden ganze Zahlen von 0 bis 300 mmHg. Diese technische Eingabeprüfung stellt keine medizinische Bewertung dar.
- Der Mittelwert wird getrennt für systolischen und diastolischen Wert aus den Messungen 2 und 3 berechnet.
- Die Mittelwerte werden auf ganze mmHg gerundet und ohne zusätzliche medizinische Bewertung angezeigt.
- Ein expliziter Neustart-Button setzt den Ablauf zurück.
- Beim Neuladen oder Verlassen der Seite werden keine Messwerte gespeichert und nicht wiederhergestellt.
- Wartephasen können bewusst über den Button „Wartephase überspringen“ verkürzt werden.
- „Neu starten“ setzt den Ablauf bewusst ohne zusätzliche Bestätigung zurück.

## Bedienbarkeit

Die erste Version richtet sich an aktuelle Mobil- und Desktop-Browser. Die Anwendung soll auf unterschiedlichen Bildschirmgrößen lesbar und mit der Tastatur bedienbar sein. Sie orientiert sich an WCAG 2.2 AA; dazu gehören insbesondere verständliche Beschriftungen, sichtbare Fokuszustände, Fehlermeldungen, Fortschritts- und Timerstatus sowie geeignete Statusansagen.

## Geplante Prüfung

- Ruhe-Timer startet erst nach Betätigung und dauert fünf Minuten.
- Die einminütigen Pausen starten nach den ersten beiden Messungen; ein Tabwechsel verfälscht den Timer nicht.
- Unvollständige oder ungültige Eingaben verhindern das Weitergehen.
- Genau drei Messungen führen zum Ergebnis; beide Mittelwerte verwenden nur Messungen 2 und 3.
- Timer laufen auch nach Tabwechsel oder Gerätesperre anhand des Endzeitpunkts korrekt weiter und wechseln danach automatisch zum nächsten Schritt.
- Tastaturbedienung, Fokusführung sowie verständliche Status- und Fehlermeldungen einschließlich Screenreader-Ansagen werden geprüft.
- Die Anwendung registriert einen einfachen Service Worker, damit die bereits geladene Anwendung auch ohne Netzwerkverbindung geöffnet werden kann. Messwerte bleiben weiterhin ausschließlich im Arbeitsspeicher.

Der Produktions-Build wird mit `npm run build` erstellt. Der automatische Deploy ist in `.github/workflows/deploy-pages.yml` definiert und läuft bei Pushes auf `main`.
