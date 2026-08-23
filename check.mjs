// Prüft die Rechtsseiten. Ohne Abhängigkeiten: `node check.mjs`.
//
// WARUM ES DAS GIBT: dieselbe Zahl steht in fünf Sprachen auf zwei Seiten und
// zusätzlich im Code. Von Hand gleichzuhalten geht ein paar Mal gut und dann
// nicht mehr — und eine Frist in der Datenschutzerklärung, die der Code nicht
// einhält, ist ein Versprechen ohne Deckung (Art. 5 Abs. 1 lit. e DSGVO).
//
// Geprüft wird die STRUKTUR, nicht der Wortlaut. Übersetzungen sollen frei sein,
// aber jede Sprache muss dieselben Seiten, dieselben Fristen und denselben
// Vorrang-Hinweis tragen.
import {readFileSync, existsSync, readdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));

/** Deutsch liegt in der WURZEL — das ist die verbindliche Fassung und genau die
 *  URL, die in den Stores eingetragen ist. Ein Umzug nach /de/ wäre eine 404. */
const SPRACHEN = ['de', 'en', 'fr', 'es', 'it'];
const SEITEN = ['privacy', 'terms', 'delete-account', 'impressum'];

/** Landingpage und FAQ. Sie liegen im selben Ordner und laden dieselbe
 *  style.css, tragen aber KEINEN Rechtsinhalt — deshalb keine Stand-Daten und
 *  kein Vorrang-Hinweis. Geprüft wird nur, was auch dort schiefgehen kann: ein
 *  Sprachlink ins Leere und eine Frist, die von `fristen.json` abweicht.
 *
 *  Eigene Sprachliste, weil Landingpage und FAQ nicht zwingend so viele
 *  Sprachen haben müssen wie die Rechtstexte. Heute sind es dieselben fünf.
 *  Wer eine Sprache ergänzt, trägt sie HIER nach — dann verlangt die Prüfung
 *  sofort die Dateien und die Sprachleiste dazu. */
const MARKETING_SPRACHEN = ['de', 'en', 'fr', 'es', 'it'];
const MARKETING_SEITEN = ['index', 'faq'];

const ordner = (lang) => (lang === 'de' ? HIER : join(HIER, lang));
const pfad = (lang, seite) => join(ordner(lang), `${seite}.html`);

const fehler = [];
const meckern = (msg) => fehler.push(msg);

const fristen = JSON.parse(readFileSync(join(HIER, 'fristen.json'), 'utf8'));

for (const lang of SPRACHEN) {
  if (!existsSync(ordner(lang))) {
    meckern(`Der Ordner für „${lang}" fehlt.`);
    continue;
  }

  for (const seite of SEITEN) {
    const datei = pfad(lang, seite);
    if (!existsSync(datei)) {
      meckern(`${lang}/${seite}.html fehlt.`);
      continue;
    }
    const html = readFileSync(datei, 'utf8');

    // 1. Die Seite sagt, in welcher Sprache sie geschrieben ist.
    const lang_attr = html.match(/<html lang="([^"]+)"/)?.[1];
    if (lang_attr !== lang) {
      meckern(`${lang}/${seite}.html: <html lang="${lang_attr}"> passt nicht zum Ordner.`);
    }

    // 2. Die Sprachleiste führt in jede Sprache, und zwar auf DIESELBE Seite.
    //    Deshalb heißen die Dateien in jedem Ordner gleich — sonst bräuchte man
    //    pro Seite und Sprache eine eigene Linktabelle.
    for (const ziel of SPRACHEN) {
      const erwartet = ziel === 'de'
        ? (lang === 'de' ? `./${seite}.html` : `../${seite}.html`)
        : (lang === 'de' ? `./${ziel}/${seite}.html` : `../${ziel}/${seite}.html`);
      if (!html.includes(`href="${erwartet}"`)) {
        meckern(`${lang}/${seite}.html: kein Sprachlink auf ${erwartet}`);
      }
      if (!existsSync(pfad(ziel, seite))) {
        meckern(`${lang}/${seite}.html verlinkt ${ziel}/${seite}.html — die es nicht gibt.`);
      }
    }

    // 3. Jede nicht-deutsche Rechtsseite sagt, dass Deutsch verbindlich ist.
    //    Seit `index` die Landingpage ist, steht in SEITEN nur noch
    //    Rechtsinhalt — die frühere Ausnahme für `index` wäre tote Logik.
    if (lang !== 'de' && !/class="[^"]*\bbinding\b/.test(html)) {
      meckern(`${lang}/${seite}.html: der Vorrang-Hinweis (class="… binding") fehlt.`);
    }

    // 4. Jede markierte Frist nennt dieselbe Zahl wie fristen.json — und damit
    //    wie der Code. Der Marker überlebt die Übersetzung, weil ein Übersetzer
    //    das <strong> als Ganzes verschiebt.
    for (const treffer of html.matchAll(/data-frist="([\w-]+)"[^>]*>\s*(\d+)/g)) {
      const [, name, wert] = treffer;
      if (!(name in fristen)) {
        meckern(`${lang}/${seite}.html: data-frist="${name}" steht nicht in fristen.json.`);
      } else if (Number(wert) !== fristen[name]) {
        meckern(`${lang}/${seite}.html: ${name} sagt ${wert}, fristen.json sagt ${fristen[name]}.`);
      }
    }
  }
}

/** Monatsnamen je Sprache, Reihenfolge = Monatsnummer. Nur so weit
 *  kleingeschrieben und akzentfrei verglichen, wie es die Seiten schreiben. */
const MONATE = {
  de: 'januar februar märz april mai juni juli august september oktober november dezember',
  en: 'january february march april may june july august september october november december',
  fr: 'janvier février mars avril mai juin juillet août septembre octobre novembre décembre',
  es: 'enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre',
  it: 'gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre',
};

/**
 * Das Stand-Datum als `JJJJ-MM-TT`, egal in welcher Sprache es dasteht.
 *
 * WARUM NICHT EINFACH DER TEXT: Jede Sprache schreibt das Datum anders („7.
 * August 2026", „7 August 2026", „7 de agosto de 2026"). Ein Textvergleich
 * hielte fünf verschiedene Schreibweisen desselben Tages für fünf verschiedene
 * Daten — und wäre damit dauernd rot. Vorher stand hier `/Stand:/`, also das
 * DEUTSCHE Wort: die Prüfung fand in en/fr/es/it gar kein Datum, verglich einen
 * einzigen Wert mit sich selbst und war seit jeher wirkungslos. Genau dieser
 * Fall (eine Sprache bleibt beim Nachziehen liegen) ist der Grund für Punkt 5.
 */
const standDatum = (html, lang) => {
  const zeile = html.match(/<p class="meta">([^<]+)<\/p>/)?.[1];
  if (!zeile) return null;
  // Den Monat SUCHEN statt ihn an einer Position zu erwarten: Spanisch schreibt
  // „8 de agosto de 2026", und jedes Muster mit fester Wortstellung greift dort
  // das „de" ab.
  const nummer = MONATE[lang].split(' ').findIndex((m) => zeile.toLowerCase().includes(m)) + 1;
  const tag = zeile.match(/\b(\d{1,2})\b/)?.[1];
  const jahr = zeile.match(/\b(\d{4})\b/)?.[1];
  if (nummer === 0 || !tag || !jahr) return null;
  return `${jahr}-${String(nummer).padStart(2, '0')}-${tag.padStart(2, '0')}`;
};

// 5. Dieselbe Seite trägt in allen Sprachen dasselbe Stand-Datum. Sonst
//    behauptet eine Fassung, aktueller zu sein als die verbindliche.
for (const seite of SEITEN) {
  const staende = new Map();
  for (const lang of SPRACHEN) {
    if (!existsSync(pfad(lang, seite))) continue;
    const html = readFileSync(pfad(lang, seite), 'utf8');
    const stand = standDatum(html, lang);
    // Ein unlesbares Datum ist selbst ein Fehler — sonst wäre „Prüfung fällt
    // still aus" wieder genau der Zustand, den dieser Abschnitt beheben soll.
    if (!stand) {
      meckern(`${lang}/${seite}.html: kein lesbares Stand-Datum in <p class="meta">.`);
      continue;
    }
    staende.set(lang, stand);
  }
  const werte = new Set(staende.values());
  if (werte.size > 1) {
    meckern(`${seite}.html: verschiedene Stand-Daten — ${[...staende].map(([l, s]) => `${l}: ${s}`).join(', ')}`);
  }
}

// 6. Landingpage und FAQ. Bewusst die LEICHTE Prüfung: kein Stand-Datum, kein
//    Vorrang-Hinweis, kein Rechtsinhalt. Aber die zwei Fehler, die hier
//    trotzdem passieren, kosten genauso viel:
//    · ein Sprachlink auf eine Datei, die es nicht gibt (404 für den Besucher),
//    · eine Frist, die von `fristen.json` abweicht — dann steht in der FAQ
//      etwas anderes als in den Nutzungsbedingungen, und die FAQ ist der Ort,
//      den die Leute wirklich lesen.
for (const lang of MARKETING_SPRACHEN) {
  for (const seite of MARKETING_SEITEN) {
    const datei = pfad(lang, seite);
    if (!existsSync(datei)) {
      meckern(`${lang}/${seite}.html fehlt (Landingpage/FAQ).`);
      continue;
    }
    const html = readFileSync(datei, 'utf8');

    const lang_attr = html.match(/<html lang="([^"]+)"/)?.[1];
    if (lang_attr !== lang) {
      meckern(`${lang}/${seite}.html: <html lang="${lang_attr}"> passt nicht zum Ordner.`);
    }

    for (const ziel of MARKETING_SPRACHEN) {
      const erwartet = ziel === 'de'
        ? (lang === 'de' ? `./${seite}.html` : `../${seite}.html`)
        : (lang === 'de' ? `./${ziel}/${seite}.html` : `../${ziel}/${seite}.html`);
      if (!html.includes(`href="${erwartet}"`)) {
        meckern(`${lang}/${seite}.html: kein Sprachlink auf ${erwartet}`);
      }
      if (!existsSync(pfad(ziel, seite))) {
        meckern(`${lang}/${seite}.html verlinkt ${ziel}/${seite}.html — die es nicht gibt.`);
      }
    }

    for (const treffer of html.matchAll(/data-frist="([\w-]+)"[^>]*>\s*(\d+)/g)) {
      const [, name, wert] = treffer;
      if (!(name in fristen)) {
        meckern(`${lang}/${seite}.html: data-frist="${name}" steht nicht in fristen.json.`);
      } else if (Number(wert) !== fristen[name]) {
        meckern(`${lang}/${seite}.html: ${name} sagt ${wert}, fristen.json sagt ${fristen[name]}.`);
      }
    }
  }
}

if (fehler.length) {
  console.error(`\n${fehler.length} Problem(e):\n`);
  for (const f of fehler) console.error('  · ' + f);
  console.error('');
  process.exit(1);
}
console.log(
  `Alles in Ordnung: ${SPRACHEN.length} Sprachen × ${SEITEN.length} Rechtsseiten, ` +
    `dazu ${MARKETING_SPRACHEN.length} × ${MARKETING_SEITEN.length} Seiten der Website.`,
);
