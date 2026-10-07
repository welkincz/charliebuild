import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const interview = resolve(repoRoot, 'interview');

function readJson(path) {
  return JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'));
}

const questions = readJson('interview/data/questions.json');
const practice = readJson('interview/data/practice.json');
const catalog = readJson('interview/data/catalog.json');
const plan = readJson('interview/data/plan.json');
const companies = readJson('interview/data/companies.json');
const mocks = readJson('interview/data/mocks.json');
const reference = readJson('interview/data/reference.json');
const pageIds = new Set(catalog.pages.map((page) => page.id));
const practiceIds = new Set(practice.map((item) => item.id));
const origins = new Set(['Reported+sourced', 'Reported', 'Worked example', 'Practice', 'Self-check']);
const banks = new Set(['SQL', 'Python/DSA', 'Data modeling', 'DE concepts', 'System design', 'Product sense', 'Behavioral']);

const sourced = practice.filter((item) => item.origin === 'Reported+sourced');
assert.equal(sourced.length, 20);
assert.deepEqual(sourced.map((item) => item.id).sort(), questions.map((item) => item.archetype_id).sort());

for (const item of practice) {
  assert.equal(typeof item.origin, 'string', item.id);
  assert.ok(origins.has(item.origin), item.origin);
  assert.equal(typeof item.bank, 'string', item.id);
  assert.ok(banks.has(item.bank), item.bank);
  assert.equal(typeof item.topic, 'string', item.id);
  assert.ok(pageIds.has(item.topic), item.id + ' -> ' + item.topic);
  assert.ok(item.level === 'Core' || item.level === 'Stretch', item.id);
  assert.equal(typeof item.title, 'string');
  assert.equal(typeof item.prompt, 'string');
  if (item.origin === 'Reported+sourced') {
    assert.ok(item.source_url.startsWith('https://'), item.id);
    assert.ok(item.asked_at && item.asked_at.length === 1, item.id);
    const original = questions.find((question) => question.archetype_id === item.id);
    assert.equal(item.title, original.question);
    assert.equal(item.evidence_grade, original.evidence_grade);
    assert.equal(item.asked_at[0].source_url, original.source_url);
    assert.equal(item.asked_at[0].grade, original.evidence_grade);
  } else {
    assert.ok(!item.asked_at || item.asked_at.length === 0, item.id);
  }
}

assert.equal(new Set(practice.map((item) => item.id)).size, practice.length);

const headings = [
  '## Summary',
  '## Key ideas',
  '## Diagrams and tables',
  '## Interview angles',
  '## Pitfalls',
  '## Say this in the interview',
  '## Self-check',
];

for (const page of catalog.pages) {
  const body = readFileSync(resolve(interview, 'content/learn', page.file), 'utf8');
  for (const heading of headings) {
    assert.ok(body.includes(heading), page.id + ' missing ' + heading);
  }
  assert.ok(body.includes('??? '), page.id + ' missing a self-check');
  if (page.gap) assert.ok(body.includes('Gap fill, not from your notes.'), page.id);
}

const gapIds = catalog.pages.filter((page) => page.gap).map((page) => page.id).sort();
assert.deepEqual(gapIds, [
  'airflow-dbt',
  'data-quality',
  'delivery',
  'governance',
  'snowflake-databricks',
  'spark-internals',
].sort());

for (const week of plan.weeks) {
  assert.equal(typeof week.id, 'number');
  assert.ok(week.days && week.days.length >= 5, 'week ' + week.id);
  for (const day of week.days) {
    for (const id of day.learn) assert.ok(pageIds.has(id), id);
    for (const id of day.practice) assert.ok(practiceIds.has(id), id);
  }
}
assert.equal(plan.weeks.filter((week) => !week.optional).length, 8);
assert.equal(plan.weeks.filter((week) => week.optional).length, 4);

for (const company of companies) {
  for (const id of company.learn) assert.ok(pageIds.has(id), company.id + ' ' + id);
  for (const id of company.practice) assert.ok(practiceIds.has(id), company.id + ' ' + id);
  if (['td', 'rbc', 'bmo', 'scotiabank', 'autodesk', 'big-banks'].includes(company.id)) {
    assert.equal(company.from_postings, true, company.id);
    assert.equal(company.practice.length, 0, company.id);
  }
}

for (const loop of mocks.loops) {
  assert.ok(loop.label, loop.id);
  for (const round of loop.rounds) {
    for (const id of round.practice) assert.ok(practiceIds.has(id), loop.id + ' ' + id);
  }
}
assert.ok(mocks.loops.some((loop) => loop.id === 'amazon-benchmark'));
assert.ok(mocks.loops.some((loop) => loop.id === 'big-bank' && /posting/i.test(loop.label)));

for (const page of reference) {
  const body = readFileSync(resolve(interview, 'content/reference', page.file), 'utf8');
  assert.ok(body.includes('# '), page.id);
}

const script = readFileSync(resolve(interview, 'reader.js'), 'utf8');
assert.match(script, /\/interview\/data\/practice\.json/);
assert.match(script, /\/interview\/content\/learn\//);
assert.match(script, /localStorage/);
assert.match(script, /Study next|study-next|nextStudy/);

const forbidden = /salary|visa|citizen|wechat|qgm226131|xiaowantree|senior manager/i;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = resolve(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (!/\.(html|css|js|mjs|json|md|txt)$/.test(name)) continue;
    const body = readFileSync(path, 'utf8');
    assert.equal(forbidden.test(body), false, path);
  }
}
walk(interview);

assert.ok(catalog.pages.length >= 44);
assert.ok(practice.length >= 80);
