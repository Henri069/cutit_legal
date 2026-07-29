# BikeEdit — Rechtsseiten

Statische Seiten für GitHub Pages: Datenschutz, Nutzungsbedingungen, Löschanfragen und Impressum.
Zweisprachig, Deutsch als verbindliche Fassung, Englisch als Übersetzung.

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
en/                   englische Fassungen (imprint.html statt impressum.html)
```

## Vor der Veröffentlichung erledigen

Die Seiten enthalten gelb umrandete `.todo`-Kästen. Jeder markiert eine Stelle, die noch geklärt
werden muss. Nach dem Klären den ganzen `<div class="todo">…</div>`-Block löschen, **in beiden
Sprachfassungen**.

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
