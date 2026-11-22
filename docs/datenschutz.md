# Datenschutz

Blutdruckwerte sind sensible Gesundheitsdaten. Der geplante Standard ist eine rein lokale Verarbeitung im Browser:

- Die eingegebenen Werte bleiben nur für den aktuellen Messablauf im Arbeitsspeicher.
- Es ist keine Übertragung an einen Server und keine dauerhafte Speicherung vorgesehen.
- Beim Neuladen oder Schließen der Seite gehen die aktuellen Werte verloren.
- Tracking, Analyse-Dienste und externe Einbindungen sind nicht vorgesehen.
- Die Anwendung kann die statischen Programmdateien im Browser-Cache für die Offline-Nutzung vorhalten. Messwerte werden nicht im Cache gespeichert.

Diese Angaben beschreiben das geplante Verhalten und müssen bei der Implementierung überprüft werden. Änderungen, etwa eine Exportfunktion oder dauerhafte Speicherung, erfordern eine bewusste Entscheidung und eine Aktualisierung dieser Dokumentation.
