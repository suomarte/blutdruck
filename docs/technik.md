# Technisches Konzept

## Stand und Umfang

Die Anwendung ist noch nicht implementiert. Vorgesehen ist eine reine Frontend-Anwendung mit Vite und TypeScript, zunächst ohne zusätzliche UI-Bibliothek oder Backend. Ein vorhandenes Blutdruckmessgerät wird nicht angebunden; Messwerte werden manuell erfasst.

Der geplante Ablauf ist in [ablauf.md](ablauf.md) beschrieben. Der Anwendungscode soll später unter `src/` liegen.

## Zustände und Zeitmessung

- Die Anwendung unterscheidet Hinweise, Ruhephase, Messung, Pause und Ergebnis.
- Während des Messablaufs werden die aktuelle Messungsnummer und die eingegebenen Werte im Arbeitsspeicher gehalten.
- Die Ruhephase beginnt erst mit dem Start-Button. Eine Pause beginnt nach Übernahme der ersten beziehungsweise zweiten Messung.
- Timer sollen anhand eines Endzeitpunkts statt durch bloßes Zählen von Intervallen berechnet werden. So bleibt die Anzeige nach einem Tabwechsel korrekt.
- Die jeweilige nächste Messung darf erst nach Ablauf des zugehörigen Timers beginnen.

## Eingaben und Ergebnis

- Für jede Messung sind systolischer und diastolischer Wert erforderlich. Eingaben müssen vor dem Weitergehen gültig sein.
- Es sollen keine starren medizinischen Grenzwerte verwendet werden, um Messwerte zurückzuweisen.
- Der Mittelwert wird getrennt für systolischen und diastolischen Wert aus den Messungen 2 und 3 berechnet.
- Die Darstellung und Rundung des Mittelwerts sind vor der Implementierung festzulegen.

## Bedienbarkeit

Die Anwendung soll auf unterschiedlichen Bildschirmgrößen lesbar und mit der Tastatur bedienbar sein. Beschriftungen, Fehlermeldungen, Fortschritt und Timerstatus sollen verständlich und barrierearm vermittelt werden.

## Geplante Prüfung

- Ruhe-Timer startet erst nach Betätigung und dauert fünf Minuten.
- Die einminütigen Pausen starten nach den ersten beiden Messungen; ein Tabwechsel verfälscht den Timer nicht.
- Unvollständige oder ungültige Eingaben verhindern das Weitergehen.
- Genau drei Messungen führen zum Ergebnis; beide Mittelwerte verwenden nur Messungen 2 und 3.
- Tastaturbedienung und verständliche Status- und Fehlermeldungen werden geprüft.

Konkrete Build- und Testbefehle werden ergänzt, sobald die Werkzeuge eingerichtet sind.
