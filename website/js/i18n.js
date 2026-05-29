export const LOCALES = [
  { code: "en", label: "English", htmlLang: "en" },
  { code: "ru", label: "Русский", htmlLang: "ru" },
  { code: "de", label: "Deutsch", htmlLang: "de" },
  { code: "es", label: "Español", htmlLang: "es" },
  { code: "fr", label: "Français", htmlLang: "fr" },
  { code: "pt", label: "Português", htmlLang: "pt" },
  { code: "ja", label: "日本語", htmlLang: "ja" },
  { code: "zh", label: "中文", htmlLang: "zh-CN" },
];

export const LOCALE_CODES = LOCALES.map((l) => l.code);

export function detectLocale() {
  const seg = window.location.pathname.split("/").filter(Boolean)[0];
  return LOCALE_CODES.includes(seg) && seg !== "en" ? seg : "en";
}

export function localePath(locale, page) {
  const prefix = locale === "en" ? "" : `/${locale}`;
  if (page === "home") return prefix ? `${prefix}/` : "/";
  return `${prefix}/${page}/`.replace("//", "/");
}

export async function loadLocale(code) {
  const res = await fetch(`/locales/${code}.json`);
  if (!res.ok) throw new Error(`Locale ${code} not found`);
  return res.json();
}

export function applyI18n(dict, page) {
  const strings = { ...dict.common, ...dict[page] };
  const localeMeta = LOCALES.find((l) => l.code === dict.code);
  document.documentElement.lang = localeMeta?.htmlLang ?? dict.code;

  if (strings.metaTitle) document.title = strings.metaTitle;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && strings.metaDescription) metaDesc.content = strings.metaDescription;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    const value = strings[key];
    if (value != null) el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.dataset.i18nHtml;
    if (!key) return;
    const value = strings[key];
    if (value != null) el.innerHTML = value;
  });
}

export function renderLangSwitcher(current, page, containerId = "lang-switcher") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  const select = document.createElement("select");
  select.className = "lang-select";
  select.setAttribute("aria-label", "Language");

  for (const loc of LOCALES) {
    const option = document.createElement("option");
    option.value = localePath(loc.code, page);
    option.textContent = loc.label;
    option.selected = loc.code === current;
    select.appendChild(option);
  }

  select.addEventListener("change", () => {
    window.location.href = select.value;
  });

  container.appendChild(select);
}

export async function initSiteI18n(page) {
  const locale = detectLocale();
  const dict = await loadLocale(locale);
  applyI18n(dict, page);
  fixLocalizedLinks(locale);
  renderLangSwitcher(locale, page);
}

export function fixLocalizedLinks(locale) {
  const root = locale === "en" ? "" : `/${locale}`;
  const home = root ? `${root}/` : "/";

  const map = {
    home,
    privacy: `${root}/privacy/`.replace("//", "/"),
    support: `${root}/support/`.replace("//", "/"),
    features: `${home}#features`,
    how: `${home}#how-it-works`,
  };

  for (const [key, href] of Object.entries(map)) {
    document.querySelectorAll(`[data-lhref="${key}"]`).forEach((el) => {
      el.setAttribute("href", href);
    });
  }
}
