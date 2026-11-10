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
if (errors) { console.error(`${errors} content error(s)`); process.exit(1); }
console.log(`content ok: ${keys[base].size} keys × ${Object.keys(langs).length} languages`);
