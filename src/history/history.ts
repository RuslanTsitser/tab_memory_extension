import {
  clearAll,
  deleteTab,
  formatBytes,
  getAllTabs,
  getScreenshotUrl,
  getStorageStats,
} from "../lib/db";
import { openHomepage } from "../lib/constants";
import type { SavedTab, SortDirection, SortField } from "../lib/types";

const VIEW_STORAGE_KEY = "historyViewMode";

type ViewMode = "grid" | "compact";

const statCountEl = document.getElementById("stat-count") as HTMLSpanElement;
const statSizeEl = document.getElementById("stat-size") as HTMLSpanElement;
const listEl = document.getElementById("list") as HTMLDivElement;
const emptyEl = document.getElementById("empty") as HTMLDivElement;
const sortEl = document.getElementById("sort") as HTMLSelectElement;
const btnClear = document.getElementById("btn-clear") as HTMLButtonElement;
const btnViewGrid = document.getElementById("view-grid") as HTMLButtonElement;
const btnViewCompact = document.getElementById("view-compact") as HTMLButtonElement;
const snackbarEl = document.getElementById("snackbar") as HTMLDivElement;
const previewDialog = document.getElementById("preview-dialog") as HTMLDialogElement;
const previewTitleEl = document.getElementById("preview-title") as HTMLHeadingElement;
const previewImageEl = document.getElementById("preview-image") as HTMLImageElement;
const previewOpenEl = document.getElementById("preview-open") as HTMLButtonElement;
const previewCloseEl = document.getElementById("preview-close") as HTMLButtonElement;
const brandLinkEl = document.getElementById("brand-link") as HTMLButtonElement;

const objectUrls = new Set<string>();
let snackbarTimer: ReturnType<typeof setTimeout> | undefined;
let viewMode: ViewMode = "grid";
let previewTab: SavedTab | null = null;

function t(key: string): string {
  return chrome.i18n.getMessage(key) || key;
}

function applyI18n(): void {
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach((el) => {
    const key = el.dataset.i18nTitle;
    if (!key) return;
    const label = t(key);
    el.title = label;
    if (el.hasAttribute("aria-label")) el.setAttribute("aria-label", label);
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

function applyViewMode(): void {
  listEl.classList.toggle("tab-list--compact", viewMode === "compact");
  for (const card of listEl.querySelectorAll(".tab-card")) {
    card.classList.toggle("tab-card--compact", viewMode === "compact");
  }
  btnViewGrid.classList.toggle("is-active", viewMode === "grid");
  btnViewCompact.classList.toggle("is-active", viewMode === "compact");
  btnViewGrid.setAttribute("aria-pressed", String(viewMode === "grid"));
  btnViewCompact.setAttribute("aria-pressed", String(viewMode === "compact"));
}

async function loadViewMode(): Promise<void> {
  const stored = (await chrome.storage.local.get(VIEW_STORAGE_KEY))[VIEW_STORAGE_KEY];
  if (stored === "grid" || stored === "compact") viewMode = stored;
  applyViewMode();
}

async function setViewMode(mode: ViewMode): Promise<void> {
  if (mode === viewMode) return;
  viewMode = mode;
  await chrome.storage.local.set({ [VIEW_STORAGE_KEY]: mode });
  applyViewMode();
}

function openPreviewDialog(tab: SavedTab, imageUrl: string | undefined): void {
  previewTab = tab;
  previewTitleEl.textContent = tab.title;
  if (imageUrl) {
    previewImageEl.src = imageUrl;
  } else {
    previewImageEl.removeAttribute("src");
  }
  previewImageEl.alt = tab.title;
  previewDialog.showModal();
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

  applyViewMode();
}

async function createCard(tab: SavedTab): Promise<HTMLElement> {
  const card = document.createElement("article");
  card.className = "tab-card";
  if (viewMode === "compact") card.classList.add("tab-card--compact");
  card.setAttribute("role", "listitem");

  const screenshotUrl = await getScreenshotUrl(tab.screenshotKey);
  if (screenshotUrl) objectUrls.add(screenshotUrl);

  const openTab = (): void => {
    void chrome.tabs.create({ url: tab.url });
  };

  const previewBtn = document.createElement("button");
  previewBtn.type = "button";
  previewBtn.className = "tab-card__preview";
  previewBtn.setAttribute("aria-label", `${t("viewPreview")}: ${tab.title}`);

  const img = document.createElement("img");
  img.alt = "";
  if (screenshotUrl) img.src = screenshotUrl;
  previewBtn.appendChild(img);

  const previewBadge = document.createElement("span");
  previewBadge.className = "tab-card__preview-badge";
  previewBadge.innerHTML =
    '<span class="material-symbols-outlined" aria-hidden="true">zoom_in</span>';
  previewBtn.appendChild(previewBadge);

  previewBtn.addEventListener("click", () => {
    openPreviewDialog(tab, screenshotUrl ?? undefined);
  });

  const main = document.createElement("div");
  main.className = "tab-card__main";

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
  main.append(body, footer);
  card.append(previewBtn, main);

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

btnViewGrid.addEventListener("click", () => {
  void setViewMode("grid");
});

btnViewCompact.addEventListener("click", () => {
  void setViewMode("compact");
});

previewCloseEl.addEventListener("click", () => {
  previewDialog.close();
});

previewOpenEl.addEventListener("click", () => {
  if (previewTab) void chrome.tabs.create({ url: previewTab.url });
  previewDialog.close();
});

previewDialog.addEventListener("close", () => {
  previewTab = null;
  previewImageEl.removeAttribute("src");
});

brandLinkEl.addEventListener("click", () => {
  openHomepage();
});

applyI18n();
void loadViewMode().then(() => renderList());
