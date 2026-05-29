import { getStorageStats } from "../lib/db";
import { captureAndSaveTab } from "../lib/save-tab";
import type { Message, MessageResponse } from "../lib/types";

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse: (response: MessageResponse) => void) => {
    void handleMessage(message).then(sendResponse);
    return true;
  },
);

async function handleMessage(message: Message): Promise<MessageResponse> {
  switch (message.type) {
    case "SAVE_AND_CLOSE": {
      try {
        const id = await captureAndSaveTab(
          message.payload.tabId,
          message.payload.windowId,
          message.payload.note,
        );
        return { ok: true, id };
      } catch (err) {
        const code = err instanceof Error ? err.message : "UNKNOWN";
        return { ok: false, error: code };
      }
    }
    case "GET_STATS":
      return getStorageStats();
    case "OPEN_HISTORY": {
      await chrome.tabs.create({
        url: chrome.runtime.getURL("src/history/history.html"),
      });
      return { ok: true };
    }
    default:
      return { ok: false, error: "UNKNOWN_MESSAGE" };
  }
}
