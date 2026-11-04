# Shaswat Pathak — academic homepage

A single-page academic site: plain HTML, CSS and JavaScript with no build step and no dependencies.
It has a light/dark theme, a side navigation rail, and live figures computed in the browser from
published or thesis values.

```
index.html          all page content (sections are marked with big comment banners)
assets/site.css     design tokens (colours, fonts) at the top, then layout
assets/site.js      theme toggle, navigation, publication filters, BibTeX, lightbox
assets/viz.js       the live figures (each one documents its physics in a comment)
assets/mol-data.js  atomic coordinates for the nanotube + Ribavirin viewer
assets/debye-data.js  phonopy heat capacity and phonon DOS of the Debye-paper compounds
assets/pca-data.js  PCA scores of 11,509 materials (loaded only when the PCA figure is on screen)
img/                portrait, university seals, paper figures (+ thumbs/)
```

## Editing

- **Text**: edit `index.html` directly. Each section starts with a banner such as
  `<!-- ===== publications ===== -->`.
- **Add a publication**: copy one `<li class="pub" data-c="phys">…</li>` block. `data-c` is
  `phys`, `eng` or `prep`, and controls the filter chips. The counts update automatically.
- **CV button**: at the bottom of `index.html`, set `window.SITE = { cv: "https://…/cv.pdf" }`.
  While it is empty, the buttons read "CV on request" and open an email.
- **Colours**: change the tokens at the top of `assets/site.css`. Light mode is in `:root`, dark mode
  in `:root[data-theme="dark"]` and in the `prefers-color-scheme` block.
- **After editing CSS/JS**, bump the `?v=` number on the `<link>`/`<script>` tags so browsers reload them.

## Preview locally

```
python -m http.server 8765
```
Then open http://localhost:8765. Add `?theme=dark` to the URL to force dark mode.

## Hosting

This folder is the web root. On GitHub: Settings → Pages → Deploy from branch → `main` / root.
The site then appears at `https://<user>.github.io/<repo>/` and can be embedded into Google Sites
as a full-page embed.

## Common updates

| I want to… | Do this in `index.html` |
|---|---|
| **Add software / a repo** | Copy a `<a class="card repo">` block in the *Code & methods* section (instructions are in the comment above it). |
| **Add a tool I use** | Add `<span>Name</span>` to the right row of the `tools` blocks (First principles, Electrodynamics, Learning, Numerics). |
| **Add a paper** | Copy a `<li class="pub" data-c="phys">` block. Use `data-c="prep"` for in-preparation work and `"eng"` for engineering. For BibTeX, add an entry to `BIB` in `assets/site.js` and a `<button class="bib" data-bib="key">` to the paper. |
| **Add a news item** | Copy one `<div><time>…</time><p>…</p></div>` in the `news` strip (keep 4, newest first). |
| **Add an honour or talk** | Copy one `<li>` in the *Honours & talks* section. |
| **Change the CV link** | Set `window.SITE = { cv: "https://…" }` near the bottom of the file. |
| **Add a research project** | Copy a whole `<article class="card proj">` block. A static figure works too: replace the `.viz` block with `<figure class="viz"><img src="img/your-figure.webp" alt="…"><p class="cap">…</p></figure>`. |

Then publish: `git add -A`, `git commit -m "update"` and `git push`. GitHub Pages refreshes in about a minute.
