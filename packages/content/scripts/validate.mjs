// Content test: every language must have exactly the same keys, and no empty strings.
import {readFileSync} from 'node:fs';

const load = (lang) => JSON.parse(readFileSync(new URL(`../src/${lang}.json`, import.meta.url), 'utf8'));
const langs = {az: load('az'), en: load('en')};

const flatten = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]);

const keys = Object.fromEntries(Object.entries(langs).map(([l, c]) => [l, new Map(flatten(c))]));
let errors = 0;
const [base, ...others] = Object.keys(keys);
for (const other of others) {
    for (const k of keys[base].keys()) if (!keys[other].has(k)) { console.error(`missing in ${other}: ${k}`); errors++; }
    for (const k of keys[other].keys()) if (!keys[base].has(k)) { console.error(`missing in ${base}: ${k}`); errors++; }
}
for (const [l, m] of Object.entries(keys)) {
    for (const [k, v] of m) if (typeof v === 'string' && !v.trim()) { console.error(`empty in ${l}: ${k}`); errors++; }
}
const expect = {points: 19, signs: 12, houses: 12, aspects: 9, patterns: 7};
for (const [section, n] of Object.entries(expect)) {
    for (const [l, c] of Object.entries(langs)) {
        if (Object.keys(c[section]).length !== n) { console.error(`${l}.${section}: expected ${n}`); errors++; }
    }
}
for (const [l, c] of Object.entries(langs)) {
    const arcana = Object.keys(c.destiny?.arcana ?? {});
    if (arcana.length !== 22 || !Array.from({length: 22}, (_, i) => String(i + 1)).every((k) => arcana.includes(k))) {
        console.error(`${l}.destiny.arcana: expected keys 1..22`); errors++;
    }
}
const SIGN_KEYS = Object.keys(langs.en.signs);
for (const [l, c] of Object.entries(langs)) {
    for (const [point, bySign] of Object.entries(c.placements ?? {})) {
        if (!SIGN_KEYS.every((s) => s in bySign)) { console.error(`${l}.placements.${point}: missing signs`); errors++; }
    }
    for (const [point, byHouse] of Object.entries(c.inHouse ?? {})) {
        if (Object.keys(byHouse).length !== 12) { console.error(`${l}.inHouse.${point}: expected 12 houses`); errors++; }
    }
    if (Object.keys(c.aspectPairs ?? {}).length !== 45) { console.error(`${l}.aspectPairs: expected 45`); errors++; }
    // Karmic path: every sign / house must have a text
    for (const section of ['nodeAxis', 'chironSign', 'lilithSign', 'selenaSign']) {
        if (!SIGN_KEYS.every((s) => s in (c.karmic?.[section] ?? {}))) { console.error(`${l}.karmic.${section}: missing signs`); errors++; }
    }
    if (Object.keys(c.moonCalendar?.days ?? {}).length !== 30) { console.error(`${l}.moonCalendar.days: expected 30`); errors++; }
    if (!SIGN_KEYS.every((s) => s in (c.moonCalendar?.moonSigns ?? {}))) { console.error(`${l}.moonCalendar.moonSigns: missing signs`); errors++; }
    if (Object.keys(c.numerology?.loShu?.missing ?? {}).length !== 9) { console.error(`${l}.numerology.loShu.missing: expected 9`); errors++; }
    for (const section of ['nodeHouse', 'chironHouse']) {
        if (Object.keys(c.karmic?.[section] ?? {}).length !== 12) { console.error(`${l}.karmic.${section}: expected 12 houses`); errors++; }
    }
}
if (errors) { console.error(`${errors} content error(s)`); process.exit(1); }
console.log(`content ok: ${keys[base].size} keys × ${Object.keys(langs).length} languages`);
