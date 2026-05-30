export const HOMEPAGE_URL = "https://tab-memory.tsitser.com/";

export function openHomepage(): void {
  void chrome.tabs.create({ url: HOMEPAGE_URL });
}
