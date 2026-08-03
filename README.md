# BikeEdit — Rechtsseiten

Statische Seiten für GitHub Pages: Datenschutz, Nutzungsbedingungen, Löschanfragen und Impressum.
**Fünf Sprachen** — Deutsch als verbindliche Fassung, Englisch, Französisch, Spanisch und
Italienisch als Übersetzungen.

Dieser Ordner ist ein **eigenes, öffentliches Repo**. Der App-Code liegt im privaten Repo
`Henri069/bike_edit` (Ordner `../app`) und ist hier nicht enthalten.

## Aufbau

```
index.html            Übersicht (DE)
privacy.html          Datenschutzerklärung
terms.html            Nutzungsbedingungen
delete-account.html   Konto und Daten löschen
impressum.html        Impressum nach §5 DDG
style.css             gemeinsames Styling, Light und Dark
en/ fr/ es/ it/       die vier Übersetzungen, gleiche Dateinamen
fristen.json          die Fristen als Zahlen — eine Quelle für alle Seiten
check.mjs             prüft die 25 Seiten: `node check.mjs`
```

**Deutsch liegt in der WURZEL, nicht unter `/de/`.** Das ist die verbindliche Fassung und genau
die URL, die in App Store Connect und bei Google Play eingetragen ist. GitHub Pages kennt keine
Weiterleitungsregeln, nur Dateien — ein Umzug wäre eine 404 in der Review.

**Die Dateinamen sind in jedem Ordner gleich**, auch `impressum.html`. Das ist die eine
Eigenschaft, die den Sprachumschalter und `check.mjs` mechanisch macht. `en/imprint.html` ist nur
noch eine Weiterleitung für alte Links. Titel und Überschrift sind natürlich übersetzt.

## Vor dem Pushen

```bash
node check.mjs
```

Prüft: jeder Sprachordner hat dieselben fünf Seiten · `<html lang>` passt zum Ordner · die
Sprachleiste führt in jede Sprache auf eine Seite, die es gibt · jede nicht-deutsche Rechtsseite
trägt den Vorrang-Hinweis (`class="… binding"`) · jede mit `data-frist` markierte Zahl stimmt mit
`fristen.json` überein · dieselbe Seite hat in allen Sprachen dasselbe Stand-Datum.

**Die Zahlen stehen auch im Code.** `supabase/functions/_shared/fristen.test.ts` im App-Repo
vergleicht `fristen.json` gegen `EXPORT_URL_TTL_SEC`, `PENDING_TTL_DAYS` und `EXPORT_REFILL_SEC`.
Der Test überspringt sich, wenn dieser Ordner nicht daneben liegt.

**Fett gesetzte App-Knöpfe tragen `data-app="…"`.** Der Wert ist der Schlüssel im Sprachbündel der
App (`app/src/i18n/locales/*.ts`). Wer einen Knopf in der App umbenennt, benennt ihn hier mit.

## Vor der Veröffentlichung erledigen

Die früher hier beschriebenen gelben `.todo`-Kästen sind **alle weg**. Offen bleiben diese Punkte:

Offene Punkte:

1. **Rohclips auf dem Render-Server** werden nach dem Rendern nicht automatisch gelöscht.
   Entweder Aufräum-Job ergänzen oder die Speicherdauer in der Datenschutzerklärung anpassen.
2. **Serverstandort** von Supabase und Render-Server eintragen. Außerhalb der EU braucht es
   zusätzlich die Grundlage für den Drittlandtransfer.
3. **Anonyme Kennung in der App anzeigen**, damit Löschanfragen per E-Mail zuordenbar sind.
4. **Impressumsdaten prüfen.** Sie stammen aus dem CollectIt-Projekt. Der Paketname
   `de.iandsons.bikeedit` deutet möglicherweise auf eine andere Firmierung hin.
5. **Anwaltlich prüfen lassen**, besonders Haftung und Musik in den Nutzungsbedingungen.

## Repo anlegen und veröffentlichen

```bash
cd /Users/henri_irmscher/Code/bike_edit/legal && git add -A && git commit -m "BikeEdit legal pages" && git branch -M main && git remote add origin https://github.com/Henri069/DEIN-REPO.git && git push -u origin main
```

Danach auf GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `root`**.

## Die URLs für die Stores

Nach dem Aktivieren von GitHub Pages erreichbar unter `https://henri069.github.io/DEIN-REPO/`:

| Zweck | URL |
|---|---|
| Google Play, Datenschutzerklärung | `…/privacy.html` |
| Google Play, Account-Löschung | `…/delete-account.html` |
| App Store, Privacy Policy URL | `…/privacy.html` |
| App Store, EULA / Terms | `…/terms.html` |
| Impressum | `…/impressum.html` |

## Änderungen

Bei jeder Änderung an der App prüfen, ob die Datenschutzerklärung noch stimmt, und das
Stand-Datum oben auf den Seiten aktualisieren.
