import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const questions = JSON.parse(readFileSync(resolve(repoRoot, 'interview/data/questions.json'), 'utf8'));
const reports = JSON.parse(readFileSync(resolve(repoRoot, 'interview/data/reports.json'), 'utf8'));
const taxonomy = JSON.parse(readFileSync(resolve(repoRoot, 'interview/data/taxonomy.json'), 'utf8'));
const page = readFileSync(resolve(repoRoot, 'interview/index.html'), 'utf8');
const script = readFileSync(resolve(repoRoot, 'interview/reader.js'), 'utf8');
const style = readFileSync(resolve(repoRoot, 'interview/reader.css'), 'utf8');
const home = readFileSync(resolve(repoRoot, 'index.html'), 'utf8');

assert.equal(questions.length, 20, 'reported question count');
assert.equal(reports.length, 25, 'interview report count');

const questionFields = [
  'question', 'company', 'role', 'level', 'location', 'date', 'source', 'round',
  'question_type', 'bank', 'topic', 'study_topic', 'difficulty', 'evidence_grade',
  'source_url', 'archetype_id', 'priority_score', 'status',
];
const reportFields = [
  'title', 'company', 'role', 'level', 'location', 'date', 'source', 'round',
  'evidence_grade', 'source_url', 'raw_excerpt', 'status',
];

function asList(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function ruleMatch(item, when = {}) {
  if (when.question_type && !asList(when.question_type).includes(item.question_type)) return false;
  const tags = item.topic || [];
  if (when.topic_any && !asList(when.topic_any).some((tag) => tags.includes(tag))) return false;
  if (when.topic_none && asList(when.topic_none).some((tag) => tags.includes(tag))) return false;
  return true;
}

function place(item) {
  const bank = taxonomy.banks.find((candidate) => candidate.name === item.bank);
  assert.ok(bank, item.bank);
  const ordered = [
    ...bank.topics.filter((topic) => !topic.fallback),
    ...bank.topics.filter((topic) => topic.fallback),
  ];
  const topic = ordered.find((candidate) => candidate.fallback || ruleMatch(item, candidate.when));
  assert.ok(topic, item.archetype_id);
  return { bank, topic };
}

const banks = new Set();
const questionGrades = new Set();
const reportGrades = new Set();
const archetypes = new Set();
const counts = {};
const surfaces = [page, script, style, JSON.stringify(taxonomy)];

for (const item of questions) {
  assert.deepEqual(Object.keys(item), questionFields, item.archetype_id);
  assert.equal(typeof item.question, 'string');
  assert.ok(item.question.trim(), 'question text is present');
  assert.equal(typeof item.bank, 'string');
  assert.ok(item.bank.trim(), 'bank is present');
  assert.ok(Array.isArray(item.topic) && item.topic.length > 0, item.question);
  assert.equal(typeof item.study_topic, 'string');
  assert.ok(item.source_url.startsWith('https://'), item.source_url);
  const placed = place(item);
  assert.equal(item.study_topic, placed.topic.id, item.archetype_id);
  counts[placed.topic.id] = (counts[placed.topic.id] || 0) + 1;
  banks.add(item.bank);
  questionGrades.add(item.evidence_grade);
  assert.equal(archetypes.has(item.archetype_id), false, item.archetype_id);
  archetypes.add(item.archetype_id);
  for (const surface of surfaces) {
    assert.equal(surface.includes(item.question), false, 'questions stay in JSON, not hardcoded UI');
  }
}

for (const item of reports) {
  assert.deepEqual(Object.keys(item), reportFields, item.title);
  assert.equal(typeof item.raw_excerpt, 'string');
  assert.ok(item.raw_excerpt.trim(), item.title);
  assert.ok(item.source_url.startsWith('https://'), item.source_url);
  reportGrades.add(item.evidence_grade);
  for (const surface of surfaces) {
    assert.equal(surface.includes(item.raw_excerpt.slice(0, 80)), false, 'excerpts stay in JSON');
  }
}

assert.deepEqual([...banks].sort(), ['Coding', 'DE Knowledge', 'Data System Design', 'Experience'].sort());
assert.deepEqual([...questionGrades].sort(), ['A', 'B']);
assert.deepEqual([...reportGrades].sort(), ['A', 'B']);
assert.equal(questions.filter((item) => item.evidence_grade === 'A').length, 16);
assert.equal(questions.filter((item) => item.evidence_grade === 'B').length, 4);
assert.equal(reports.filter((item) => item.evidence_grade === 'A').length, 19);
assert.equal(reports.filter((item) => item.evidence_grade === 'B').length, 6);
assert.deepEqual(counts, {
  sql: 3,
  'python-dsa': 2,
  'data-modeling': 4,
  spark: 2,
  snowflake: 3,
  pipelines: 3,
  streaming: 2,
  behavioral: 1,
});

const topicIds = taxonomy.banks.flatMap((bank) => bank.topics.map((topic) => topic.id));
assert.equal(new Set(topicIds).size, topicIds.length, 'topic ids are unique');
assert.deepEqual(Object.keys(counts).sort(), topicIds.slice().sort());

assert.match(script, /\/interview\/data\/questions\.json/);
assert.match(script, /\/interview\/data\/reports\.json/);
assert.match(script, /\/interview\/data\/taxonomy\.json/);
assert.match(page, /Only Reported\+sourced items count as asked at/);
assert.match(page, /<meta name="robots" content="noindex, nofollow">/);
assert.match(script, /localStorage/);
assert.doesNotMatch(home, /href=["'][^"']*interview\//);
assert.doesNotMatch(home, />DE prep</);
assert.doesNotMatch(page + script, /Predicted pool|AI-generated question pool/i);
const robots = readFileSync(resolve(repoRoot, 'robots.txt'), 'utf8');
assert.match(robots, /^Disallow:\s*\/interview\/\s*$/m);
