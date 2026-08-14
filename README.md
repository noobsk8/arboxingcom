# AR Boxing Website

Static landing page for AR Boxing.

## Files for GitHub Pages

- `index.html` - the landing page
- `styles.css` - all page styling
- `assets/arboxing-logo.png` - logo/favicon image
- `assets/og.png` - social sharing preview image
- `.nojekyll` - tells GitHub Pages to serve files directly

## GitHub Pages Setup

Use the repository root as the Pages source:

1. Push this repository to GitHub.
2. Open the repository settings.
3. Go to Pages.
4. Set source to deploy from a branch.
5. Choose the main branch and `/` root folder.

No paid GitHub plan, npm install, build step, backend, database, or checkout
flow is required for this static launch page when the repository is public.

## Local Preview

You can open `index.html` directly in a browser.

For a local URL, run a simple static server from this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.
