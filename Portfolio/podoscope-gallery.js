(() => {
  'use strict';
  const dialog = document.querySelector('[data-gallery-dialog]');
  const entries = [...document.querySelectorAll('[data-gallery-open], [data-software-open]')];
  let links = entries.filter(link => link.hasAttribute('data-gallery-open'));
  if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('[data-gallery-expanded]');
  const caption = dialog.querySelector('[data-gallery-caption]');
  let index = 0;
  let opener;
  let previousOverflow;
  let pointerStart;
  let bodyScrollState;

  function show(next) {
    index = (next + links.length) % links.length;
    const thumbnail = links[index].querySelector('img');
    image.src = links[index].href;
    image.alt = thumbnail.alt;
    image.width = thumbnail.naturalWidth || Number(thumbnail.width);
    image.height = thumbnail.naturalHeight || Number(thumbnail.height);
    caption.textContent = `${index + 1} of ${links.length}. ${thumbnail.alt}`;
  }
  entries.forEach(link => {
    const software = link.hasAttribute('data-software-open');
    const group = entries.filter(item => item.hasAttribute(software ? 'data-software-open' : 'data-gallery-open'));
    const position = group.indexOf(link);
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-label', `Expand ${software ? "software " : ""}image ${position + 1}: ${link.querySelector('img').alt}`);
    link.addEventListener('click', event => {
      // Preserve ordinary link behaviour for modified clicks.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const openingScroll = scrollY;
      opener = link;
      links = group;
      dialog.querySelector('#gallery-viewer-title').textContent = software ? 'Software' : 'Gallery';
      show(position);
      previousOverflow = document.documentElement.style.overflow;
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
      if (matchMedia('(max-width: 700px), (max-width: 900px) and (max-height: 500px)').matches) {
        bodyScrollState = { y: openingScroll, position: document.body.style.position, top: document.body.style.top, width: document.body.style.width };
        document.body.style.position = 'fixed';
        document.body.style.top = `-${bodyScrollState.y}px`;
        document.body.style.width = '100%';
      }
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
  addEventListener('pagehide', () => { if (dialog.open) dialog.close(); });
  image.addEventListener('pointercancel', () => { pointerStart = null; });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow || '';
    if (bodyScrollState) {
      const saved = bodyScrollState;
      document.body.style.position = saved.position;
      document.body.style.top = saved.top;
      document.body.style.width = saved.width;
      bodyScrollState = null;
      scrollTo(0, saved.y);
    }
    opener?.focus({ preventScroll: true });
  });
})();
