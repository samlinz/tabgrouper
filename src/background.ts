import browser, { Tabs } from "webextension-polyfill";

browser.action.onClicked.addListener(() => {
  reorderTabs();
});

type BrowserTab = Tabs.Tab;

type Tab = {
  id: number | undefined;
  index: number;
  url: URL | null;
};

type SortTabs = (a: Tab, b: Tab) => number;

const buildTabs = (tab: BrowserTab): Tab => {
  return {
    id: tab.id,
    index: tab.index,
    url: tab.url ? new URL(tab.url) : null,
  };
};

const sortTabs1: SortTabs = (a, b) => {
  if (!a.url) return -1;
  if (!b.url) return 1;
  return a.url.hostname.localeCompare(b.url.hostname);
};

const reorderTabs = () => {
  browser.tabs.query({ currentWindow: true }).then((tabs) => {
    const originalTabs = tabs.map(buildTabs);

    const sortFn: SortTabs = sortTabs1;
    const sortedTabs = [...originalTabs].sort(sortFn);

    const unsortedTabIds = originalTabs.map((tab) => tab.id) as number[];
    const sortedTabIds = sortedTabs.map((tab) => tab.id) as number[];

    console.debug(
      {
        unsortedTabIds,
        sortedTabIds,
      },
      "Sorting tabs"
    );

    browser.tabs.move(sortedTabIds, { index: -1 });
  });
};
