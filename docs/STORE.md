# Chrome Web Store — submission guide

Copy-paste ready texts for the [Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## URLs

| Field | URL |
|-------|-----|
| Privacy policy | https://tab-memory.tsitser.com/privacy/ |
| Homepage | https://tab-memory.tsitser.com/ |
| Support | https://tab-memory.tsitser.com/support/ |
| Support email | tab-memory@tsitser.com |

## Pre-submit checklist

- [ ] Run `npm run zip` and upload `tab-memory-extension.zip`
- [ ] Privacy policy live at HTTPS URL above
- [ ] 2–3 store screenshots uploaded (see [Screenshots](#screenshots))
- [ ] Store listing text filled in (English required)
- [ ] Single purpose + data usage completed
- [ ] Permission justifications entered
- [ ] Manual smoke test passed (see [Manual test](#manual-test-before-submit))
- [ ] Category: **Productivity**
- [ ] No remote code — all logic bundled in the package

---

## Store listing (English)

### Short description (max 132 characters)

```
Save tabs with a screenshot and note, then close them — recover context anytime from local history.
```

*(91 characters)*

### Detailed description

```
Tab Memory helps you close tabs without losing why you opened them.

Click the extension icon, add a short note, and save: Tab Memory captures a screenshot of the page, stores the URL and title, and closes the tab. Everything stays on your computer — no account, no cloud, no sync.

Browse your saved tabs on the History page: preview screenshots, sort by date or title, reopen URLs in a new tab, or delete entries you no longer need.

Features:
• Screenshot + note + URL + title saved in one action
• Save & close tab immediately
• History page with visual previews
• Sort by date or title
• Storage stats (saved tabs count and disk usage)
• Light and dark UI (follows system theme)
• 8 languages in the extension UI

Privacy first: Tab Memory does not collect, transmit, or sell any data. All screenshots and notes are stored locally in your browser (IndexedDB) and are never sent to our servers.

Perfect for researchers, developers, students, and anyone who hoards tabs “just in case”.
```

### Single purpose

```
Tab Memory has one purpose: let users save the current browser tab locally (screenshot, URL, title, and optional note) and close it, then browse and reopen saved tabs from a local history page. The extension does not modify web pages, inject ads, or collect analytics.
```

### Data usage (Privacy practices)

Use these answers in the Chrome Web Store **Privacy practices** form:

| Question | Answer |
|----------|--------|
| Does the extension collect or transmit user data? | **No** |
| Is user data sold to third parties? | **No** |
| Is user data used for purposes unrelated to the extension's single purpose? | **No** |
| Is user data encrypted in transit? | **Not applicable** — nothing is transmitted |
| Is user data encrypted at rest? | **Stored locally** in the browser (IndexedDB); encryption is handled by the browser/OS |
| Can users request data deletion? | **Yes** — delete individual entries in History, use “Clear history”, or uninstall the extension |
| Certified compliance | Select **No data collected** / local-only storage as applicable |

**Certification statement (if prompted):**

```
Tab Memory does not collect, transmit, or sell user data. Screenshots, URLs, titles, notes, and timestamps are stored only on the user's device in IndexedDB. No accounts, analytics, or remote servers are used.
```

---

## Permission justifications

Paste into the **Permission justification** fields when Google asks:

### `activeTab`

```
Used only when the user clicks “Save and close” in the popup. Captures a screenshot of the currently active tab the user chose to save. No background access to tabs without user action.
```

### `tabs`

```
Reads the active tab’s URL and title when saving; closes the tab after a successful save; opens the History page and reopens saved URLs when the user clicks “Open” in history.
```

### `storage` / `unlimitedStorage`

```
Stores screenshots (JPEG) and metadata (URL, title, note, timestamp) locally in IndexedDB. unlimitedStorage is required because screenshot data can exceed default storage quotas over time.
```

### `<all_urls>` (host permission)

```
Required to capture screenshots and reopen URLs on any website the user explicitly chooses to save. Tab Memory does not read or modify page content in the background — access occurs only during user-initiated save or reopen actions.
```

---

## Screenshots

Chrome Web Store requires **at least one** screenshot; **2–3** is recommended.

| Spec | Value |
|------|--------|
| Size | **1280×800** (preferred) or **640×400** |
| Format | PNG or JPEG |
| Content | Real UI captures — not mockups |

### Recommended set

1. **Popup** — note field filled in, “Save and close” visible (light or dark theme).
2. **History** — grid of saved tabs with previews and stats bar.
3. **History detail** (optional) — sort dropdown or a card with note + “Open” / “Delete”.

### How to capture

1. `npm run build` → load `dist/` in `chrome://extensions` (Load unpacked).
2. Open a normal https page (not `chrome://`).
3. **Popup screenshot:** click the extension icon → resize popup if needed → macOS: `Cmd+Shift+4` + Space on window; Windows: Snipping Tool; or DevTools device toolbar at 1280×800.
4. **History screenshot:** open History from popup → capture full tab at 1280×800 (browser zoom 100%).
5. Save files to `store-assets/` (e.g. `01-popup.png`, `02-history.png`, `03-history-sort.png`).
6. Upload in Dashboard → **Store listing** → **Screenshots**.

Optional promo images: small tile **440×280**, marquee **1400×560** (same branding as screenshots).

---

## Manual test before submit

Run through this once on a clean profile or after `Load unpacked`:

| Step | Expected result |
|------|-----------------|
| Open any https page | Page loads normally |
| Open popup, enter a note, click **Save and close** | Screenshot saved, tab closes, success message |
| Reopen popup → **History** | History page opens with the new entry |
| Verify card | Screenshot preview, title, URL, note, date visible |
| Click **Open** | URL opens in a new tab |
| Click **Delete** on one entry | Entry removed after confirm |
| **Clear history** | All entries removed |
| Try saving `chrome://extensions` | Error: page cannot be captured |
| Uninstall extension (optional) | Local IndexedDB data removed |

---

## Optional: Russian store listing

Add under **Localized listing → Russian** if you want a RU card in the store.

**Short description:**

```
Сохраняйте вкладки со скриншотом и заметкой, закрывайте их — контекст не потеряется.
```

**Detailed description:**

```
Tab Memory помогает закрывать вкладки, не забывая, зачем вы их открывали.

Нажмите на иконку, добавьте заметку и сохраните: расширение сделает скриншот страницы, запомнит URL и заголовок и закроет вкладку. Вся история хранится только на вашем компьютере — без аккаунта и облака.

На странице «История» можно просматривать сохранённые вкладки с превью, сортировать по дате или названию, снова открывать URL или удалять записи.

Tab Memory не собирает и не передаёт ваши данные. Скриншоты и заметки хранятся локально в браузере (IndexedDB).
```

---

## Build & upload

```bash
npm run zip
```

Upload `tab-memory-extension.zip` in the Developer Dashboard.

Website deploy: see [WEBSITE.md](./WEBSITE.md).
