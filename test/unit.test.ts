import { describe, expect, test } from "@jest/globals";
import { SortFunctions } from "../src/constants";
import { Tab } from "../src/shared";

const tabs: Tab[] = [
  { id: 1, index: 0, url: new URL("http://example1.com") },
  { id: 2, index: 1, url: new URL("https://example2.com") },
  { id: 3, index: 2, url: new URL("http://example3.com") },
  { id: 4, index: 3, url: new URL("https://example4.com") },
  { id: 5, index: 3, url: new URL("https://example5.com") },
  { id: 6, index: 3, url: new URL("https://youtube.com") },
];

describe("sort functions", () => {
  test("naive sort function", () => {
    const factory = SortFunctions.sortTabs1;
    const fn = factory({ ascending: "ASC" });
    const result = [...tabs].sort(fn);
    expect(result).toEqual(tabs);
  });

  test("naive sort function reversed", () => {
    const factory = SortFunctions.sortTabs1;
    const fn = factory({ ascending: "DESC" });
    const result = [...tabs].sort(fn);
    expect(result).toEqual([...tabs].reverse());
  });
});
