import {
  clearAll,
  deleteTab,
  formatBytes,
  getAllTabs,
  getScreenshotUrl,
  getStorageStats,
} from "../lib/db";
import type { SavedTab, SortDirection, SortField } from "../lib/types";

const statCountEl = document.getElementById("stat-count") as HTMLSpanElement;
const statSizeEl = document.getElementById("stat-size") as HTMLSpanElement;
const listEl = document.getElementById("list") as HTMLDivElement;
const emptyEl = document.getElementById("empty") as HTMLDivElement;
const sortEl = document.getElementById("sort") as HTMLSelectElement;
const btnClear = document.getElementById("btn-clear") as HTMLButtonElement;
const snackbarEl = document.getElementById("snackbar") as HTMLDivElement;

const objectUrls = new Set<string>();
let snackbarTimer: ReturnType<typeof setTimeout> | undefined;

function t(key: string): string {
  return chrome.i18n.getMessage(key) || key;
}

function applyI18n(): void {
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });
}

function showSnackbar(text: string, isError = false): void {
  snackbarEl.textContent = text;
  snackbarEl.className = "snackbar visible";
  if (isError) snackbarEl.classList.add("error");
  clearTimeout(snackbarTimer);
  snackbarTimer = setTimeout(() => {
    snackbarEl.classList.remove("visible");
  }, 3200);
}

function parseSort(value: string): { field: SortField; direction: SortDirection } {
  const [field, direction] = value.split("-") as [SortField, SortDirection];
  return { field, direction };
}

function formatDate(ts: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts));
}

function revokeObjectUrls(): void {
  for (const url of objectUrls) URL.revokeObjectURL(url);
  objectUrls.clear();
}

async function refreshStats(): Promise<void> {
  const stats = await getStorageStats();
  statCountEl.textContent = String(stats.count);
  statSizeEl.textContent = formatBytes(stats.bytesUsed);
  btnClear.disabled = stats.count === 0;
}

async function renderList(): Promise<void> {
  revokeObjectUrls();
  listEl.innerHTML = "";

  const { field, direction } = parseSort(sortEl.value);
  const tabs = await getAllTabs(field, direction);

  emptyEl.hidden = tabs.length > 0;
  listEl.hidden = tabs.length === 0;

  await refreshStats();

  for (const tab of tabs) {
    listEl.appendChild(await createCard(tab));
  }
}

async function createCard(tab: SavedTab): Promise<HTMLElement> {
  const card = document.createElement("article");
  card.className = "tab-card";
  card.setAttribute("role", "listitem");

  const previewBtn = document.createElement("button");
  previewBtn.type = "button";
  previewBtn.className = "tab-card__preview";
  previewBtn.setAttribute(
    "aria-label",
    `${t("openTab")}: ${tab.title}`,
  );

  const img = document.createElement("img");
  img.alt = "";
  const screenshotUrl = await getScreenshotUrl(tab.screenshotKey);
  if (screenshotUrl) {
    objectUrls.add(screenshotUrl);
    img.src = screenshotUrl;
  }
  previewBtn.appendChild(img);

  const openTab = (): void => {
    void chrome.tabs.create({ url: tab.url });
  };
  previewBtn.addEventListener("click", openTab);

  const body = document.createElement("div");
  body.className = "tab-card__body";

  const title = document.createElement("h2");
  title.className = "tab-card__title";
  title.textContent = tab.title;

  const urlRow = document.createElement("div");
  urlRow.className = "tab-card__url-row";

  const urlEl = document.createElement("span");
  urlEl.className = "tab-card__url";
  urlEl.textContent = tab.url;
  urlEl.title = tab.url;

  const btnCopy = document.createElement("button");
  btnCopy.type = "button";
  btnCopy.className = "icon-button icon-button--compact tab-card__copy";
  btnCopy.title = t("copyUrl");
  btnCopy.setAttribute("aria-label", t("copyUrl"));
  btnCopy.innerHTML =
    '<span class="material-symbols-outlined" aria-hidden="true">content_copy</span>';
  btnCopy.addEventListener("click", async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(tab.url);
      showSnackbar(t("urlCopied"));
    } catch {
      showSnackbar(t("errorCopyUrl"), true);
    }
  });

  urlRow.append(urlEl, btnCopy);

  const meta = document.createElement("p");
  meta.className = "tab-card__meta";
  meta.textContent = formatDate(tab.createdAt);

  const note = document.createElement("p");
  note.className = "tab-card__note";
  if (tab.note) {
    note.textContent = tab.note;
  } else {
    note.classList.add("tab-card__note--empty");
    note.textContent = t("noNote");
  }

  body.append(title, urlRow, meta, note);

  const footer = document.createElement("div");
  footer.className = "tab-card__footer";

  const btnOpen = document.createElement("button");
  btnOpen.type = "button";
  btnOpen.className = "icon-button";
  btnOpen.title = t("openTab");
  btnOpen.setAttribute("aria-label", t("openTab"));
  btnOpen.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">open_in_new</span>';
  btnOpen.addEventListener("click", openTab);

  const btnDelete = document.createElement("button");
  btnDelete.type = "button";
  btnDelete.className = "icon-button error";
  btnDelete.title = t("deleteTab");
  btnDelete.setAttribute("aria-label", t("deleteTab"));
  btnDelete.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">delete</span>';
  btnDelete.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (!confirm(t("confirmDelete"))) return;
    await deleteTab(tab.id);
    showSnackbar(t("deleted"));
    await renderList();
  });

  footer.append(btnOpen, btnDelete);
  card.append(previewBtn, body, footer);

  title.addEventListener("click", openTab);
  title.style.cursor = "pointer";

  return card;
}

sortEl.addEventListener("change", () => {
  void renderList();
});

btnClear.addEventListener("click", async () => {
  if (!confirm(t("confirmClear"))) return;
  await clearAll();
  showSnackbar(t("cleared"));
  await renderList();
});

applyI18n();
void renderList();
