# Wer fährt?

Planer für die Fahrgemeinschaft zur Arbeit. Jeder trägt sich über den Link ein, ohne Anmeldung.

- `index.html` ist die Seite, ausgeliefert über GitHub Pages.
- `config.js` enthält die Adresse des Speichers.
- `apps-script/Code.gs` ist der Speicher. Er läuft als Apps Script in einer Google-Tabelle, die Daten stehen im Blatt „Daten“.

## Speicher einrichten (einmalig)

1. Neue Google-Tabelle anlegen, zum Beispiel „Fahrgemeinschaft“.
2. Erweiterungen → Apps Script. Den Inhalt von `apps-script/Code.gs` einfügen und speichern.
3. Bereitstellen → Neue Bereitstellung → Typ „Web-App“.
   Ausführen als: Ich. Zugriff: Jeder.
4. Zugriff erlauben und die Web-App-URL (endet auf `/exec`) in `config.js` eintragen.

Wird `Code.gs` später geändert: Bereitstellen → Bereitstellungen verwalten → Bearbeiten → Version „Neue Version“. Die URL bleibt gleich.
