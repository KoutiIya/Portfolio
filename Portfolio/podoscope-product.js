(() => {
  'use strict';
  const track = document.querySelector('[data-product-round]');
  if (!track) return;
  const stage = track.querySelector('.product-stage');
  const display = track.querySelector('[data-product-frame]');
  const descriptions = [...track.querySelectorAll('[data-product-description]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const shortScreen = matchMedia('(max-height: 600px)');
  const mobile = matchMedia('(max-width: 900px)');
  const canvas = track.querySelector('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  let sequence;
  let pending = false;
  let enabled = false;
  let previousEnabled;
  let shown = -1;
  let sizeDirty = true;
  const count = 72;
  const clamp = value => Math.max(0, Math.min(1, value));
  function selectFrames() {
    sequence?.dispose();
    const directory = mobile.matches ? 'studio-round-mobile' : 'studio-round';
    sequence = new window.PodoscopeFrames(Array.from({ length: count }, (_, index) => `images/podoscope/${directory}/${String(index + 1).padStart(4, '0')}.webp`), schedule, 10);
    shown = -1;
    sizeDirty = true;
    schedule();
  }
  function show(index, image) {
    if (index === shown && !sizeDirty) return;
    const width = display.clientWidth;
    const height = display.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.drawImage(image, 0, 0, width, height);
    canvas.hidden = false;
    shown = index;
    sizeDirty = false;
    track.dataset.frame = String(index + 1);
  }
  function draw() {
    pending = false;
    enabled = !reducedMotion.matches && !shortScreen.matches && !!context;
    if (!enabled && previousEnabled === false) return;
    previousEnabled = enabled;
    track.dataset.enhanced = String(enabled);
    if (!enabled) {
      descriptions.forEach(description => description.removeAttribute('aria-hidden'));
      canvas.hidden = true;
      shown = -1;
      return;
    }
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    const bounds = track.getBoundingClientRect();
    const rawProgress = clamp((top - bounds.top) / Math.max(1, track.offsetHeight - stage.offsetHeight));
    const eased = window.podoscopeEaseProgress(track, rawProgress);
    const progress = eased.value;
    if (!eased.settled) schedule();
    const target = Math.round(progress * (count - 1));
    // Start warming the compressed sequence as the section approaches the viewport.
    if (bounds.top < innerHeight * 1.5 && bounds.bottom > 0) {
      sequence.request(target);
      const available = sequence.nearest(target);
      if (available) show(available.index, available.image);
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
  addEventListener('resize', () => { sizeDirty = true; schedule(); }, { passive: true });
  new ResizeObserver(() => { sizeDirty = true; schedule(); }).observe(display);
  reducedMotion.addEventListener('change', schedule);
  shortScreen.addEventListener('change', schedule);
  mobile.addEventListener('change', selectFrames);
  selectFrames();
})();
