(() => {
  'use strict';
  const dialog = document.querySelector('[data-gallery-dialog]');
  const links = [...document.querySelectorAll('[data-gallery-open]')];
  if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('[data-gallery-expanded]');
  const caption = dialog.querySelector('[data-gallery-caption]');
  let index = 0;
  let opener;
  let previousOverflow;
  let pointerStart;

  function show(next) {
    index = (next + links.length) % links.length;
    const thumbnail = links[index].querySelector('img');
    image.src = links[index].href;
    image.alt = thumbnail.alt;
    image.width = thumbnail.naturalWidth || Number(thumbnail.width);
    image.height = thumbnail.naturalHeight || Number(thumbnail.height);
    caption.textContent = `${index + 1} of ${links.length}. ${thumbnail.alt}`;
  }
  links.forEach((link, position) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-label', `Expand image ${position + 1}: ${link.querySelector('img').alt}`);
    link.addEventListener('click', event => {
      // Preserve ordinary link behaviour for modified clicks.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      show(position);
      previousOverflow = document.documentElement.style.overflow;
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    });
  });
  dialog.querySelector('[data-gallery-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-gallery-previous]').addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-gallery-next]').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'Home') { event.preventDefault(); show(0); }
    if (event.key === 'End') { event.preventDefault(); show(links.length - 1); }
  });
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  image.addEventListener('pointerdown', event => { pointerStart = { x: event.clientX, y: event.clientY }; });
  image.addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const x = event.clientX - pointerStart.x;
    const y = event.clientY - pointerStart.y;
    if (Math.abs(x) > 50 && Math.abs(x) > Math.abs(y) * 1.5) show(index + (x < 0 ? 1 : -1));
    pointerStart = null;
  });
  image.addEventListener('pointercancel', () => { pointerStart = null; });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow || '';
    opener?.focus({ preventScroll: true });
  });
})();
