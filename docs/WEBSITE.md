# Сайт Tab Memory (Vercel)

Статический лендинг в `website/` — описание расширения, privacy, support.

## URL (после деплоя)

| Страница | Путь |
|----------|------|
| Главная (EN) | `/` |
| Главная (RU) | `/ru/` |
| Privacy (EN) | `/privacy/` |
| Privacy (RU) | `/privacy/ru.html` |
| Support | `/support/` |

**Privacy Policy для Chrome Web Store:** `https://<your-domain>/privacy/`

## Автодеплой (Vercel + GitHub)

Каждый **push в `main`** автоматически публикует сайт — без GitHub Actions и без secrets.

### Первоначальная настройка (один раз)

1. Откройте [vercel.com/new](https://vercel.com/new)
2. **Import** репозитория `RuslanTsitser/tab_memory_extension`
3. Настройки проекта:
   - **Root Directory:** `.` (корень репозитория)
   - **Framework Preset:** Other
   - Build/install команды Vercel подхватит из `vercel.json` (`outputDirectory: website`)
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
