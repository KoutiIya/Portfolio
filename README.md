# Koutilya Karamala Portfolio

A personal portfolio with separate Design, Content, Music, and About pages. The site uses plain HTML, CSS, and JavaScript with no build step or package installation.

## Run locally

From the repository root:

```sh
python3 scripts/preview.py
```

Open [the local preview](http://127.0.0.1:4173). The page reloads when website files change. The server listens only on the local computer. Stop it with Control-C. If the port is already occupied, reuse the existing preview or stop that server first.

## Check before committing

Python 3.12 or newer and Node.js 22 or newer are used in CI.

```sh
python3 scripts/check_site.py
```

This checks local page links and fragments, image descriptions and dimensions, CSS asset references, hero frame manifests, and JavaScript syntax. It does not contact external links or replace browser and accessibility testing.

## Repository layout

- `Portfolio/`: deployable website, including compressed images and fonts.
- `scripts/`: local preview and validation tools.
- `.github/workflows/`: automatic checks for pushes and pull requests.
- `AGENTS.md`: project conventions and design constraints.

Scratch work, original PNG render sequences, local settings, secrets, and the separate `claudinder` project are excluded through `.gitignore`. They remain on the local computer; GitHub does not back them up.

## Current state

The Podoscope page contains a scroll-controlled 48-frame hero. Scroll position selects an image on a canvas and reveals the subtitle. The scene prioritises the product in the right third when cropped. Reduced-motion and loading-failure modes provide a still image. Other portfolio pages and their approved media are included.

## Git workflow

1. Start substantial changes on a branch, using the `codex/` prefix for agent work.
2. Make a focused change, run the checks, and inspect it in the browser.
3. Commit and push the branch.
4. Open a pull request. Review the diff and passing checks before merging into `main`.

Keep `main` as the stable, reviewed version. Commit useful checkpoints rather than waiting for the entire portfolio to be finished. A pushed commit provides a remote backup of tracked files.

## Future Cloudflare deployment

Cloudflare hosting is not configured by this setup. When connecting Cloudflare Pages:

- Framework preset: None.
- Build command: leave empty.
- Output directory: `Portfolio`, relative to the repository root.
- Production branch: `main`.
- Use branch previews to review changes before production.

The deployment folder must contain only website files. Deploy from a clean Git checkout so ignored local render masters are not uploaded. Pushing to GitHub alone does not configure Cloudflare or change DNS.

Before enabling production deployment, verify the current Cloudflare project and domain configuration. Existing external integrations can deploy automatically when their configured branch changes.
