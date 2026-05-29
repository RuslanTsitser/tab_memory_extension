import { saveTab } from "./db";
import type { SavedTab } from "./types";

export async function captureAndSaveTab(
  tabId: number,
  windowId: number,
  note: string,
): Promise<string> {
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
    throw new Error("CANNOT_CAPTURE_PAGE");
  }

  await chrome.tabs.update(tabId, { active: true });
  await chrome.windows.update(windowId, { focused: true });

  const dataUrl = await chrome.tabs.captureVisibleTab(windowId, {
    format: "jpeg",
    quality: 85,
  });

  const id = crypto.randomUUID();
  const screenshotKey = `screenshot-${id}`;

  const record: SavedTab = {
    id,
    createdAt: Date.now(),
    note: note.trim(),
    url: tab.url,
    title: tab.title || tab.url,
    screenshotKey,
  };

  await saveTab(record, dataUrl);
  await chrome.tabs.remove(tabId);

  return id;
}
