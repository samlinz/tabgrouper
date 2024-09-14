import { sortTabs1Factory } from "./shared";

export const SortFunctions = {
  sortTabs1: sortTabs1Factory,
};

export const DefaultSortFunction: keyof typeof SortFunctions = "sortTabs1";
