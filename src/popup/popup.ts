import { openHomepage } from "../lib/constants";
import type { Message, MessageResponse } from "../lib/types";

const noteEl = document.getElementById("note") as HTMLTextAreaElement;
const btnSave = document.getElementById("btn-save") as HTMLButtonElement;
const btnHistory = document.getElementById("btn-history") as HTMLButtonElement;
const brandLinkEl = document.getElementById("brand-link") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLParagraphElement;
const tabPreviewEl = document.getElementById("tab-preview") as HTMLParagraphElement;
const popupEl = document.querySelector(".popup") as HTMLElement;

let activeTabId: number | undefined;
let activeWindowId: number | undefined;

function t(key: string): string {
  return chrome.i18n.getMessage(key) || key;
}

function applyI18n(): void {
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (key && "placeholder" in el) {
      (el as HTMLInputElement).placeholder = t(key);
    }
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach((el) => {
    const key = el.dataset.i18nTitle;
    if (!key) return;
    const label = t(key);
    el.title = label;
    if (el.hasAttribute("aria-label")) el.setAttribute("aria-label", label);
  });
}

function setStatus(text: string, type: "idle" | "error" | "success" = "idle"): void {
  statusEl.textContent = text;
  statusEl.className = "popup__status";
  if (type !== "idle") statusEl.classList.add(type);
}

async function init(): Promise<void> {
  applyI18n();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id != null && tab.windowId != null) {
    activeTabId = tab.id;
    activeWindowId = tab.windowId;
    if (tab.title) {
      tabPreviewEl.textContent = tab.title;
      tabPreviewEl.hidden = false;
    }
  } else {
    btnSave.disabled = true;
    setStatus(t("noActiveTab"), "error");
  }

  noteEl.focus();
}

btnSave.addEventListener("click", async () => {
  if (activeTabId == null || activeWindowId == null) return;

  popupEl.classList.add("popup--saving");
  btnSave.disabled = true;
  btnHistory.disabled = true;
  setStatus(t("saving"));

  const response = (await chrome.runtime.sendMessage({
    type: "SAVE_AND_CLOSE",
    payload: {
      note: noteEl.value,
      tabId: activeTabId,
      windowId: activeWindowId,
    },
  })) as MessageResponse;

  popupEl.classList.remove("popup--saving");

  if ("ok" in response && response.ok) {
    setStatus(t("saved"), "success");
    window.close();
    return;
  }

  btnSave.disabled = false;
  btnHistory.disabled = false;

  const errorKey =
    "error" in response && response.error === "CANNOT_CAPTURE_PAGE"
      ? "errorCannotCapture"
      : "errorSave";
  setStatus(t(errorKey), "error");
});

btnHistory.addEventListener("click", () => {
  void chrome.runtime.sendMessage({ type: "OPEN_HISTORY" } satisfies Message);
  window.close();
});

brandLinkEl.addEventListener("click", () => {
  openHomepage();
});

void init();
