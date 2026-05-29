export interface SavedTab {
  id: string;
  createdAt: number;
  note: string;
  url: string;
  title: string;
  screenshotKey: string;
}

export type SortField = "createdAt" | "title";
export type SortDirection = "asc" | "desc";

export interface StorageStats {
  count: number;
  bytesUsed: number;
}

export interface SaveTabPayload {
  note: string;
  tabId: number;
  windowId: number;
}

export type Message =
  | { type: "SAVE_AND_CLOSE"; payload: SaveTabPayload }
  | { type: "GET_STATS" }
  | { type: "OPEN_HISTORY" };

export type MessageResponse =
  | { ok: true; id?: string }
  | { ok: false; error: string }
  | StorageStats;
