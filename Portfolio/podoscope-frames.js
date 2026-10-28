(() => {
  'use strict';
  // Keep the small compressed sequence in memory, with a bounded decoded window.
  // Scroll rendering never waits for a particular network request to finish.
  window.PodoscopeFrames = class {
    constructor(urls, ready, limit = 10) {
      this.urls = urls;
      this.ready = ready;
      this.limit = limit;
      this.blobs = new Map();
      this.images = new Map();
      this.fetching = new Set();
      this.decoding = new Set();
      this.failed = new Set();
      this.target = 0;
      this.active = false;
      this.disposed = false;
    }
    request(index) {
      this.target = index;
      this.active = true;
      this.pump();
    }
    nearest(index) {
      if (this.images.has(index)) return { index, image: this.images.get(index) };
      let closest;
      for (const [key, image] of this.images) {
        if (!closest || Math.abs(key - index) < Math.abs(closest.index - index)) closest = { index: key, image };
      }
      return closest;
    }
    pump() {
      if (!this.active || this.disposed) return;
      const order = this.urls.map((_, index) => index).sort((a, b) => Math.abs(a - this.target) - Math.abs(b - this.target));
      for (const index of order) {
        if (this.fetching.size >= 4) break;
        if (this.blobs.has(index) || this.fetching.has(index) || this.failed.has(index)) continue;
        this.fetching.add(index);
        fetch(this.urls[index]).then(response => {
          if (!response.ok) throw new Error('Frame unavailable');
          return response.blob();
        }).then(blob => {
          if (!this.disposed) this.blobs.set(index, blob);
        }).catch(() => this.failed.add(index)).finally(() => {
          this.fetching.delete(index);
          this.pump();
        });
      }
      for (const index of order.slice(0, Math.min(7, this.limit))) {
        if (this.decoding.size >= 2) break;
        if (!this.blobs.has(index) || this.images.has(index) || this.decoding.has(index) || this.failed.has(index)) continue;
        this.decoding.add(index);
        const url = URL.createObjectURL(this.blobs.get(index));
        const image = new Image();
        image.src = url;
        image.decode().then(() => {
          if (this.disposed) return;
          this.images.set(index, image);
          while (this.images.size > this.limit) {
            const farthest = [...this.images.keys()].sort((a, b) => Math.abs(b - this.target) - Math.abs(a - this.target))[0];
            this.images.delete(farthest);
          }
          this.ready();
        }).catch(() => this.failed.add(index)).finally(() => {
          URL.revokeObjectURL(url);
          this.decoding.delete(index);
          this.pump();
        });
      }
    }
    dispose() {
      this.disposed = true;
      this.images.clear();
      this.blobs.clear();
    }
  };
})();
