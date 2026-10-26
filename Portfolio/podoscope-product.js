(() => {
  'use strict';
  const track = document.querySelector('[data-product-round]');
  if (!track) return;
  const stage = track.querySelector('.product-stage');
  const display = track.querySelector('[data-product-frame]');
  const descriptions = [...track.querySelectorAll('[data-product-description]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const shortScreen = matchMedia('(max-height: 600px)');
  const cache = new Map();
  const loading = new Set();
  const failed = new Set();
  let target = 0;
  let shown = -1;
  let pending = false;
  let queue = [];
  let enabled = false;
  const count = 72;
  const clamp = value => Math.max(0, Math.min(1, value));
  const source = index => `images/podoscope/studio-round/${String(index + 1).padStart(4, '0')}.webp`;

  function pump() {
    while (enabled && loading.size < 3 && queue.length) {
      const index = queue.shift();
      if (cache.has(index) || loading.has(index) || failed.has(index)) continue;
      loading.add(index);
      const image = new Image();
      image.decoding = 'async';
      image.onload = async () => {
        try { await image.decode(); } catch (_) { /* The loaded image remains usable. */ }
        loading.delete(index);
        cache.set(index, image);
        while (cache.size > 12) {
          const farthest = [...cache.keys()].sort((a, b) => Math.abs(b - target) - Math.abs(a - target))[0];
          cache.delete(farthest);
        }
        if (enabled && index === target) show(index);
        pump();
      };
      image.onerror = () => { loading.delete(index); failed.add(index); pump(); };
      image.src = source(index);
    }
  }
  function show(index) {
    if (index === shown || !cache.has(index)) return;
    display.src = source(index);
    shown = index;
    track.dataset.frame = String(index + 1);
  }
  function draw() {
    pending = false;
    enabled = !reducedMotion.matches && !shortScreen.matches;
    track.dataset.enhanced = String(enabled);
    if (!enabled) {
      descriptions.forEach(description => description.removeAttribute('aria-hidden'));
      display.src = source(0);
      shown = 0;
      queue = [];
      return;
    }
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    const bounds = track.getBoundingClientRect();
    const progress = clamp((top - bounds.top) / Math.max(1, track.offsetHeight - stage.offsetHeight));
    target = Math.round(progress * (count - 1));
    show(target);
    // Only fetch nearby frames when the section approaches the viewport.
    if (bounds.top < innerHeight * 1.5 && bounds.bottom > 0) {
      queue = [target];
      for (let offset = 1; offset <= 3; offset++) {
        if (target + offset < count) queue.push(target + offset);
        if (target - offset >= 0) queue.push(target - offset);
      }
      pump();
    }
    const position = Math.min(descriptions.length - 1, progress * descriptions.length);
    const current = Math.floor(position);
    const blend = clamp((position - current - 0.65) / 0.35);
    const active = Math.min(descriptions.length - 1, current + (blend >= 0.5 ? 1 : 0));
    descriptions.forEach((description, index) => {
      const opacity = index === current ? 1 - clamp(blend * 2) : index === current + 1 ? clamp((blend - 0.5) * 2) : 0;
      description.style.setProperty('--product-opacity', opacity);
      description.style.setProperty('--product-offset', `${index === current ? -20 * blend : 20 * (1 - blend)}px`);
      description.setAttribute('aria-hidden', String(index !== active));
    });
  }
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(draw);
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  reducedMotion.addEventListener('change', schedule);
  shortScreen.addEventListener('change', schedule);
  draw();
})();
