# Koutilya Karamala Portfolio

A personal portfolio with separate Design, Content, Music, and About pages. The site uses plain HTML, CSS, and JavaScript with no build step or package installation.

## Run locally

From the repository root:

```sh
python3 scripts/preview.py
```

Open [the local preview](http://127.0.0.1:4173). The page reloads when website files change. The server listens only on the local computer. Stop it with Control-C. If the port is already occupied, reuse the existing preview or stop that server first.

## Check before committing

GitHub Actions runs the same validation on pushes and pull requests. Run it locally before committing with the command below.

Python 3.12 or newer and Node.js 22 or newer are used in CI.

```sh
python3 scripts/check_site.py
```

This checks local page links and fragments, image descriptions and dimensions, CSS asset references, hero frame manifests, and JavaScript syntax. It does not contact external links or replace browser and accessibility testing.

## Repository layout

- `Portfolio/`: deployable website, including compressed images and fonts.
- `scripts/`: local preview and validation tools.
- `.github/`: automatic checks for pushes and pull requests, plus dependency update scheduling.
- `AGENTS.md`: project conventions and design constraints.

Scratch work, original PNG render sequences, local settings, secrets, the separate Podoscope prototype app, and the separate `claudinder` project are excluded through `.gitignore`. They remain on the local computer; GitHub does not back them up.

## Current state

The Podoscope page contains a scroll-controlled 48-frame hero. Scroll position selects an image on a canvas and reveals the subtitle, with a brief settling ease. The scene prioritises the product in the right third when cropped. Reduced-motion and loading-failure modes provide a still image. Below the hero, centred project context introduces a six-second demonstration video and usage description. The video uses a browser-compatible H.264 MP4, pauses offscreen, respects reduced-motion preferences, and has accessible Play, Pause, and Replay controls. A 72-frame studio rotation follows the demonstration, paired with descriptions of step height, camera layout, and form and fabrication. It follows scrolling with a brief settling ease, uses compressed WebP derivatives, and keeps the original PNG sequence local. A pinned software presentation follows, using four user-supplied software screenshots in the requested order, contained without cropping in a shared 16:9 screen area. Scroll position fades the text between image review, measurement adjustment, comparison, and reporting. The screenshot on the right switches immediately without fading or moving. Reduced-motion and short-screen layouts use ordinary document flow. A four-photo prototype gallery follows, using a responsive grid with subject-focused 4:3 crops. Other portfolio pages and their approved media are included.

## Git workflow

1. Start substantial changes on a branch, using the `codex/` prefix for agent work.
2. Make a focused change, run the checks, and inspect it in the browser.
3. Commit and push the branch.
4. Open a pull request. Review the diff and passing checks before merging into `main`.

Keep `main` as the stable, reviewed version. Commit useful checkpoints rather than waiting for the entire portfolio to be finished. A pushed commit provides a remote backup of tracked files.

## Cloudflare deployment

The existing Cloudflare Workers project is named `portfolio` and is connected to this GitHub repository. `wrangler.toml` defines static assets and the custom domains `koutilya.com` and `www.koutilya.com`.

Deploy command: `npx wrangler deploy` from the repository root. Wrangler runs `python3 scripts/prepare_deploy.py` first. That script copies only Git-tracked website files into the ignored `dist/` directory, excluding local app source, raw renders, scratch files, and untracked files. Do not deploy the working `Portfolio/` directory directly.

Run a local packaging check without publishing:

```sh
python3 scripts/prepare_deploy.py
wrangler deploy --dry-run
```

Production should follow the reviewed `main` branch. Non-production builds should use `npx wrangler versions upload` so branch pushes create review versions rather than replace the domain. Existing Cloudflare build settings are configured in the dashboard. Cloudflare account authentication or the connected build integration is required for actual publication.


The design and software labels stay stationary while the content beneath changes. Counters and the render caption are omitted. The gallery uses the reversed photo order and the supplied IP ownership line, with contact icons at the bottom of the project page. The home-page thumbnail uses the first studio rotation frame.

The project includes an MVP outcome and remaining limitations before the gallery. Gallery thumbnails open a modal carousel with uncropped images, previous and next controls, arrow-key navigation, Escape to close, and restored keyboard focus. Image descriptions and position counts are announced to assistive technology without visible captions. Design Priorities appears before the product rotation, with three unboxed explanations of affordability, platform height, and the software workflow. The earlier comparison table and references were removed. The full research document and working proposal remain local.

The shared motion helper eases visual progress with a 70 millisecond time constant and a finite settling threshold. It does not intercept wheel, touch, or keyboard scrolling, and is bypassed for reduced motion. The introduction identifies the intended practitioner and recordable assessment output. Colour-map copy describes image intensity and contact patterns, matching the backend implementation.

The demonstration video stays pinned for an additional 65 percent of the viewport height, capped at 560 pixels of scroll distance. The hold is disabled for reduced motion and viewports below 600 pixels tall. Playback remains independent of scroll position.

## Phone layout

Portrait phones retain the scroll-controlled hero, studio rotation, and shared software screen with text-only fades. The studio render and its descriptions are stacked to fit the viewport. Short screens and reduced-motion settings use ordinary flow for the studio and software sections. Phone scrolling does not use desktop inertia or the demonstration hold.

The shared frame loader preloads compressed sequence data and decodes a bounded window around the current scroll position. It paints the nearest decoded frame while the exact target is preparing, avoiding frozen output during rapid scrolling. Studio frames have smaller phone variants; originals remain intact.

Responsive WebP image variants are used for screenshots and gallery thumbnails. Full-resolution screenshots and gallery photos open in separate groups within the image viewer. On phones, controls sit below the image and closing the viewer restores the reading position. Barlow is served locally under its SIL Open Font License, without Google Fonts requests.
