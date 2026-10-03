/*
 * Design preview switcher (preview builds only — see variants.css).
 *
 * The choice is set before first paint by a tiny inline script in <head>
 * (from ?design= or the last choice), so this file only draws the bar,
 * remembers changes, and swaps the header logo for the white one on the
 * design whose header is dark.
 */
const DESIGNS = [
  ['current', 'Current'],
  ['field', '1 Field'],
  ['river', '2 River'],
  ['contour', '3 Contour'],
  ['indigo', '4 Indigo & marigold'],
  ['editorial', '5 Editorial'],
];
const DARK_HEADER = new Set(['indigo']);
const root = document.documentElement;

const store = (value) => {
  try { localStorage.setItem('aiwc-design', value); } catch { /* private window: the URL still carries it */ }
};

const logo = () => {
  const img = document.querySelector('.brand-mark img');
  if (!img) return;
  if (!img.dataset.light) img.dataset.light = img.getAttribute('src');
  const dark = DARK_HEADER.has(root.getAttribute('data-design'));
  img.setAttribute('src', dark ? img.dataset.light.replace(/aiwc-logo\.png$/, 'aiwc-logo-white.png') : img.dataset.light);
};

const apply = (value, buttons) => {
  if (value === 'current') root.removeAttribute('data-design');
  else root.setAttribute('data-design', value);
  store(value);
  const url = new URL(location.href);
  if (value === 'current') url.searchParams.delete('design');
  else url.searchParams.set('design', value);
  history.replaceState(null, '', url);
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.design === value)));
  logo();
};

const bar = document.createElement('div');
bar.className = 'design-switcher';
bar.setAttribute('role', 'group');
bar.setAttribute('aria-label', 'Preview a design');
const label = document.createElement('span');
label.textContent = 'Preview design';
bar.appendChild(label);
const current = root.getAttribute('data-design') || 'current';
const buttons = DESIGNS.map(([value, text]) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.dataset.design = value;
  b.textContent = text;
  b.setAttribute('aria-pressed', String(value === current));
  b.addEventListener('click', () => apply(value, buttons));
  bar.appendChild(b);
  return b;
});
document.body.appendChild(bar);
document.body.classList.add('has-design-switcher');
logo();
