import {
  GlobalColumnIndexType,
  GlobalColumnTypeType,
  NodeCompositeID,
  TableCreationFormStateType,
} from "~/types";
import { ConstraintAssertion as assertion } from "~/dao/constraint-assertion";
import { internalIndexMarkers, reservedSQLKeywords } from "~/data/table-form";
import { getNodePropFromID } from "~/utils/node.utils";

// EXPLICIT STATE VALIDATORS
export function validateColumnType(state: TableCreationFormStateType) {
  const stateColumns = Array.from(Object.values(state.columns));

  const nonCompositeTypeValidator = (
    cols: TableCreationFormStateType["columns"][string][]
  ) => {
    return cols.every((el) =>
      el.index === "PRIMARY" || el.index === "NONE" || el.index === "FOREIGN"
        ? !!el.type
        : true
    );
  };

  assertion.construct(
    [() => nonCompositeTypeValidator(stateColumns)],
    "some non-composite columns do not have types provided"
  );
}

export function validatePrimaryKeyExists(state: TableCreationFormStateType) {
  const stateColumns = Array.from(Object.values(state.columns));

  const PKValidator = (
    cols: TableCreationFormStateType["columns"][string][]
  ) => {
    return cols.some(
      (el) => el.index === "PRIMARY" || el.index === "COMPOSITE_PRIMARY"
    );
  };

  assertion.construct(
    [() => PKValidator(stateColumns)],
    "this table doesn't have any primary key!"
  );
}

export function validateColumnName(state: TableCreationFormStateType) {
  const stateColumns = Array.from(Object.values(state.columns));

  const emptyValidator = (
    cols: TableCreationFormStateType["columns"][string][]
  ) => {
    return cols.every((el) => !!el.name);
  };

  const reservedValidator = (
    cols: TableCreationFormStateType["columns"][string][]
  ) => {
    return cols.every((el) => !reservedSQLKeywords.has(el.name as string));
  };

  const tableNameValidator = () => !!state.tableName;

  assertion.construct([tableNameValidator], "the table name cannot be empty");
  assertion.construct(
    [() => emptyValidator(stateColumns)],
    "some column names are empty"
  );
  assertion.construct(
    [() => reservedValidator(stateColumns)],
    "some column names are reserved keywords"
  );
}

// ACTION PRODUCERS

export const __validate = <S, T>() => {
  return {
    type: "validate" as S,
    payload: {} as T,
  };
};

export const __clearError = <S, T>() => {
  return {
    type: "clearError" as S,
    payload: {} as T,
  };
};

export const __setError = <S, T>(errorMessage: string) => {
  return {
    type: "setError" as S,
    payload: {
      errorMessage,
    } as T,
  };
};

export const __addColumn = <S, T>() => {
  return {
    type: "addColumn" as S,
    payload: {} as T,
  };
};

export const __dropColumn = <S, T>(columnID: string) => {
  return {
    type: "dropColumn" as S,
    payload: { columnID } as T,
  };
};

export const __addToComposite = <S, T>(
  columnID: string,
  compositeOn: string
) => {
  return {
    type: "addToComposite" as S,
    payload: { columnID, compositeOn } as T,
  };
};

export const __removeFromComposite = <S, T>(
  columnID: string,
  compositeOn: string
) => {
  return {
    type: "removeFromComposite" as S,
    payload: { columnID, compositeOn } as T,
  };
};

export const __setDefault = <S, T>(columnID: string, colDefault: string) => {
  return {
    type: "setDefault" as S,
    payload: { columnID, default: colDefault } as T,
  };
};

export const __setIndex = <S, T>(columnID: string, index: GlobalColumnIndexType) => {
  return {
    type: "setIndex" as S,
    payload: { columnID, index } as T,
  };
};

export const __setName = <S, T>(columnID: string, name: string) => {
  return {
    type: "setName" as S,
    payload: { columnID, name } as T,
  };
};

export const __setTableName = <S, T>(name: string) => {
  return {
    type: "setTableName" as S,
    payload: { name } as T,
  };
};

export const __setType = <S, T>(columnID: string, type: GlobalColumnTypeType) => {
  return {
    type: "setType" as S,
    payload: { columnID, type } as T,
  };
};

export const __toggleUniqueness = <S, T>(columnID: string) => {
  return {
    type: "ToggleUniqueness" as S,
    payload: { columnID } as T,
  };
};

export const __toggleNullibility = <S, T>(columnID: string) => {
  return {
    type: "toggleNullibility" as S,
    payload: { columnID } as T,
  };
};

// SELECTORS
export const selectCompositeColumns: (
  state: TableCreationFormStateType,
  id: string
) => string[] = (state, id) => {
  const resColumn = state.columns[id];
  if (!resColumn) return ["NONE"];

  let tableKeys = Object.entries(state.columns)
    .filter(([k, v]) => {
      return (
        v.index !== "COMPOSITE_FOREIGN" &&
        v.index !== "COMPOSITE_PRIMARY" &&
        !!v.name &&
        v.name !== internalIndexMarkers.COMPOSITE_FOREIGN &&
        v.name !== internalIndexMarkers.COMPOSITE_PRIMARY &&
        v.name !== resColumn.name
      );
    })
    .map(([key, col]) => {
      return getNodePropFromID(
        `${key}:${col.name}` as `${NodeCompositeID}:${string}`
      );
    }) as string[];

  return tableKeys || ["NONE"];
};

export const selectNullibility: (
  state: TableCreationFormStateType,
  id: string
) => boolean = (state, id) => {
  const resColumn = state.columns[id];

  return resColumn?.nullable || false;
};

export const selectUniqueness: (
  state: TableCreationFormStateType,
  id: string
) => boolean = (state, id) => {
  const resColumn = state.columns[id];

  return resColumn?.unique || false;
};

export const selectIndex: (
  state: TableCreationFormStateType,
  id: string
) => GlobalColumnIndexType = (state, id) => {
  const resColumn = state.columns[id];

  return resColumn?.index || "NONE";
};

export const selectType: (
  state: TableCreationFormStateType,
  id: string
) => GlobalColumnTypeType = (state, id) => {
  const resColumn = state.columns[id];

  return resColumn.type as GlobalColumnTypeType;
};

export const selectDefault: (
  state: TableCreationFormStateType,
  id: string
) => string = (state, id) => {
  const resColumn = state.columns[id];

  return resColumn.default as string;
};
