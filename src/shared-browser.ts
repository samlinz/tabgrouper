import browser from "webextension-polyfill";
import { SortFunctions } from "./constants";

export type SortOptions = typeof SortFunctions;
export type SortFunctionsKeys = keyof typeof SortFunctions;

export const StorageKeys = {
  sortingFunction: "sortingFunction",
} as const;

export const getSortFunctionSettingsStorageKey = (fn: string) =>
  `_sortFunction_${fn}`;

export const getStoredSetting = async (key: string) => {
  const storageValues = await browser.storage.local.get(key);
  return storageValues[key] as any;
};

export const setStoredSetting = async (key: string, value: any) => {
  await browser.storage.local.set({ [key]: value });
};

export const logFullStorage = async () => {
  const storage = await browser.storage.local.get();
  console.debug(storage);
};

export const clearStorage = async () => {
  await browser.storage.local.clear();
  console.warn("Cleared extension storage");
};

export const getFullSortFunctionSettings = async (
  sortFunction: SortFunctionsKeys,
  sortFunctionOptions: SortOptions
) => {
  const storageKey = getSortFunctionSettingsStorageKey(sortFunction);
  const storedValue = (await getStoredSetting(storageKey)) || {};

  if (!sortFunctionOptions[sortFunction]) {
    throw Error(`Unknown sort function: ${sortFunction}`);
  }

  const defaultSettings = Object.entries(
    sortFunctionOptions[sortFunction].options
  )
    .map(([key, { default: defaultValue }]) => [key, defaultValue])
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  const fullSettings = { ...defaultSettings, ...storedValue };
  return fullSettings;
};
