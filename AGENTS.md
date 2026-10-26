# Working on the portfolio

## Scope and workflow

- The website lives in `Portfolio/`. Keep it buildless HTML, CSS, and JavaScript unless a change requires more.
- Use `codex/` branches for substantial changes. Run `python3 scripts/check_site.py` before committing. Push the branch and open a pull request for review before merging into `main`.
- Preview locally with `python3 scripts/preview.py`. Keep browser verification honest: syntax and asset checks do not establish accessibility conformance.
- Inspect existing changes before editing. Do not modify the separate `claudinder` project as part of this site.
- Preserve original images, render masters, and scratch files locally. Do not add ignored material or credentials to commits.
- An existing Cloudflare Workers integration posts build checks for the repository. It may attempt builds when branches are pushed. Do not change its deployment settings or DNS without a deployment request.

## Design and copy

- Default to neutral dark grey, Barlow throughout, pale blue accents, and sharp corners. Light render backgrounds with black text are intentional on the Podoscope hero.
- Navigation links go to separate Design, Content, Music, and About pages. Design is home. The full name at top left links home.
- Use sentence case for body copy and title case for headings. The project name is Podoscope.
- Avoid all-caps styling, em dashes, the U+2022 character, and literal plus or slash characters in visitor-facing prose. URL paths and code syntax are exempt.
- Write plain, factual copy. Avoid slogans, unsupported claims, invented metrics, and filler.
- Keep social icons ordered Email, LinkedIn, then X, with balanced visual sizes and usable hit areas.
- Aim for WCAG 2.2 AA: contrast, keyboard access, visible focus, semantic structure, responsive reflow, and reduced-motion support. Check desktop first, then phone layouts.

## Podoscope

- The project page contains the scroll-controlled hero, a usage demonstration, a scroll-controlled studio rotation with product descriptions, a scroll-controlled software screenshot presentation, and a prototype gallery. Software screenshots switch immediately while only their accompanying text fades; gallery images use subject-focused 4:3 crops. Do not restore other earlier case-study sections without a request.
- Scroll position controls the frame and subtitle reveal directly in both directions. The first frame holds at the top. Do not introduce timed autoplay for the hero or scroll hijacking.
- Crop around the right third of the images, with the product focal point near 78 percent of source width. Prioritise desktop composition for now.
- The app has four indices and semi-automatic measurement adjustment. Its colour map represents image intensity, not calibrated pressure.
- Distinguish the built prototype, proposed exterior, design goals, and measured results. Do not invent clinical validation.
- There is an NDA. The user approved the current files for this GitHub push. New source material still needs explicit disclosure authorisation before publishing.
