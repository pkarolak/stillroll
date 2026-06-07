# StillRoll

Local infinite photo slideshow in your browser. Your files never leave your computer.

**StillRoll** turns any folder of photos into a cinematic, hands-free slideshow — perfect for parties, lobby screens, and family gatherings.

## Features

- Pick a photo folder (including nested subfolders)
- Configurable slide duration (2–60 s, default 6 s)
- Order: random or by folder path
- Cinematic crossfade with subtle Ken Burns zoom
- Automatic EXIF orientation correction (JPEG)
- Infinite loop — restarts when the last photo is shown
- Remembers your last folder (Chrome / Edge / Opera)
- Screen Wake Lock during playback
- **Languages:** Polski · English · Español

## Supported formats

`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.avif`, `.bmp`, `.svg`, `.heic`, `.heif`, `.tif`, `.tiff`

## Controls during slideshow

| Key / action | Effect |
|---|---|
| `Space` | Pause / resume |
| `←` / `→` | Previous / next slide |
| `Esc` | Exit slideshow |
| Move mouse | Show controls (auto-hide after 2.5 s) |

## Run locally

```bash
npm install
npm run dev
```

## Deploy on Vercel

1. Connect the repository to [Vercel](https://vercel.com)
2. Framework: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`

`vercel.json` includes the SPA rewrite — no extra config needed.

## Browser support

- **Chrome / Edge / Opera** — full support, folder memory via IndexedDB
- **Safari / Firefox** — folder picker fallback, no folder memory between sessions
- HTTPS required for File System Access API (Vercel provides this automatically)

## Privacy

No backend. Photos are read directly from disk via browser APIs and displayed using local `blob:` URLs. EXIF metadata is parsed in-browser with `exifr`.
