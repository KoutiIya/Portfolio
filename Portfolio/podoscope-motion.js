(() => {
  'use strict';
  const states = new WeakMap();
  // Ease the visual progress, never the document scroll or input events.
  window.podoscopeEaseProgress = (element, target) => {
    const now = performance.now();
    let state = states.get(element);
    if (!state || target <= 0 || target >= 1 || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      state = { value: target, time: now };
      states.set(element, state);
      return { value: target, settled: true };
    }
    const elapsed = Math.min(50, Math.max(1, now - state.time));
    state.time = now;
    state.value += (target - state.value) * (1 - Math.exp(-elapsed / 70));
    const settled = Math.abs(target - state.value) < 0.0004;
    if (settled) state.value = target;
    return { value: state.value, settled };
  };
})();
