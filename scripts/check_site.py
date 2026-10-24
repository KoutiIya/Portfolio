"""Check a buildless website using Python's standard library and Node.js."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1] / 'Portfolio'
errors = []


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = set()
        self.references = []
        self.labels = []
        self.title_count = 0

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'title':
            self.title_count += 1
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                errors.append(f'{self.path.name}: duplicate ID {attrs["id"]}')
            self.ids.add(attrs['id'])
        self.labels.extend(attrs.get('aria-labelledby', '').split())
        self.labels.extend(attrs.get('aria-describedby', '').split())
        for attribute in ('src', 'href', 'poster'):
            if attrs.get(attribute):
                self.references.append(attrs[attribute])
        if attrs.get('srcset'):
            self.references.extend(item.strip().split()[0] for item in attrs['srcset'].split(','))
        if tag == 'img':
            if 'alt' not in attrs:
                errors.append(f'{self.path.name}: image missing alt attribute')
            if not all(attrs.get(key, '').isdigit() for key in ('width', 'height')):
                errors.append(f'{self.path.name}: image missing explicit dimensions')


def local_target(source, reference):
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc:
        return None, None
    path = unquote(parsed.path)
    target = (ROOT / path.lstrip('/')) if path.startswith('/') else source.parent / path
    if not path:
        target = source
    target = target.resolve()
    if not target.is_relative_to(ROOT):
        errors.append(f'{source.name}: reference leaves website directory: {reference}')
        return None, None
    if target.is_dir():
        target /= 'index.html'
    return target, unquote(parsed.fragment)


pages = {}
for path in sorted(ROOT.glob('*.html')):
    page = Page(path)
    page.feed(path.read_text(encoding='utf-8'))
    pages[path.resolve()] = page
    if page.title_count != 1:
        errors.append(f'{path.name}: expected one document title')
    for label in page.labels:
        if label not in page.ids:
            errors.append(f'{path.name}: missing ARIA label target {label}')

for path, page in pages.items():
    for reference in page.references:
        target, fragment = local_target(path, reference)
        if target is None:
            continue
        if not target.is_file():
            errors.append(f'{path.name}: missing local resource {reference}')
        elif fragment and target in pages and fragment not in pages[target].ids:
            errors.append(f'{path.name}: missing fragment {reference}')

for path in ROOT.glob('*.css'):
    for match in re.finditer(r'url\(\s*[\'\"]?([^\'\"\)]+)[\'\"]?\s*\)', path.read_text()):
        reference = match.group(1).strip()
        target, _ = local_target(path, reference)
        if target is not None and not target.is_file():
            errors.append(f'{path.name}: missing CSS resource {reference}')

manifest_path = ROOT / 'images/podoscope/hero/frames.json'
try:
    manifest = json.loads(manifest_path.read_text())
    count = manifest['count']
    if not isinstance(count, int) or count < 2:
        raise ValueError('Frame count must be at least two')
    for variant in ('desktop', 'mobile'):
        frames = manifest[variant]['frames']
        if len(frames) != count or len(set(frames)) != count:
            raise ValueError(f'{variant}: frame count mismatch or duplicate paths')
        for frame in frames:
            target, _ = local_target(ROOT / 'podoscope.html', frame)
            if target is None or not target.is_file():
                errors.append(f'Hero manifest: missing frame {frame}')
except (OSError, ValueError, KeyError, TypeError) as error:
    errors.append(f'Hero manifest: {error}')

node = shutil.which('node')
if not node:
    errors.append('Node.js is required to check JavaScript syntax')
else:
    for path in sorted(ROOT.glob('*.js')):
        result = subprocess.run([node, '--check', str(path)], capture_output=True, text=True)
        if result.returncode:
            errors.append(f'{path.name}: {result.stderr.strip()}')

if errors:
    print('\n'.join(f'ERROR: {error}' for error in errors))
    sys.exit(1)
print(f'Passed: {len(pages)} HTML pages, local links, fragments, image attributes, CSS assets, hero frames, and JavaScript syntax.')
