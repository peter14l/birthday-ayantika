# For Ayantika

An editorial keepsake. A letter, twenty photographs, eight films and a handful of
small things — laid out like a printed book, with no occasion attached.

Static HTML, CSS and vanilla JavaScript. No build step, no framework, no tracking.

## Preview locally

```sh
npm start            # http://127.0.0.1:8080
```

Or just open `index.html` in a browser. The page works without a server; the
preview server exists so range requests and MIME types behave like a real host.

## Structure

```
index.html                  the whole document
css/style.css               design tokens → layout → components → print
js/main.js                  content lists, rendering, viewers, motion
scripts/optimize-images.py  regenerates the web plates + social card
assets/photos/*.jpg         full-resolution originals (local only, never published)
assets/photos/plates/*.webp web-sized plates (published, ~1.5 MB total)
assets/music.mp3            ambient audio, preload="none"
server.js                   local preview only
```

## Editing the content

**Photographs** live in the `photographs` array at the top of `js/main.js`:

```js
{ src: 'IMG-20260705-005028-555', w: 1080, h: 1920 }
```

- `src` is the file name inside `assets/photos/plates/`, without `.webp`.
- `w`/`h` are the real pixel dimensions. They reserve space before the image
  loads, which keeps the page from shifting. Keep them accurate.
- The plates are laid out as one contact sheet in three columns (two on small
  screens, two in print). There are no captions; the images sit together and
  open full-size when clicked.

**Films** live in the `films` array. Each entry needs a `title`, the remote
`file` name, and the `poster` plate name. The base URL is `FILM_BASE`.

**Prose** is plain HTML in `index.html`. The letter, the four reasons, the five
memories and the closing are all editable in place. Roman numerals in the
contents and chapter heads are the only numbers that need to stay in sync.

### Adding new photographs

1. Drop the originals into `assets/photos/`.
2. Run `npm run images` (needs Python 3 + Pillow). This writes the WebP plates
   into `assets/photos/plates/` and prints a mapping you can copy.
3. Add entries to the `photographs` array.
4. Update the two counts: the masthead line and the chapter title
   ("Twenty photographs", "Eight films").

## Deploying to GitHub Pages

The site is static, so GitHub Pages serves it directly. Only the optimised
plates are committed: the full-resolution originals in `assets/photos/*.jpg` are
ignored, so a fresh clone needs them added back before `npm run images` will
work.

```sh
git init
git add .
git commit -m "Rework the keepsake as an editorial page"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Then either:

- **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**, or
- keep the included workflow (`.github/workflows/pages.yml`) and set
  **Source: GitHub Actions**.

`.nojekyll` is present, so files are served as-is.

The social card at `assets/og.jpg` is generated from the background photograph.
Swap it out if you want a different preview when the link is shared.

## Notes

- Two editions share one token set: the day edition (warm paper, ink) and the
  night edition (warm ink, bone). The corner toggle switches between them,
  remembers the choice, and otherwise follows `prefers-color-scheme`. An inline
  script in the head applies the stored choice before the first paint, so there
  is no flash of the wrong theme.
- Motion is GSAP + ScrollTrigger + Lenis from a pinned CDN. If the CDN is
  unavailable, the page renders in full and simply does not animate.
- `prefers-reduced-motion: reduce` disables smooth scrolling, the reveals and all
  transitions. Nothing is hidden behind an animation.
- Photographs open in a native `<dialog>`, which brings focus trapping, Escape to
  close and focus restoration without a custom implementation.
- Audio is opt-in, `preload="none"`, and the choice is remembered.
- `server.js` is preview-only. It is not required by GitHub Pages.
