const activeFilters = {};

const HeaderKeys = {
  ATTRIBUTES: 1,
  RESISTANCE: 2,
  IMBUEMENTS: 3,
  CLASS: 4,
  LEVEL: 5,
  VOCATION: 6,
  ARMOR: 7,
  WEIGHT: 8,
};

const FindHeaderIndexFns = {
  [HeaderKeys.ATTRIBUTES]: (headerItems) => {
    return 4;
  },
  [HeaderKeys.RESISTANCE]: (headerItems) => {
    return 5;
  },
  [HeaderKeys.IMBUEMENTS]: (headerItems) => {
    return 6;
  },
  [HeaderKeys.LEVEL]: (headerItems) => {
    return 8;
  },
  [HeaderKeys.VOCATION]: (headerItems) => {
    return 9;
  },
};

function FindHeaderIndex(key, headerItems) {
  return FindHeaderIndexFns[key](headerItems);
}

const ElementFactory = {
  Checkbox: ({ name, className, id, checked = False }) => {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "cb_" + name;
    input.value = name;
    input.checked = checked;

    input.id = id;
    input.classList.add(className);

    return input;
  },
  CheckboxWithLabel: ({ name, className, id, checked = False }) => {
    const checkbox = ElementFactory.Checkbox({ name, className, id, checked });
    var label = document.createElement("label");
    label.htmlFor = id;
    label.appendChild(document.createTextNode(name));

    return { label, checkbox };
  },
  RadioButton: ({ name, className, id, checked = false }) => {
    const input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.value = id;
    input.checked = checked;
    input.id = id;
    input.classList.add(className);

    return input;
  },
  RadioButtonWithLabel: ({ name, className, id, checked = false }) => {
    const radio = ElementFactory.RadioButton({ name, className, id, checked });
    var label = document.createElement("label");
    label.htmlFor = id;
    label.appendChild(document.createTextNode(id));

    return { label, radio };
  },
  Number: ({
    name,
    className,
    value = 0,
    id,
    min = 0,
    max = Infinity,
    placeholder,
  }) => {
    const input = document.createElement("input");
    input.type = "number";
    input.name = "i_" + name;
    input.value = value;
    input.id = id;
    input.placeholder = placeholder;
    input.min = min;
    input.max = max;
    input.classList.add(className);

    return input;
  },
};

const FiltersFactory = {
  SimpleCheckbox: (headerItem, className, filters = [], allChecked = false) => {
    const checkboxes = [];

    filters.forEach((x) => {
      const container = document.createElement("div");
      const { label, checkbox } = ElementFactory.CheckboxWithLabel({
        name: x,
        className,
        value: null,
        id: x,
        checked: allChecked,
      });
      container.appendChild(checkbox);
      container.appendChild(label);

      checkboxes.push(checkbox);

      headerItem.appendChild(container);
    });

    return { checkboxes };
  },
  SimpleRadio: (
    headerItem,
    className,
    name,
    options = [],
    checkedIndex = 0
  ) => {
    const radios = [];

    options.forEach((x, index) => {
      const container = document.createElement("div");
      const { label, radio } = ElementFactory.RadioButtonWithLabel({
        name,
        className,
        id: x,
        checked: index == checkedIndex,
      });
      container.appendChild(radio);
      container.appendChild(label);
      radios.push(radio);

      headerItem.appendChild(container);
    });

    return { radios };
  },
  SimpleNumeric: (
    headerItem,
    className,
    options = { name, min, max, placeholder }
  ) => {
    const input = ElementFactory.Number({ className, ...options });
    headerItem.appendChild(input);

    return { input };
  },
};

function OnChange(tableBody) {
  for (const tr of tableBody.getElementsByTagName("tr")) {
    const tds = tr.getElementsByTagName("td");
    let shouldHide = false;
    for (let i = 0; i < tds.length; i++) {
      if (!activeFilters[i]) {
        continue;
      }

      if (!activeFilters[i](tds[i].innerHTML)) {
        shouldHide = true;
        break;
      }
    }

    if (shouldHide) {
      tr.style.display = "none";
    } else {
      tr.style.display = "";
    }
  }
}

function ApplyOnChange(elements = [], handler) {
  for (const element of elements) {
    element.addEventListener("change", handler);
  }
}

/*
 * @Param filters <Input[type=checkbox]>[]
 * @Param tableBody <Table><body>
 */
function CreateByContentChangeHandler(options, tableBody, columnIndex) {
  return (event) => {
    const filters = [];
    for (const option of options) {
      if (option.checked) {
        filters.push(option.value);
      }
    }

    if (filters.length == 0) {
      activeFilters[columnIndex] = (data) => true;
    } else {
      activeFilters[columnIndex] = (data) => {
        for (const filter of filters) {
          if (!data.includes(filter)) {
            return false;
          }
        }

        return true;
      };
    }

    OnChange(tableBody);
  };
}

function CreateNumberIsChangeHandler(
  numberInput,
  filterTypeInputs,
  tableBody,
  columnIndex
) {
  return (event) => {
    let filterType;
    for (const x of filterTypeInputs) {
      if (x.checked) {
        filterType = x.value;
        break;
      }
    }
    const number = +numberInput.value;

    activeFilters[columnIndex] = (data) => {
      data = +data;

      if (filterType == "gt") {
        return data > number;
      }

      if (filterType == "get") {
        return data >= number;
      }

      if (filterType == "lt") {
        return data < number;
      }

      if (filterType == "let") {
        return data <= number;
      }
    };

    OnChange(tableBody);
  };
}

/* Append filters */
function AppendAttributesFilters(headerItem, tableBody, columnIndex) {
  const kClassGroup = "attributes_filter";
  const attributes = [
    "distance",
    "magic",
    "axe",
    "sword",
    "club",
    "fist",
    "speed",
    "shielding",
  ];

  const { checkboxes } = FiltersFactory.SimpleCheckbox(
    headerItem,
    kClassGroup,
    attributes
  );

  ApplyOnChange(
    checkboxes,
    CreateByContentChangeHandler(checkboxes, tableBody, columnIndex)
  );
}

function AppendResistanceFilters(headerItem, tableBody, columnIndex) {
  const kClassGroup = "resistance_filter";
  const options = ["physical", "fire", "earth", "ice", "energy", "holy"];

  const { checkboxes } = FiltersFactory.SimpleCheckbox(
    headerItem,
    kClassGroup,
    options
  );

  ApplyOnChange(
    checkboxes,
    CreateByContentChangeHandler(checkboxes, tableBody, columnIndex)
  );
}

function AppendImbuementsFilters(headerItem, tableBody, columnIndex) {
  const kClassGroup = "imbuements_filter";
  const { radios } = FiltersFactory.SimpleRadio(
    headerItem,
    kClassGroup,
    "rbgroup_imbuements",
    ["gt", "lt", "get", "let"],
    0
  );
  const { input } = FiltersFactory.SimpleNumeric(headerItem, kClassGroup, {
    max: 4,
  });

  const changeHandler = CreateNumberIsChangeHandler(
    input,
    radios,
    tableBody,
    columnIndex
  );
  ApplyOnChange(radios, changeHandler);
  ApplyOnChange([input], changeHandler);
}

function AppendLevelFilters(headerItem, tableBody, columnIndex) {
  const kClassGroup = "level_filter";

  const { radios } = FiltersFactory.SimpleRadio(
    headerItem,
    kClassGroup,
    "rbgroup_level",
    ["gt", "lt", "get", "let"],
    0
  );
  const { input } = FiltersFactory.SimpleNumeric(headerItem, kClassGroup, {});

  const changeHandler = CreateNumberIsChangeHandler(
    input,
    radios,
    tableBody,
    columnIndex
  );
  ApplyOnChange(radios, changeHandler);
  ApplyOnChange([input], changeHandler);
}

function AppendVocationFilters(headerItem, tableBody, columnIndex) {
  const kClassGroup = "vocation_filter";
  const options = ["knight", "paladin", "sorcerer", "druid"];

  const { checkboxes } = FiltersFactory.SimpleCheckbox(
    headerItem,
    kClassGroup,
    options
  );

  ApplyOnChange(
    checkboxes,
    CreateByContentChangeHandler(checkboxes, tableBody, columnIndex)
  );
}
/* End of Append filters */

/*
  @param headerItems used to calculate size and find header indexes
*/
function BuildFiltersHeader(headerItems, tableBody) {
  const tr = document.createElement("tr");
  const ths = [];

  for (let i = 0; i < headerItems.length; i++) {
    const th = document.createElement("th");
    ths.push(th);
    tr.appendChild(th);
  }

  const attributesIndex = FindHeaderIndex(HeaderKeys.ATTRIBUTES, headerItems);
  AppendAttributesFilters(ths[attributesIndex], tableBody, attributesIndex);

  const resistanceIndex = FindHeaderIndex(HeaderKeys.RESISTANCE, headerItems);
  AppendResistanceFilters(ths[resistanceIndex], tableBody, resistanceIndex);

  const imbuementsIndex = FindHeaderIndex(HeaderKeys.IMBUEMENTS, headerItems);
  AppendImbuementsFilters(ths[imbuementsIndex], tableBody, imbuementsIndex);

  const levelIndex = FindHeaderIndex(HeaderKeys.LEVEL, headerItems);
  AppendLevelFilters(ths[levelIndex], tableBody, levelIndex);

  const vocationIndex = FindHeaderIndex(HeaderKeys.VOCATION, headerItems);
  AppendVocationFilters(ths[vocationIndex], tableBody, vocationIndex);

  return tr;
}

function AddFilters() {
  let table = document.getElementsByClassName("wikitable sortable")[0];

  let header = table.getElementsByTagName("thead")[0];

  let headerItems = header
    .getElementsByTagName("tr")[0]
    .getElementsByTagName("th");

  let tableBody = table.getElementsByTagName("tbody")[0];

  header.appendChild(BuildFiltersHeader(headerItems, tableBody));
}

AddFilters();
