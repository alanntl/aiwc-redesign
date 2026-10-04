/*
 * Design + motion preview (preview builds only — see variants.css).
 *
 * Two dropdowns at the foot of every page: Design (a palette and layout)
 * and Motion (how much moves, and how). Both are applied before first paint
 * by a tiny inline script in <head>; this file draws the dropdowns, keeps
 * the address and the saved choice in step, and builds the decorative
 * moving parts (bubbles, ripples, caustics, ribbons), the scroll reveals
 * and the count-up figures.
 *
 * Nothing here runs for a visitor who has asked for reduced motion.
 */
const DEFAULT_DESIGN = 'flow';
const DEFAULT_MOTION = 'gentle';

const DESIGNS = [
  ['Default', [['flow', 'Flow — river lines drawing']]],
  ['Chosen earlier', [['field', 'Field — navy and orange']]],
  ['More colourful', [
    ['lagoon', 'Lagoon — teal and coral'],
    ['saffron', 'Saffron — navy and marigold'],
    ['ocean', 'Ocean — blue to aqua gradient'],
    ['sunrise', 'Sunrise — violet to amber'],
    ['indigo', 'Indigo & marigold — lattice'],
  ]],
  ['Bold — coloured top bar, drawn or animated', [
    ['aurora', 'Aurora — drifting colour'],
    ['waves', 'Waves — sliding water'],
    ['monsoon', 'Monsoon — falling rain'],
    ['contour', 'Contour — drifting topography'],
    ['marigold', 'Marigold bold — halftone dots'],
    ['deepsea', 'Deep sea — rising light'],
    ['blueprint', 'Blueprint — drafting grid'],
  ]],
  ['More elegant', [
    ['eucalyptus', 'Eucalyptus — sage and clay'],
    ['plum', 'Plum & gold'],
    ['ivory', 'Ivory & ink — serif'],
    ['terracotta', 'Terracotta & sand'],
    ['midnight', 'Midnight & aqua'],
  ]],
];
const MOTIONS = [
  ['off', 'Off'],
  ['gentle', 'Gentle — entrance, reveal, hover polish'],
  ['ripples', 'Ripples — rings on the water'],
  ['bubbles', 'Bubbles — rising and swaying'],
  ['caustics', 'Caustics — light on water'],
  ['ribbon', 'Ribbon — flowing river line'],
  ['everything', 'Everything'],
];
const DARK_HEADER = new Set(['midnight', 'indigo', 'aurora', 'waves', 'monsoon', 'contour', 'flow', 'deepsea', 'blueprint']);
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const save = (key, value) => {
  try { localStorage.setItem(key, value); } catch { /* the address still carries it */ }
};
const setParam = (name, value) => {
  const url = new URL(location.href);
  url.searchParams.set(name, value);
  history.replaceState(null, '', url);
};

/* ── design ───────────────────────────────────────────────────────────── */

const logo = () => {
  const img = document.querySelector('.brand-mark img');
  if (!img) return;
  if (!img.dataset.light) img.dataset.light = img.getAttribute('src');
  const dark = DARK_HEADER.has(root.getAttribute('data-design'));
  img.setAttribute('src', dark ? img.dataset.light.replace(/aiwc-logo\.png$/, 'aiwc-logo-white.png') : img.dataset.light);
};
const applyDesign = (value) => {
  if (value === 'field') root.removeAttribute('data-design');
  else root.setAttribute('data-design', value);
  save('aiwc-design', value);
  setParam('design', value);
  logo();
};

/* ── motion: the moving parts ─────────────────────────────────────────── */

const MODES = {
  off: [],
  gentle: [],
  ripples: ['ripples'],
  bubbles: ['bubbles'],
  caustics: ['caustics'],
  ribbon: ['ribbon'],
  everything: ['bubbles', 'ripples', 'ribbon'],
};
const rand = (min, max) => min + Math.random() * (max - min);

const ripples = () => {
  const wrap = document.createElement('div');
  const spots = [[72, 58, 0], [88, 28, 2.4], [58, 80, 4.6], [30, 70, 6.8]];
  wrap.innerHTML = spots.map(([x, y, d]) =>
    `<div class="fx-ripples" style="--x:${x}%;--y:${y}%">` +
    [0, 1, 2].map((i) => `<i style="--dl:${(d + i * 2.1).toFixed(1)}s"></i>`).join('') + '</div>').join('');
  return [...wrap.children];
};
const bubbles = (height) => {
  const out = [];
  for (let i = 0; i < 16; i++) {
    const b = document.createElement('i');
    b.className = 'fx-bubble';
    const s = rand(6, 26);
    b.style.cssText = `--x:${rand(2, 98).toFixed(1)}%;--s:${s.toFixed(0)}px;--t:${rand(11, 22).toFixed(1)}s;--dl:${(-rand(0, 20)).toFixed(1)}s;--sw:${rand(-26, 26).toFixed(0)}px;--h:${Math.round(height + 60)}px`;
    out.push(b);
  }
  return out;
};
const caustics = () => {
  const c = document.createElement('div');
  c.className = 'fx-caustics';
  return [c];
};
const ribbon = () => {
  const wave = (amp, phase) => {
    const pts = [];
    for (let x = 0; x <= 2400; x += 24) pts.push(`${x} ${(60 + amp * Math.sin((2 * Math.PI * 2 * x) / 1200 + phase)).toFixed(1)}`);
    return `M${pts.join(' L')} L2400 120 L0 120Z`;
  };
  const wrap = document.createElement('div');
  wrap.innerHTML =
    `<div class="fx-ribbon"><svg viewBox="0 0 2400 120" preserveAspectRatio="none"><path d="${wave(16, 0)}"/></svg></div>` +
    `<div class="fx-ribbon fx-ribbon--b"><svg viewBox="0 0 2400 120" preserveAspectRatio="none"><path d="${wave(11, 2.1)}"/></svg></div>`;
  return [...wrap.children];
};
const BUILD = { ripples, bubbles, caustics, ribbon };

const clearFx = () => document.querySelectorAll('.fx').forEach((n) => n.remove());
const buildFx = (mode) => {
  clearFx();
  if (reduced) return;
  const kinds = MODES[mode] || [];
  if (!kinds.length) return;
  const hosts = [document.querySelector('.home-hero'), document.querySelector('.page-head')].filter(Boolean);
  for (const host of hosts) {
    const layer = document.createElement('div');
    layer.className = 'fx';
    layer.setAttribute('aria-hidden', 'true');
    const height = host.getBoundingClientRect().height || 600;
    for (const kind of kinds) BUILD[kind](height).forEach((n) => layer.appendChild(n));
    host.appendChild(layer);
  }
};

/* scroll reveals + count-up figures */
const REVEAL = '.story-card, .process-step, .metric, .partner-country, .section-head, .explore-head, .split > *, .cms-block-callout, .tool-card, .home-statement';
let observer = null;
const countUp = (node) => {
  if (node.dataset.counted) return;
  node.dataset.counted = '1';
  const m = node.textContent.trim().match(/^(\d[\d,]*)(.*)$/s);
  if (!m) return;
  const end = Number(m[1].replace(/,/g, ''));
  if (!Number.isFinite(end) || end < 2) return;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / 1300, 1);
    node.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString() + m[2];
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const setupReveal = (on) => {
  observer?.disconnect();
  observer = null;
  const nodes = [...document.querySelectorAll(REVEAL)];
  if (!on || reduced || !('IntersectionObserver' in window)) {
    nodes.forEach((n) => n.classList.remove('fx-reveal'));
    return;
  }
  observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      e.target.querySelectorAll?.('.metric strong').forEach(countUp);
      if (e.target.matches?.('.metric')) countUp(e.target.querySelector('strong'));
      observer.unobserve(e.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  nodes.forEach((n, i) => {
    n.style.setProperty('--d', `${(i % 4) * 90}ms`);
    n.classList.add('fx-reveal');
    observer.observe(n);
  });
};

const applyMotion = (value) => {
  root.setAttribute('data-motion', value);
  save('aiwc-motion', value);
  setParam('motion', value);
  buildFx(value);
  setupReveal(value !== 'off');
};

/* ── the bar ──────────────────────────────────────────────────────────── */

const field = (id, text, groups) => {
  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.textContent = text;
  const select = document.createElement('select');
  select.id = id;
  for (const [name, list] of groups) {
    const parent = name ? Object.assign(document.createElement('optgroup'), { label: name }) : select;
    for (const [value, t] of list) parent.appendChild(Object.assign(document.createElement('option'), { value, textContent: t }));
    if (name) select.appendChild(parent);
  }
  return [label, select];
};

const bar = document.createElement('div');
bar.className = 'design-switcher';
const [dLabel, dSelect] = field('design-select', 'Design', DESIGNS);
const [mLabel, mSelect] = field('motion-select', 'Motion', [[null, MOTIONS]]);
const flat = DESIGNS.flatMap(([, list]) => list);
const arrow = (text, name, delta) => {
  const b = Object.assign(document.createElement('button'), { type: 'button', textContent: text });
  b.setAttribute('aria-label', name);
  b.addEventListener('click', () => {
    const i = flat.findIndex(([v]) => v === dSelect.value);
    dSelect.value = flat[(i + delta + flat.length) % flat.length][0];
    applyDesign(dSelect.value);
  });
  return b;
};
const current = root.getAttribute('data-design') || (localStorage.getItem('aiwc-design') === 'field' ? 'field' : DEFAULT_DESIGN);
dSelect.value = current;
mSelect.value = root.getAttribute('data-motion') || DEFAULT_MOTION;
dSelect.addEventListener('change', () => applyDesign(dSelect.value));
mSelect.addEventListener('change', () => applyMotion(mSelect.value));
const group = (...kids) => Object.assign(document.createElement('span'), { className: 'design-switcher-group' }, { });
const g1 = group(); g1.append(dLabel, arrow('‹', 'Previous design', -1), dSelect, arrow('›', 'Next design', 1));
const g2 = group(); g2.append(mLabel, mSelect);
bar.append(g1, g2);
document.body.appendChild(bar);
document.body.classList.add('has-design-switcher');
logo();
applyMotion(mSelect.value);
