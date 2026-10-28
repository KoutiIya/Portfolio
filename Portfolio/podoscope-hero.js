(() => {
  'use strict';
  const track = document.querySelector('[data-sequence]');
  const stage = track.querySelector('.sequence-stage');
  const canvas = track.querySelector('canvas');
  const poster = track.querySelector('.sequence-poster img');
  const status = document.querySelector('#sequence-status');
  const context = canvas.getContext('2d', { alpha: false });
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 900px)');
  let manifest;
  let sequence;
  let target = 0;
  let lastDrawn = -1;
  let tickPending = false;
  let sizeDirty = true;
  let announced = false;
  const staticMode = () => reducedMotion.matches || !context;

  function framing(imageWidth, imageHeight) {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const scale = Math.max(width / imageWidth, height / imageHeight);
    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;
    // Centre the visible window on the product in the right third at every
    // aspect ratio. Clamp to the image edges so the canvas always stays filled.
    const focalX = 0.78;
    const x = Math.max(width - drawWidth, Math.min(0, width / 2 - drawWidth * focalX));
    // Use the upper part of the available vertical crop to lower the product
    // in the viewport while keeping the image edge-to-edge.
    return { width, height, drawWidth, drawHeight, x, y: (height - drawHeight) * 0.1 };
  }

  function positionPoster() {
    const box = framing(1920, 1080);
    if (!box.width || !box.height) return;
    poster.style.width = `${box.drawWidth}px`;
    poster.style.height = `${box.drawHeight}px`;
    poster.style.left = `${box.x}px`;
    poster.style.top = `${box.y}px`;
  }

  function revealDescription(progress) {
    const amount = Math.max(0, Math.min(1, (progress - 0.12) / 0.28));
    // No timer or CSS transition: reveal and reverse with the scroll itself.
    track.style.setProperty('--description-opacity', amount.toFixed(4));
    track.style.setProperty('--description-offset', `${((1 - amount) * 12).toFixed(2)}px`);
  }

  function paint(index, image) {
    if (!image || (index === lastDrawn && !sizeDirty)) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    const pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
    const backingWidth = Math.round(width * pixelRatio);
    const backingHeight = Math.round(height * pixelRatio);
    if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
      canvas.width = backingWidth;
      canvas.height = backingHeight;
    }
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const { drawWidth, drawHeight, x, y } = framing(image.naturalWidth, image.naturalHeight);
    context.fillStyle = '#151515';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, x, y, drawWidth, drawHeight);
    lastDrawn = index;
    sizeDirty = false;
    stage.dataset.ready = 'true';
    track.dataset.frame = String(index + 1);
    if (!announced) {
      status.textContent = 'Product sequence ready. Scroll to explore.';
      announced = true;
    }
  }

  function update() {
    tickPending = false;
    if (!sequence || staticMode()) return;
    const headerHeight = parseFloat(getComputedStyle(document.body).getPropertyValue('--hero-header-height')) || 0;
    const distance = Math.max(1, track.offsetHeight - stage.offsetHeight);
    const rawProgress = Math.max(0, Math.min(1, (headerHeight - track.getBoundingClientRect().top) / distance));
    const eased = window.podoscopeEaseProgress(track, rawProgress);
    const progress = eased.value;
    if (!eased.settled) scheduleUpdate();
    revealDescription(progress);
    target = Math.round(progress * (sequence.urls.length - 1));
    track.dataset.targetFrame = String(target + 1);
    sequence.request(target);
    const available = sequence.nearest(target);
    if (available) paint(available.index, available.image);
  }

  function scheduleUpdate() {
    if (tickPending) return;
    tickPending = true;
    requestAnimationFrame(update);
  }

  function selectFrames() {
    if (!manifest) return;
    sequence?.dispose();
    sequence = new window.PodoscopeFrames(manifest[mobile.matches ? 'mobile' : 'desktop'].frames, scheduleUpdate, 10);
    lastDrawn = -1;
    sizeDirty = true;
    stage.dataset.ready = 'false';
    track.dataset.static = String(staticMode());
    track.dataset.enhanced = String(!staticMode());
    if (staticMode()) {
      status.textContent = reducedMotion.matches
        ? 'A still product image is shown because reduced motion is enabled.'
        : 'A still product image is shown.';
    } else {
      scheduleUpdate();
    }
  }

  addEventListener('scroll', scheduleUpdate, { passive: true });
  addEventListener('resize', () => { positionPoster(); sizeDirty = true; scheduleUpdate(); }, { passive: true });
  new ResizeObserver(() => { positionPoster(); sizeDirty = true; scheduleUpdate(); }).observe(stage);
  mobile.addEventListener('change', selectFrames);
  reducedMotion.addEventListener('change', selectFrames);
  track.dataset.static = String(staticMode());
  track.dataset.enhanced = String(!staticMode());
  positionPoster();

  fetch('images/podoscope/hero/frames.json')
    .then(response => {
      if (!response.ok) throw new Error('Frame manifest could not load.');
      return response.json();
    })
    .then(data => {
      if (!data.count || data.desktop.frames.length !== data.count || data.mobile.frames.length !== data.count) {
        throw new Error('Incomplete frame manifest.');
      }
      manifest = data;
      selectFrames();
    })
    .catch(() => {
      track.dataset.static = 'true';
      track.dataset.enhanced = 'false';
      status.textContent = 'The animation could not load. A still product image is shown.';
    });
})();
