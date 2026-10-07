import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const questions = JSON.parse(readFileSync(resolve(repoRoot, 'interview/data/questions.json'), 'utf8'));
const reports = JSON.parse(readFileSync(resolve(repoRoot, 'interview/data/reports.json'), 'utf8'));
const page = readFileSync(resolve(repoRoot, 'interview/index.html'), 'utf8');
const home = readFileSync(resolve(repoRoot, 'index.html'), 'utf8');

assert.equal(questions.length, 20, 'reported question count');
assert.equal(reports.length, 25, 'interview report count');

const questionFields = [
  'question', 'company', 'role', 'level', 'location', 'date', 'source', 'round',
  'question_type', 'bank', 'topic', 'difficulty', 'evidence_grade', 'source_url',
  'archetype_id', 'priority_score', 'status',
];
const reportFields = [
  'title', 'company', 'role', 'level', 'location', 'date', 'source', 'round',
  'evidence_grade', 'source_url', 'raw_excerpt', 'status',
];

const banks = new Set();
const questionGrades = new Set();
const reportGrades = new Set();
const archetypes = new Set();

for (const item of questions) {
  for (const field of questionFields) {
    assert.ok(Object.prototype.hasOwnProperty.call(item, field), `question field ${field}`);
  }
  assert.equal(typeof item.question, 'string');
  assert.ok(item.question.trim(), 'question text is present');
  assert.ok(item.source_url.startsWith('https://'), item.source_url);
  assert.ok(Array.isArray(item.topic) && item.topic.length > 0, item.question);
  banks.add(item.bank);
  questionGrades.add(item.evidence_grade);
  assert.equal(archetypes.has(item.archetype_id), false, item.archetype_id);
  archetypes.add(item.archetype_id);
  assert.equal(page.includes(item.question), false, 'questions stay in JSON, not hardcoded HTML');
}

for (const item of reports) {
  for (const field of reportFields) {
    assert.ok(Object.prototype.hasOwnProperty.call(item, field), `report field ${field}`);
  }
  assert.equal(typeof item.raw_excerpt, 'string');
  assert.ok(item.raw_excerpt.trim(), item.title);
  assert.ok(item.source_url.startsWith('https://'), item.source_url);
  reportGrades.add(item.evidence_grade);
  assert.equal(page.includes(item.raw_excerpt.slice(0, 80)), false, 'excerpts stay in JSON');
}

assert.deepEqual([...banks].sort(), ['Coding', 'DE Knowledge', 'Data System Design', 'Experience'].sort());
assert.deepEqual([...questionGrades].sort(), ['A', 'B']);
assert.deepEqual([...reportGrades].sort(), ['A', 'B']);
assert.equal(questions.filter((item) => item.evidence_grade === 'A').length, 16);
assert.equal(questions.filter((item) => item.evidence_grade === 'B').length, 4);
assert.equal(reports.filter((item) => item.evidence_grade === 'A').length, 19);
assert.equal(reports.filter((item) => item.evidence_grade === 'B').length, 6);

assert.match(page, /\/interview\/data\/questions\.json/);
assert.match(page, /\/interview\/data\/reports\.json/);
assert.match(page, /Predicted and AI-written questions are\s+not included/);
assert.match(home, /href="interview\/"/);
assert.match(home, />DE prep</);
assert.doesNotMatch(page, /Predicted pool|AI-generated question pool/i);
