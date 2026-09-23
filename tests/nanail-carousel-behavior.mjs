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

const sceneCount = (html.match(/<div class="scene[^"]*" data-copy-zone=/g) ?? []).length;
assert.ok(sceneCount >= 2, 'there are scenes to rotate through');

const scenes = Array.from({ length: sceneCount }, (_, index) => fakeElement(index === 0));
const counter = { children: [], appendChild(child) { this.children.push(child); } };
const intervals = [];
const timeouts = [];
const mediaQuery = { matches: true, addEventListener() {} };

const context = vm.createContext({
  window: { matchMedia: () => mediaQuery },
  document: {
    hidden: false,
    querySelectorAll(selector) {
      if (selector === '.scene') return scenes;
      return [];
    },
    querySelector(selector) {
      if (selector === '.scene-counter') return counter;
      return null;
    },
    createElement() {
      const dot = fakeElement();
      // 生成出来的圆点一开始没有 class，脚本靠 dot.className 点亮第一个。
      Object.defineProperty(dot, 'className', {
        set(value) { value.split(' ').filter(Boolean).forEach((name) => dot.classList.add(name)); },
        configurable: true,
      });
      return dot;
    },
    addEventListener() {},
  },
  clearInterval() {},
  setInterval(callback, delay) {
    intervals.push({ callback, delay });
    return intervals.length;
  },
  setTimeout(callback, delay) {
    timeouts.push({ callback, delay });
    return timeouts.length;
  },
});

vm.runInContext(scripts[0][1], context);

assert.equal(
  counter.children.length,
  sceneCount,
  'one counter dot is generated per scene, so adding a photo cannot desync the dots',
);
assert.equal(counter.children[0].classList.contains('is-active'), true, 'first dot starts active');

assert.equal(
  intervals.length,
  1,
  'reduced motion keeps the slideshow timer running while the page is visible',
);
assert.equal(intervals[0].delay, 5500, 'each photo holds for five and a half seconds');

intervals[0].callback();
assert.equal(scenes[0].classList.contains('is-active'), false, 'first scene becomes inactive');
assert.equal(
  scenes[0].classList.contains('is-leaving'),
  true,
  'the outgoing photo keeps its drift animation through the crossfade instead of snapping back',
);
assert.equal(scenes[1].classList.contains('is-active'), true, 'second scene becomes active');
assert.equal(scenes[0].getAttribute('aria-hidden'), 'true');
assert.equal(scenes[1].getAttribute('aria-hidden'), 'false');
assert.equal(counter.children[0].classList.contains('is-active'), false, 'first dot dims');
assert.equal(counter.children[1].classList.contains('is-active'), true, 'second dot lights up');

const cleanup = timeouts.at(-1);
assert.ok(cleanup && cleanup.delay > 1050, 'is-leaving is cleared only after the crossfade finishes');
cleanup.callback();
assert.equal(scenes[0].classList.contains('is-leaving'), false, 'is-leaving does not linger');

// 绕一整圈回到第一张。
for (let step = 1; step < sceneCount; step += 1) intervals[0].callback();
assert.equal(scenes[0].classList.contains('is-active'), true, 'the loop wraps back to the first scene');

console.log('NaNail carousel behavior test passed.');
