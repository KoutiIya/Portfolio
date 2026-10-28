(() => {
  'use strict';
  const player = document.querySelector('[data-demonstration]');
  if (!player || !('IntersectionObserver' in window)) return;
  const video = player.querySelector('video');
  const button = player.querySelector('button');
  const label = button.querySelector('[data-video-label]');
  const icons = {
    Play: button.querySelector('[data-control-play]'),
    Pause: button.querySelector('[data-control-pause]'),
    Replay: button.querySelector('[data-control-replay]')
  };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hold = player.closest('[data-demonstration-hold]');
  function sizeHold() {
    if (!hold) return;
    const enabled = !reducedMotion.matches && innerHeight >= 600;
    hold.dataset.enabled = String(enabled);
    hold.style.setProperty('--demo-hold-height', `${player.offsetHeight + Math.min(innerHeight * 0.65, 560)}px`);
  }
  addEventListener('resize', sizeHold, { passive: true });
  reducedMotion.addEventListener('change', sizeHold);
  new ResizeObserver(sizeHold).observe(player);
  sizeHold();
  let visible = false;
  let manuallyPaused = false;

  function updateControl() {
    const action = video.ended ? 'Replay' : video.paused ? 'Play' : 'Pause';
    label.textContent = action;
    Object.entries(icons).forEach(([name, icon]) => {
      icon.style.display = name === action ? '' : 'none';
    });
    button.setAttribute('aria-label', `${action} demonstration video`);
  }
  async function play() {
    try {
      await video.play();
      // A pending play request must not restart an offscreen video.
      if (!visible || document.hidden) video.pause();
    } catch {
      updateControl();
    }
  }
  button.addEventListener('click', () => {
    if (video.paused || video.ended) {
      manuallyPaused = false;
      if (video.ended) video.currentTime = 0;
      play();
    } else {
      manuallyPaused = true;
      video.pause();
    }
  });
  ['play', 'pause', 'ended'].forEach(event => video.addEventListener(event, updateControl));
  video.addEventListener('error', () => {
    video.controls = true;
    button.hidden = true;
  });
  function syncVisibility() {
    if (!visible || document.hidden || reducedMotion.matches) {
      video.pause();
    } else if (!manuallyPaused && !video.ended) {
      play();
    }
  }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.5;
    syncVisibility();
  }, { threshold: [0, 0.5] }).observe(video);
  document.addEventListener('visibilitychange', syncVisibility);
  reducedMotion.addEventListener('change', syncVisibility);
  video.controls = false;
  button.hidden = false;
  updateControl();
})();
