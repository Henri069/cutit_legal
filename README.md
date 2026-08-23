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

## Die Videos: was neu kodiert wird und was nicht

In `assets/` liegen zwei Sorten, und sie werden **unterschiedlich behandelt**.

| Datei | Quelle | Ergebnis |
|---|---|---|
| `hero-<lang>.mp4` | `prototype/out/store/preview-<lang>.mp4` (886x1920, 9,2 Mbit/s) | **886x1920**, 18,9 s, ~6,5 MB |
| `vibe-<name>.mp4` | die Full-HD-Renders (1080x1920, ~10 Mbit/s), **nicht im Repo** | **900x1600**, 11 s, ~5,0 MB |

**Die Quelle fuer die Vibes ist NICHT `app/assets/vibes/`.** Die Dateien dort
sind nur 640x1010 - das reicht der App knapp und der Website gar nicht. Sie
werden auf dem Handy ueber 331 CSS-Punkte gezeigt, auf einem 3x-Display also
993 Geraetepunkte; aus 640 hochgerechnet ist das sichtbar weich. (Die App zeigt
sie sogar ueber die volle Bildschirmbreite, dort sind es 1,76x - auch dort sind
sie zu klein, das ist aber eine eigene Abwaegung ueber die Bundle-Groesse.)

Genommen werden stattdessen die **Full-HD-Renders in 1080x1920**. Sie liegen
bewusst nicht im Repo: 23 MB pro Stueck, und gebraucht wird nur das Ergebnis.

**Warum nichts hochskaliert und nichts unnoetig neu kodiert wird:**

- Der **Held** wird auf 262 CSS-Punkten gezeigt, auf 3x also 786. Bei 886 Punkten
  Quellbreite ist jede Verkleinerung sichtbar weich, deshalb bleibt er nativ.
  Die 9,2 Mbit/s der Quelle sind fuers App-Store-Review ueberprovisioniert.
- Die **Vibes** gehen von 1080 auf 900 herunter (deckt 3x auf dem Handy fast
  ganz ab) und sind auf **11 Sekunden** gekuerzt. Sie sollen den Schnittstil
  zeigen, und der ist sofort da; die Abschlusskarte am Ende fuehrt schon das
  Held-Video vor. Die vollen 18 Sekunden waeren 10 MB je Karte gewesen, und
  eine Rotation von 57 Sekunden sieht ohnehin niemand zu Ende.
- **Kein zweiter Durchlauf ueber eine bereits komprimierte Datei.** Die alten
  640er-Vibes noch einmal hochwertig zu kodieren machte sie *groesser* (5,0 statt
  3,8 MB) und das Bild trotzdem nicht besser - verlorene Details kommen nicht
  zurueck. Deshalb immer von der Full-HD-Quelle aus.

Neu bauen:

```bash
# Held, je Sprache. KEIN -vf scale.
ffmpeg -i ../prototype/out/store/preview-de.mp4 -c:v libx264 -preset slow -crf 25 \\
  -pix_fmt yuv420p -profile:v high -movflags +faststart -an assets/hero-de.mp4
ffmpeg -ss 1.2 -i ../prototype/out/store/preview-de.mp4 -frames:v 1 -q:v 3 assets/hero-de.jpg

# Vibes, aus der Full-HD-Quelle. 11 s, auf 900 Punkte.
ffmpeg -t 11 -i <hype-full-hd>.mp4 -vf "scale=900:-2" -c:v libx264 -preset slow -crf 28 \\
  -pix_fmt yuv420p -profile:v high -movflags +faststart -an assets/vibe-hype.mp4
ffmpeg -ss 0.8 -i <hype-full-hd>.mp4 -frames:v 1 -vf "scale=900:-2" -q:v 3 assets/vibe-hype.jpg
```

**Das Kartenformat muss zum Video passen.** `.vibe .frame` steht auf
`aspect-ratio: 9 / 16`, genau wie die Videos. Vorher stand dort 10:16, und mit
`object-fit: cover` schnitt der Rahmen oben und unten je rund 5 % weg - oben
sitzt aber die Statistik-Karte, also genau das, was die Karte vorfuehren soll.

## Immer nur ein Vibe-Video

Alle drei Vibe-Karten gleichzeitig laufen zu lassen wären drei Dekoder und rund
11 MB beim Seitenaufruf. Stattdessen läuft **eines und wandert weiter** — dieselbe
Regel wie im Clip-Raster der App (`hooks/useSpotlight.ts`). Wer mit der Maus auf
eine Karte fährt, hält sie an; beim Verlassen läuft die Rotation weiter.

Das Skript steht am Ende des Vibe-Abschnitts, in **allen fünf** Landingpages
gleich. Vier Punkte, die dabei leicht schiefgehen und deshalb im Kommentar
stehen:

1. **Ein Zeitgeber, immer erst gelöscht.** Die erste Fassung rief die Planung
   aus dem Hover *und* aus dem eigenen Timeout, ohne vorher zu löschen — nach
   dreimal Drüberfahren liefen drei Ketten parallel und die Rotation wurde immer
   schneller.
2. **Erst laufen, wenn man es sieht.** Der Abschnitt steht unter dem ersten
   Bildschirm.
3. **Gemessen wird die Geometrie**, nicht über einen Sichtbarkeits-Beobachter.
   Der meldet in einem versteckten Dokument gar nichts (nachgemessen: in einem
   Tab mit `document.hidden` feuert weder er noch `requestAnimationFrame`) —
   dann blieben alle drei Karten für immer beim Standbild. Dazu ein
   `visibilitychange`-Horcher, damit ein im Hintergrund geladener Tab beim
   Aufdecken nachsieht.
4. **`play()` bekommt ein `catch`.** Der Browser lehnt das Promise ab, wenn er
   die Wiedergabe verweigert (Energiesparmodus); ohne `catch` steht das als
   Fehler in der Konsole.

Ohne JavaScript bleibt das Standbild stehen. Ehrlicher Rückfall: dieselbe Karte,
nur unbewegt.

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
