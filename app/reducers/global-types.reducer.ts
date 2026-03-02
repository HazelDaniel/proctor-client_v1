import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  supportedSQLTypes,
  tableColumnFields,
} from "~/data/table-form";
import { TableFormColumnSelectType, GlobalColumnTypeType } from "~/types";

interface GlobalTypeStateType {
  errorState: boolean;
  errorMessage?: string;
  builtinTypes: GlobalColumnTypeType[];
  typeMappings: Record<string, string[]>;
  defaults: TableFormColumnSelectType;
}

type ParsedResult = number[] | string[];

function parseCSV(input: string): ParsedResult {
  const items = input.split(",").map((item) => item.trim());

  if (items.length === 0) throw new Error("entries are empty");

  const numberPattern = /^-?\d+$/;
  const floatPattern = /^-?\d*\.\d+$/;
  const stringPattern = /^(['"])(.*?)\1$/;

  const firstItem = items[0];
  let expectedType: "number" | "float" | "string";

  if (numberPattern.test(firstItem)) {
    expectedType = "number";
  } else if (floatPattern.test(firstItem)) {
    expectedType = "float";
  } else if (stringPattern.test(firstItem)) {
    expectedType = "string";
  } else {
    throw new Error(`Invalid format for item: ${firstItem}`);
  }

  switch (expectedType) {
    case "float": {
      return items.map((item, index) => {
        if (!floatPattern.test(item) || Number.isNaN(+item)) {
          throw new Error(
            `Item at position ${index} is not a valid float: ${item}`
          );
        }
        return parseFloat(item);
      });
    }
    case "number": {
      return items.map((item, index) => {
        if (!numberPattern.test(item) || Number.isNaN(+item)) {
          throw new Error(
            `Item at position ${index} is not a valid integer: ${item}`
          );
        }
        return parseInt(item, 10);
      });
    }
    case "string": {
      return items.map((item, index) => {
        const match = item.match(stringPattern);
        if (!match) {
          throw new Error(
            `Item at position ${index} is not a valid quoted string: ${item}`
          );
        }
        return match[2];
      });
    }
  }
}

const initialGlobalTypeState: GlobalTypeStateType = {
  errorState: false,
  builtinTypes: supportedSQLTypes,
  typeMappings: {},
  defaults: tableColumnFields.default,
};

export const typesSlice = createSlice({
  name: "tables:types",
  initialState: initialGlobalTypeState,
  reducers: {
    addType: (
      state,
      action: PayloadAction<{ typeName: string; typeEntries: string }>
    ) => {
      let errorState = state.builtinTypes.includes(
        action.payload.typeName as any
      );
      if (errorState) {
        let errorMessage =
          "cannot create custom type, as it conflicts with a builtin type. choose another name and try again!";
        state.errorState = errorState;
        state.errorMessage = errorMessage;
        return;
      }

      errorState = !!state.typeMappings[action.payload.typeName];
      if (errorState) {
        let errorMessage = "a custom type with this name already exists!";
        state.errorState = errorState;
        state.errorMessage = errorMessage;
        return;
      }

      let resTypeEntries;
      try {
        resTypeEntries = parseCSV(action.payload.typeEntries);
      } catch (err) {
        errorState = true;
        let errorMessage =
          (err as Error).message ||
          "couldn't parse input entries for enum type!";
        state.errorState = errorState;
        state.errorMessage = errorMessage;
        return;
      }

      let resEntries = [
        ...Array.from(new Set<string | number>(resTypeEntries)),
      ];

      state.typeMappings[action.payload.typeName] = (
        resEntries as ParsedResult
      ).map((entry) => `${entry}`);

      state.defaults.entries = [...state.defaults.entries, ...resEntries];
    },
    clearError: (state) => {
      if (!state.errorState && !state.errorMessage) return;
      state.errorState = false;
      state.errorMessage = "";
    },
    setTypeMappings: (
      state,
      action: PayloadAction<Record<string, string[]>>
    ) => {
      state.typeMappings = action.payload;
    },
    resetTypeMappings: (state) => {
      state.typeMappings = {};
    },
  },
});

export const { addType, clearError, setTypeMappings, resetTypeMappings } = typesSlice.actions;
const globalTypesReducer = typesSlice.reducer;

export default globalTypesReducer;
