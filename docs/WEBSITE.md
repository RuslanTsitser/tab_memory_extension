# Сайт Tab Memory (Vercel)

Статический лендинг в `website/` — описание расширения, privacy, support.

## URL (после деплоя)

| Страница | Путь |
|----------|------|
| Главная | `/` (en), `/ru/`, `/de/`, `/es/`, `/fr/`, `/pt/`, `/ja/`, `/zh/` |
| Privacy | `/privacy/` (+ префикс языка, напр. `/de/privacy/`) |
| Support | `/support/` (+ префикс языка) |

Языки сайта: **en**, **ru**, **de**, **es**, **fr**, **pt**, **ja**, **zh** — переключатель в шапке.

**Privacy Policy для Chrome Web Store:** `https://<your-domain>/privacy/`

## Автодеплой (Vercel + GitHub)

Каждый **push в `main`** автоматически публикует сайт — без GitHub Actions и без secrets.

### Первоначальная настройка (один раз)

1. Откройте [vercel.com/new](https://vercel.com/new)
2. **Import** репозитория `RuslanTsitser/tab_memory_extension`
3. Настройки проекта:
   - **Root Directory:** `.` (корень репозитория)
   - **Framework Preset:** Other
   - **Build Command:** `node scripts/prepare-website.mjs` (из `vercel.json`)
   - **Install Command:** `npm install --no-save sharp` (генерация logo/icon на Linux)
   - **Output Directory:** `website`
4. Нажмите **Deploy**

После этого production обновляется при каждом merge/push в `main`.

### Проверка настроек

Vercel → Project → **Settings → General**:

| Параметр | Значение |
|----------|----------|
| Root Directory | `.` |
| Output Directory | `website` (из `vercel.json`) |
| Production Branch | `main` |

Vercel → **Settings → Git** — репозиторий должен быть подключён.

## Локальный просмотр

```bash
npm run website:preview
```

## Кастомный домен

Vercel → Project → **Settings → Domains** → добавить домен.

Укажите его в Chrome Web Store:

- Privacy: `https://<домен>/privacy/`
- Homepage: `https://<домен>/`
