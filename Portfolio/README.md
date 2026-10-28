# Website files

This directory contains the buildless portfolio website. For preview commands, checks, Git workflow, and Cloudflare deployment configuration, see the repository's root README.

The Podoscope hero uses compressed WebP sequences from `images/podoscope/hero/`. Original PNG masters in the local `podo port` folder are intentionally excluded from Git.

Barlow is served locally from fonts/barlow under its SIL Open Font License. Existing Elza files are retained but unused. Cloudflare Workers deploys the tracked public website through the root Wrangler configuration.
