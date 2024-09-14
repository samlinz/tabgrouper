import { DefaultSortFunction, SortFunctions } from "../src/constants";
import {
  SortFunctionsKeys,
  SortOptions,
  StorageKeys,
  clearStorage,
  getFullSortFunctionSettings,
  getSortFunctionSettingsStorageKey,
  getStoredSetting,
  logFullStorage,
  setStoredSetting,
} from "./shared-browser";

const buildSortFunctionOptionsDom = (
  options: SortOptions,
  currentSettings: any,
  onChange: (key: string, value: unknown) => void
) => {
  const buildDomForFn = (
    key: string,
    { description, name, options }: (typeof SortFunctions)[SortFunctionsKeys]
  ) => {
    const elements: HTMLElement[] = [];

    for (const [optionName, { description, values, type }] of Object.entries(
      options
    )) {
      const label = document.createElement("label");
      label.classList.add("options-group");

      const optionDescription = document.createElement("p");
      optionDescription.classList.add("options-description");
      optionDescription.textContent = description;
      label.appendChild(optionDescription);

      const isSelect = !!values;
      const isNumber = type === "number";
      const isBoolean = type === "boolean";
      const isText = type === "string";

      if (!isSelect && !isNumber && !isBoolean && !isText) {
        throw new Error(`Unknown option type: ${type}`);
      }

      const currentValue =
        currentSettings[optionName] ?? options[optionName].default;

      const getInput = () => {
        const input = document.createElement("input");
        input.type = "text";
        input.name = optionName;
        input.value = currentValue;
        return input;
      };

      if (isSelect) {
        const select = document.createElement("select");
        select.name = optionName;

        for (const value of values) {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        }

        select.value = currentValue;
        select.addEventListener("change", (event) =>
          onChange(optionName, (event.target as HTMLSelectElement).value)
        );
        label.appendChild(select);
      } else if (isText) {
        const input = getInput();
        input.type = "text";
        input.addEventListener("change", (event) =>
          onChange(optionName, (event.target as HTMLInputElement).value)
        );
        label.appendChild(input);
      } else if (isNumber) {
        const input = getInput();
        input.type = "number";
        input.addEventListener("change", (event) => {
          onChange(
            optionName,
            (event.target as HTMLInputElement).valueAsNumber
          );
        });
        label.appendChild(input);
      } else if (isBoolean) {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = optionName;
        input.checked = currentValue === true;
        input.addEventListener("change", (event) => {
          onChange(optionName, (event.target as HTMLInputElement).checked);
        });
        label.appendChild(input);
      } else {
        throw new Error(`Unknown option type: ${type}`);
      }

      elements.push(label);
    }

    return elements;
  };

  return Object.entries(options)
    .map(([key, value]) => [key, buildDomForFn(key, value)] as const)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}) as Record<
    string,
    HTMLElement[]
  >;
};

const buildSortFunctionSelector = (
  options: SortOptions,
  currentValue: SortFunctionsKeys,
  onChange: (value: string) => void
) => {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  label.classList.add("options-group");
  label.textContent = "Sort function";

  const select = document.createElement("select");
  select.name = "sortFunction";

  select.addEventListener("change", (event) => {
    const value = (event.target as HTMLSelectElement).value;
    onChange(value);
  });

  for (const [key, { title }] of Object.entries(options)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = title;
    select.appendChild(option);
  }

  select.value = currentValue;

  label.appendChild(select);

  const currentDescription = document.createElement("p");
  currentDescription.classList.add("options-description");
  currentDescription.textContent = options[currentValue]?.description;

  wrapper.appendChild(label);
  wrapper.appendChild(currentDescription);

  return wrapper;
};

const buildSortFunctionOptions =
  (
    options: SortOptions,
    currentSettings: object,
    onOptionsChanged: (key: string, value: unknown) => void
  ) =>
  (currentSortFunction: string, currentSortFunctionName: string) => {
    const elements = buildSortFunctionOptionsDom(
      options,
      currentSettings,
      onOptionsChanged
    );
    const currentSortFunctionOptions = elements[currentSortFunction];

    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = `Options for '${currentSortFunctionName}'`;

    if (currentSortFunctionOptions) {
      fieldset.append(...currentSortFunctionOptions);
    }

    fieldset.appendChild(legend);

    return fieldset;
  };

const updateSortFunctionSetting = async (
  sortFunction: string,
  key: string,
  value: any,
  previousSettings: object
) => {
  const storageKey = getSortFunctionSettingsStorageKey(sortFunction);
  const fullSettings = { ...previousSettings, [key]: value };

  console.log(
    {
      fullSettings,
      sortFunction,
      key,
      value,
    },
    "Updated settings"
  );

  await setStoredSetting(storageKey, fullSettings);
};

const buildFullForm = async () => {
  const form = document.getElementById("options");
  if (!form) {
    throw new Error("Form not found");
  }

  while (form.firstChild) {
    form.removeChild(form.firstChild);
  }

  const _currentSortFunction = await getStoredSetting(
    StorageKeys.sortingFunction
  );
  const currentSortFunction = (_currentSortFunction ??
    DefaultSortFunction) as keyof typeof SortFunctions;

  const options = SortFunctions;
  const currentSortFunctionName = options[currentSortFunction]?.title;

  const sortFunctionSelector = buildSortFunctionSelector(
    options,
    currentSortFunction,
    async (value) => {
      await setStoredSetting(StorageKeys.sortingFunction, value);
      refreshForm();
    }
  );

  const currentSortFunctionSettings = await getFullSortFunctionSettings(
    currentSortFunction,
    options
  );

  console.log({
    currentSortFunction,
    currentSortFunctionSettings,
  });

  const sortFunctionOptions = buildSortFunctionOptions(
    options,
    currentSortFunctionSettings,
    (key, value) => {
      updateSortFunctionSetting(
        currentSortFunction,
        key,
        value,
        currentSortFunctionSettings
      );
    }
  )(currentSortFunction, currentSortFunctionName);

  form.appendChild(sortFunctionSelector);
  form.appendChild(sortFunctionOptions);
};

const init = async () => {
  await logFullStorage();
  await buildFullForm();
};

const refreshForm = () => {
  buildFullForm().catch(onError);
};

const onError = (error: Error) => {
  console.error(error);
  window.alert(
    "An error occurred. Please check the console for more information."
  );
  clearStorage();
};

document.addEventListener("DOMContentLoaded", () => init().catch(onError));
