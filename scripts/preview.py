"""Serve the portfolio on localhost with automatic reload and no dependencies."""
from argparse import ArgumentParser
from hashlib import sha256
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'Portfolio'
RELOAD = b'''<script>
(async () => {
  let version;
  async function check() {
    try {
      const response = await fetch('/__preview_version', {cache: 'no-store'});
      if (!response.ok) return;
      const next = await response.text();
      if (version !== undefined && next !== version) {
        location.reload();
        return;
      }
      version = next;
    } catch (_) {}
  }
  await check();
  setInterval(check, 800);
})();
</script>'''


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        if self.path == '/__preview_version':
            state = sha256()
            for path in sorted(ROOT.rglob('*')):
                if 'podo port' in path.parts:
                    continue
                if path.is_file() and path.suffix in {
                    '.html', '.css', '.js', '.json', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.woff2'
                }:
                    stat = path.stat()
                    state.update(f'{path.relative_to(ROOT)}:{stat.st_mtime_ns}:{stat.st_size}'.encode())
            data = state.hexdigest().encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        super().do_GET()

    def send_head(self):
        path = Path(self.translate_path(self.path))
        if path.is_dir():
            path /= 'index.html'
        if path.is_file() and path.suffix == '.html':
            data = path.read_bytes().replace(b'</body>', RELOAD + b'</body>')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            return BytesIO(data)
        return super().send_head()

    def log_message(self, format, *args):
        if '/__preview_version' not in str(args):
            super().log_message(format, *args)


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4173)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    print(f'Portfolio preview: http://127.0.0.1:{args.port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
