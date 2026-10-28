(() => {
  'use strict';
  const track = document.querySelector('[data-software]');
  if (!track) return;
  const stage = track.querySelector('.software-stage');
  const panels = [...track.querySelectorAll('[data-software-panel]')];
  const screens = [...track.querySelectorAll('[data-software-screen]')];
  const screenContainer = track.querySelector('.software-screens');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const shortScreen = matchMedia('(max-height: 600px)');
  const compact = matchMedia('(max-width: 700px), (max-width: 900px) and (max-height: 500px)');
  let pending = false;
  let previousEnhanced;
  const clamp = value => Math.max(0, Math.min(1, value));

  function draw() {
    pending = false;
    // Native markup keeps each image with its explanation, without a phone layout shift.
    const enhanced = !reducedMotion.matches && !shortScreen.matches && !compact.matches;
    if (!enhanced && previousEnhanced === false) return;
    previousEnhanced = enhanced;
    screens.forEach((screen, index) => {
      const parent = enhanced ? screenContainer : panels[index];
      if (screen.parentElement !== parent) parent.append(screen);
      const image = screen.querySelector('img');
      if (enhanced && image.loading !== 'eager') image.loading = 'eager';
    });
    track.dataset.enhanced = String(enhanced);
    if (!enhanced) {
      panels.forEach(panel => {
        panel.removeAttribute('aria-hidden');
        delete panel.dataset.active;
        panel.style.removeProperty('--panel-opacity');
        panel.style.removeProperty('--panel-offset');
      });
      screens.forEach(screen => {
        delete screen.dataset.active;
        screen.removeAttribute('aria-hidden');
      });
      return;
    }
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    const distance = Math.max(1, track.offsetHeight - stage.offsetHeight);
    const rawProgress = clamp((top - track.getBoundingClientRect().top) / distance);
    const eased = window.podoscopeEaseProgress(track, rawProgress);
    const progress = eased.value;
    if (!eased.settled) schedule();
    // Each view holds, then fades out before the next fades upward into place.
    // Avoid overlapping readable text, including when scrolling stops midway.
    const position = Math.min(panels.length - 1, progress * panels.length);
    const current = Math.floor(position);
    const blend = clamp((position - current - 0.65) / 0.35);
    const active = Math.min(panels.length - 1, current + (blend >= 0.5 ? 1 : 0));
    panels.forEach((panel, index) => {
      const opacity = index === current ? 1 - clamp(blend * 2) : index === current + 1 ? clamp((blend - 0.5) * 2) : 0;
      const offset = index === current ? -20 * blend : 20 * (1 - blend);
      panel.style.setProperty('--panel-opacity', opacity);
      panel.style.setProperty('--panel-offset', `${offset}px`);
      panel.dataset.active = String(index === active);
      panel.setAttribute('aria-hidden', String(index !== active));
      screens[index].dataset.active = String(index === active);
      screens[index].setAttribute('aria-hidden', String(index !== active));
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
  compact.addEventListener('change', schedule);
  draw();
})();
