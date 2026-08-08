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
const SEITEN = ['index', 'privacy', 'terms', 'delete-account', 'impressum'];

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

    // 3. Jede nicht-deutsche RECHTSseite sagt, dass Deutsch verbindlich ist.
    //    `index` ist ein reiner Linkverteiler ohne Rechtsinhalt.
    if (lang !== 'de' && seite !== 'index' && !/class="[^"]*\bbinding\b/.test(html)) {
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

if (fehler.length) {
  console.error(`\n${fehler.length} Problem(e):\n`);
  for (const f of fehler) console.error('  · ' + f);
  console.error('');
  process.exit(1);
}
console.log(`Alles in Ordnung: ${SPRACHEN.length} Sprachen × ${SEITEN.length} Seiten.`);
