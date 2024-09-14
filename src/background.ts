import browser from "webextension-polyfill";
import { DefaultSortFunction, SortFunctions } from "./constants";
import { BrowserTab, Tab, TabSortingFunction } from "./shared";
import {
  getFullSortFunctionSettings,
  getStoredSetting,
  SortFunctionsKeys,
  StorageKeys,
} from "./shared-browser";

const buildSortFunction = async (): Promise<TabSortingFunction> => {
  const storedSortFunctionKey = await getStoredSetting(
    StorageKeys.sortingFunction
  );
  const sortFunctionKey =
    (storedSortFunctionKey as SortFunctionsKeys) ?? DefaultSortFunction;
  const sortFunction = SortFunctions[sortFunctionKey];
  const storedSettings = await getFullSortFunctionSettings(
    sortFunctionKey,
    SortFunctions
  );
  return sortFunction(storedSettings);
};

browser.action.onClicked.addListener(() => {
  reorderTabs();
});

const buildTabs = (tab: BrowserTab): Tab => {
  return {
    id: tab.id,
    index: tab.index,
    url: tab.url ? new URL(tab.url) : null,
  };
};

const reorderTabs = () => {
  browser.tabs
    .query({ currentWindow: true })
    .then(async (tabs) => {
      const originalTabs = tabs.map(buildTabs);

      console.log({ originalTabs }, "Original tabs");

      const sortFn: TabSortingFunction = await buildSortFunction();
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
    })
    .catch((error) => {
      console.error(error);
      window.alert("Error sorting tabs; see console");
    });
};
