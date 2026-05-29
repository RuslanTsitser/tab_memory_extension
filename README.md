# Tab Memory

Browser extension (Chrome / Edge / Brave) that saves tabs **with context** — screenshot, note, URL, and title — then closes them so they do not clutter the window. Everything stays **local** on your machine.

## Features

- **Popup:** note field, save & close, open history
- **Save:** visible-tab screenshot (JPEG), metadata in IndexedDB, tab closed
- **History page:** count & storage size, sort by date/title, preview cards, open URL, delete one or clear all
- **Material Design 3** UI (light/dark via system theme)
- **i18n:** English and Russian

## Development

```bash
npm install
npm run dev      # watch build → load dist/ in chrome://extensions
npm run build    # production build
npm run zip      # build + tab-memory-extension.zip for the store
```

### Load unpacked

1. `npm run build`
2. Open `chrome://extensions` → Developer mode → **Load unpacked**
3. Select the `dist` folder

## Publish to Chrome Web Store

1. Run `npm run zip` and upload `tab-memory-extension.zip`
2. Prepare assets: 128×128 icon, 1280×800 screenshots (popup + history)
3. Link **Privacy policy** — use `PRIVACY.md` (host on GitHub Pages or your site)
4. Declare: **No remote code**, single purpose (“save tabs locally with context”), permissions justified in listing
5. Category suggestion: **Productivity**

## Project structure

```
src/
  popup/          Extension action popup
  history/        Full-tab history UI
  background/     Service worker (save flow)
  lib/            IndexedDB + capture logic
  styles/         Material Design tokens & components
assets/           icon-source.png (original), icon-square.png (cropped)
icons/            Generated 16–128 PNG icons (npm run build)
_locales/         en, ru
```

## License

MIT
