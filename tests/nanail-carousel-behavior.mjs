import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(repoRoot, 'nanail/display/index.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1, 'display contains one inline behavior script');

function fakeElement(active = false) {
  const classes = new Set(active ? ['is-active'] : []);
  const attributes = new Map();
  return {
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
    },
    setAttribute: (name, value) => attributes.set(name, value),
    getAttribute: (name) => attributes.get(name),
  };
}

const scenes = [fakeElement(true), fakeElement(), fakeElement(), fakeElement()];
const dots = [fakeElement(true), fakeElement(), fakeElement(), fakeElement()];
const intervals = [];
const mediaQuery = { matches: true, addEventListener() {} };

const context = vm.createContext({
  window: { matchMedia: () => mediaQuery },
  document: {
    hidden: false,
    querySelectorAll(selector) {
      if (selector === '.scene') return scenes;
      if (selector === '.scene-counter i') return dots;
      return [];
    },
    addEventListener() {},
  },
  clearInterval() {},
  setInterval(callback, delay) {
    intervals.push({ callback, delay });
    return intervals.length;
  },
});

vm.runInContext(scripts[0][1], context);

assert.equal(
  intervals.length,
  1,
  'reduced motion keeps the slideshow timer running while the page is visible',
);
assert.equal(intervals[0].delay, 7500, 'slideshow retains its seven-and-a-half-second cadence');

intervals[0].callback();
assert.equal(scenes[0].classList.contains('is-active'), false, 'first scene becomes inactive');
assert.equal(scenes[1].classList.contains('is-active'), true, 'second scene becomes active');
assert.equal(scenes[0].getAttribute('aria-hidden'), 'true');
assert.equal(scenes[1].getAttribute('aria-hidden'), 'false');

console.log('NaNail carousel behavior test passed.');
