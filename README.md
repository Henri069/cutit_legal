# Kadenz — Website und Rechtsseiten

Statische Seiten: die Landingpage, die FAQ und die vier Rechtstexte, alle in **fünf Sprachen** —
Deutsch als verbindliche Fassung, Englisch, Französisch, Spanisch und Italienisch als
Übersetzungen. Dazu eine Weiche unter `/download`.

Dieser Ordner ist ein **eigenes, öffentliches Repo**. Der App-Code liegt im privaten Repo
`Henri069/bike_edit` (Ordner `../app`) und ist hier nicht enthalten.

## Ein Ordner, zwei Hoster

Derselbe Ordner wird an zwei Stellen ausgeliefert, mit **identischen Dateien**:

| Ziel | Wer liest es | Warum es bleiben muss |
|---|---|---|
| `henri069.github.io/cutit_legal` (GitHub Pages) | **jede installierte App-Fassung** | Die URLs stehen in `app/src/models/config.ts` und in beiden Stores. Verschwinden sie, zeigt jede App eine tote Datenschutzseite. |
| `kadenz.info` (Hostinger) | Menschen, Creator, Suchmaschinen | Die eigentliche Website. |

**Deshalb gibt es die Rechtstexte genau EINMAL.** Zwei Kopien in zwei Repos driften auseinander,
und eine veraltete Datenschutzerklärung ist ein Rechtsproblem, kein Schönheitsfehler.

`privacy.html`, `terms.html` und `delete-account.html` **bewegen sich nie** — weder Dateiname noch
Ordner. Alles andere darf sich ändern.

## Aufbau

```
index.html            Landingpage        ← war früher die Rechts-Übersicht
faq.html              Häufige Fragen
privacy.html          Datenschutzerklärung
terms.html            Nutzungsbedingungen
delete-account.html   Konto und Daten löschen
impressum.html        Impressum nach §5 DDG
download/index.html   Weiche: erkennt iOS/Android und leitet in den Store
style.css             gemeinsames Styling; der Kadenz-Look ganz unten unter `body.site`
assets/               Logo, Hero-Video, Vibe-Videos, Poster
en/ fr/ es/ it/       je Landingpage, FAQ und die vier Rechtstexte
fristen.json          die Fristen als Zahlen — eine Quelle für alle Seiten
check.mjs             prüft alles: `node check.mjs`
```

## `/download` — der Link, den man verschickt

`kadenz.info/download` erkennt das Betriebssystem und leitet direkt weiter:
Android in den Play Store, iPhone und iPad in den App Store, alles andere zeigt
beide Knöpfe. **Ein eigener Ordner, damit `/download` ohne Server-Regel
funktioniert** — sowohl GitHub Pages als auch Hostinger liefern für einen Ordner
automatisch die `index.html` aus.

- **Sie trägt den Kanal mit.** `\?c=tiktok` hängt sich an beide Store-Links
  (`ct=tiktok` bei Apple, `utm_source=tiktok` bei Play). Ein Link je Creator ist
  damit ein Wort, keine zwei handgebauten Store-URLs.
- **Ohne JavaScript kein Problem:** Die beiden Knöpfe stehen fest im HTML, die
  Weiterleitung kommt erst danach. Die Seite ist nie eine Sackgasse.
- **iPadOS meldet sich als „Macintosh".** Nur die zusätzliche Prüfung auf
  `navigator.maxTouchPoints > 1` unterscheidet ein iPad von einem echten Mac.
  Ohne sie bekäme jedes iPad die Desktop-Ansicht statt des App Store.
- **`location.replace`, nicht `href`.** Sonst steht die Seite im Verlauf, und der
  Zurück-Knopf im Store wirft den Nutzer sofort wieder hierher.
- Die Seite trägt `noindex` und ist **nicht** in `check.mjs`: sie hat keinen
  eigenen Inhalt und keine Sprachleiste, ihre Texte kommen aus
  `navigator.language`.

**`index.html` war die Rechts-Übersicht und ist jetzt die Landingpage.** Das ist gefahrlos: keine
App-Fassung ruft diese Seite auf — verlinkt werden ausschließlich `terms`, `privacy` und
`delete-account`. Ihre alte Aufgabe, auf die vier Rechtstexte zu zeigen, übernimmt die Fußzeile.

**Der Kadenz-Look greift nur unter `body.site`.** Die vier Rechtsseiten laden dieselbe `style.css`
und sehen unverändert aus: schmal, nüchtern, Systemschrift. Wer im Marketing-Teil etwas ändert,
kann die Rechtsseiten nicht versehentlich mitverändern.

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

Zwei Prüfungen mit verschiedener Strenge, weil die Seiten verschiedene Aufgaben haben.

**Die vier Rechtsseiten** (`SEITEN`), in allen fünf Sprachen: jeder Sprachordner hat dieselben
Seiten · `<html lang>` passt zum Ordner · die Sprachleiste führt in jede Sprache auf eine Seite,
die es gibt · jede nicht-deutsche Fassung trägt den Vorrang-Hinweis (`class="… binding"`) · jede
mit `data-frist` markierte Zahl stimmt mit `fristen.json` überein · dieselbe Seite trägt in allen
Sprachen dasselbe Stand-Datum.

**Landingpage und FAQ** (`MARKETING_SEITEN`), in allen fünf Sprachen: Sprachleiste vorhanden ·
jede verlinkte Sprachfassung existiert wirklich · jede `data-frist` stimmt. Kein Stand-Datum, kein
Vorrang-Hinweis — beide tragen keinen Rechtsinhalt.

**Wer eine Sprache ergänzt, trägt sie in `MARKETING_SPRACHEN` ein.** Danach verlangt die Prüfung
sofort die Dateien und die Sprachleiste dazu — nicht andersherum.

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

## Zu Hostinger kopieren (kadenz.info)

Reines HTML, CSS, Bilder und Videos. **Kein Build, kein Server, kein Framework** — auch die
Animationen sind CSS und laufen auf jedem statischen Hoster gleich.

1. Im hPanel den **Dateimanager** öffnen (oder FTP/SFTP benutzen).
2. In den Ordner der Domain wechseln: `public_html/` bei der Hauptdomain.
3. **Den gesamten Inhalt dieses Ordners** hineinlegen — Dateien und Unterordner:
   `index.html`, `faq.html`, `privacy.html`, `terms.html`, `delete-account.html`,
   `impressum.html`, `style.css`, `assets/`, `download/`, `en/`, `fr/`, `es/`, `it/`.
4. `README.md`, `check.mjs` und `fristen.json` braucht der Server nicht. Sie schaden auch nicht,
   nur `check.mjs` und `fristen.json` sind dann öffentlich lesbar — beides enthält nichts
   Geheimes.

Danach prüfen: `kadenz.info` zeigt die Landingpage, `kadenz.info/faq.html` die FAQ,
`kadenz.info/fr/` die französische Fassung, `kadenz.info/download` leitet auf dem Handy in den
Store weiter, und alle Fußzeilen-Links antworten.

**Die alten GitHub-Pages-URLs bleiben trotzdem online.** Sie sind der Vertrag mit jeder
installierten App. Wer sie abschaltet, bricht die Datenschutzseite in jeder Fassung, die gerade
auf einem fremden Gerät liegt.

### Wenn ein Video nicht abspielt

Manche Hoster liefern `.mp4` ohne den passenden Typ aus. Dann hilft eine `.htaccess` neben den
Dateien:

```apache
AddType video/mp4 .mp4
```

## Die URLs für die Stores

**Diese fünf zeigen weiter auf GitHub Pages, nicht auf kadenz.info.** Sie stehen so in App
Store Connect, bei Google Play und in `app/src/models/config.ts`; sie umzustellen wäre eine
eigene Runde mit einem neuen App-Build (siehe CLAUDE.md, „abwärtskompatibel ausrollen").

Erreichbar unter `https://henri069.github.io/cutit_legal/`:

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
