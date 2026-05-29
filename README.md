# Tab Memory

Browser extension (Chrome / Edge / Brave) that saves tabs **with context** — screenshot, note, URL, and title — then closes them so they do not clutter the window. Everything stays **local** on your machine.

## Features

- **Popup:** note field, save & close, open history
- **Save:** visible-tab screenshot (JPEG), metadata in IndexedDB, tab closed
- **History page:** count & storage size, sort by date/title, preview cards, open URL, delete one or clear all
- **Adaptive UI** (light/dark via system theme)
- **i18n:** English, Russian, German, Spanish, French, Portuguese, Japanese, Chinese (browser locale for extension; 8 languages on website)

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

See **[docs/STORE.md](./docs/STORE.md)** — English listing text, permission justifications, data usage answers, screenshot guide, and manual test checklist.

Quick steps: `npm run zip` → upload `tab-memory-extension.zip` → privacy URL https://tab-memory.tsitser.com/privacy/ → support email tab-memory@tsitser.com

## Project structure

```
src/
  popup/          Extension action popup
  history/        Full-tab history UI
  background/     Service worker (save flow)
  lib/            IndexedDB + capture logic
  styles/         Shared UI styles and components
website/
  index.html      Landing (EN)
  ru/index.html   Landing (RU)
  privacy/        Privacy policy
  support/        Support
icons/            Generated 16–128 PNG icons (npm run build)
_locales/         en, ru
```

## License

MIT

## Website

**https://tab-memory.tsitser.com** — landing, privacy, support (source in `website/`, deploy via Vercel). See [docs/WEBSITE.md](./docs/WEBSITE.md).
