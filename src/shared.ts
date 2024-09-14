import { Tabs } from "webextension-polyfill";

export type BrowserTab = Tabs.Tab;

export type Tab = {
  id: number | undefined;
  index: number;
  url: URL | null;
};

type TabSortingFunctionOptions = Record<
  string,
  {
    description: string;
    default: string;
    values?: string[];
    type: "string" | "number" | "boolean";
  }
>;

export type TabSortingFunctionMeta = {
  title: string;
  description: string;
  options: TabSortingFunctionOptions;
};

type OptionsInstance<TOptions extends TabSortingFunctionOptions> = Record<
  keyof TOptions,
  string
>;

export type TabSortingFunction = (a: Tab, b: Tab) => number;

export type TabSortingFunctionFactory<
  TOptionsMeta extends TabSortingFunctionOptions
> = TabSortingFunctionMeta &
  ((options: OptionsInstance<TOptionsMeta>) => TabSortingFunction);

type SortTabs1Options = {
  ascending: string;
};

const sortTabs1 = (options: SortTabs1Options) =>
  ((a, b) => {
    const order = options.ascending === "ASC" ? 1 : -1;
    if (!a.url) return -1;
    if (!b.url) return 1;
    return a.url.hostname.localeCompare(b.url.hostname) * order;
  }) as TabSortingFunction;

export const sortTabs1Factory = ((opts: SortTabs1Options) => {
  return sortTabs1(opts);
}) as TabSortingFunctionFactory<{
  ascending: {
    type: "string";
    description: string;
    default: string;
    values: ["ASC", "DESC"];
  };
}>;

sortTabs1Factory.title = "sortTabs1";
sortTabs1Factory.description = "Naive sort by hostname";
sortTabs1Factory.options = {
  ascending: {
    type: "string",
    description: "Ascending or descending",
    default: "ASC",
    values: ["ASC", "DESC"],
  },
};
