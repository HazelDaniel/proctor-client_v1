import {
  internalIndexMarkers,
  reservedSQLKeywords,
  typeDefaultMappings,
} from "~/data/table-form";
import { v7 as UUIDv7 } from "uuid";
import { ConstraintAssertion as assertion } from "~/dao/constraint-assertion";
import {
  TableFormUpdatePayloadType,
  GlobalColumnIndexType,
  GlobalColumnTypeType,
  TableCreationFormStateType,
  NodeCompositeID,
} from "~/types";
import { getNodePropFromID } from "~/utils/node.utils";

export const tableFormActionTypes = {
  dropColumn: "DROP_COLUMN",
  addColumn: "ADD_COLUMN",
  addToComposite: "ADD_TO_COMPOSITE",
  removeFromComposite: "REMOVE_FROM_COMPOSITE",
  setName: "SET_NAME",
  setTableName: "SET_TABLE_NAME",
  setType: "SET_TYPE",
  setIndex: "SET_INDEX",
  toggleNullibility: "TOGGLE_NULLIBILITY",
  ToggleUniqueness: "TOGGLE_UNIQUENESS",
  setDefault: "SET_DEFAULT",
  clearError: "CLEAR_ERROR",
  setError: "SET_ERROR",
  validate: "VALIDATE",
};

export interface TableFormActionType<T> {
  type: keyof typeof tableFormActionTypes;
  payload: T;
}

export interface TableFormEmptyActionType
  extends TableFormActionType<undefined> {}

export interface TableFormToggleActionType
  extends TableFormActionType<{ columnID: string }> {}

export interface TableFormDeletionActionType
  extends TableFormActionType<{ columnID: string }> {}

export type TableFormUpdateActionType = TableFormActionType<
  Partial<
    TableFormUpdatePayloadType & { columnID?: string; errorMessage?: string }
  >
>;

export const initialTableCreationFormState: TableCreationFormStateType = {
  errorState: false,
  errorMessage: null,
  columns: {},
  typeMappings: {},
};

export const tableCreationFormReducer: (
  state: TableCreationFormStateType,
  action: TableFormUpdateActionType
) => TableCreationFormStateType = (
  state = initialTableCreationFormState,
  action
) => {
  let newState: TableCreationFormStateType;
  let { payload } = action;

  switch (action.type) {
    case "clearError": {
      if (state.errorMessage === "" && !state.errorState) return state;
      return { ...state, errorMessage: "", errorState: false };
    }
    case "addColumn": {
      const { tableID, columns, tableName } = state;
      let errorState = !!Object.values(state.columns).find((col) => {
        col.name === "";
      });
      if (errorState) {
        let errorMessage =
          "you cannot create new columns if existing column names are empty, name them and try again!";
        return { ...state, errorState, errorMessage };
      }
      let newKey = UUIDv7();
      newKey = `${tableID}:${newKey}`;

      newState = {
        tableID,
        errorState: false,
        typeMappings: state.typeMappings,
        columns: {
          ...columns,
          [newKey]: {
            index: "NONE",
            nullable: false,
            default: "NONE",
            name: "",
            unique: true,
            compositeOn: null,
          },
        },
        tableName,
      };

      return newState;
    }
    case "dropColumn": {
      const { columnID } = payload;
      if (!columnID) return state;

      if (!state.columns[columnID]) return state;
      newState = structuredClone(state);
      delete newState.columns[columnID];

      return newState;
    }
    case "addToComposite": {
      const { columnID, compositeOn } = payload;
      if (!columnID) return state;
      const index = state.columns[columnID]?.index;
      let errorState = !(
        index === "COMPOSITE_PRIMARY" || index === "COMPOSITE_FOREIGN"
      );
      if (errorState) {
        let errorMessage =
          "you cannot set composite columns for a non composite key!";
        return { ...state, errorState, errorMessage };
      }

      let resColumnID: string | null = null;
      for (const entry of Object.entries(state.columns)) {
        const [key, value] = entry;
        if (value.name === compositeOn) {
          resColumnID = `${key}:${compositeOn}`;
        }
      }
      if (!resColumnID) return state;

      let oldCompositeOn = state.columns[columnID]?.compositeOn || [];
      if (oldCompositeOn.includes(`${resColumnID}`)) return state;

      const newState = { ...state };
      let newCompositeOn = [...oldCompositeOn, `${resColumnID}`];
      newState.columns[columnID].compositeOn = newCompositeOn;

      return newState;
    }
    case "removeFromComposite": {
      const { columnID, compositeOn } = payload;
      if (!columnID) return state;
      const index = state.columns[columnID]?.index;
      let errorState = !(
        index === "COMPOSITE_PRIMARY" || index === "COMPOSITE_FOREIGN"
      );
      if (errorState) {
        let errorMessage =
          "you cannot set composite columns for a non composite key!";
        return { ...state, errorState, errorMessage };
      }

      let oldCompositeOn = state.columns[columnID]?.compositeOn || [];

      let resComposite: string | null = null;
      for (const entry of state.columns[columnID].compositeOn || []) {
        if (
          getNodePropFromID(entry as `${NodeCompositeID}:${string}`) ===
          compositeOn
        ) {
          resComposite = entry;
          break;
        }
      }
      if (!resComposite) return state;

      if (!oldCompositeOn.includes(`${resComposite}`)) {
        console.error(
          "doesn't not have composite ",
          oldCompositeOn,
          resComposite
        );
        return state;
      }

      const newState = { ...state };
      let newCompositeOn = oldCompositeOn.filter((el) => {
        return el !== `${resComposite}`;
      });

      newCompositeOn = newCompositeOn.length ? newCompositeOn : [];

      newState.columns[columnID].compositeOn = newCompositeOn;

      return newState;
    }
    case "setDefault": {
      const { columnID, default: colDefault } = payload;
      if (!columnID) return state;
      const resColumn = state.columns[columnID];
      if (!colDefault || !resColumn?.type) return state;
      const supportedDefaultSet = typeDefaultMappings[resColumn.type];

      let errorState = supportedDefaultSet
        ? !supportedDefaultSet.has(colDefault)
        : !state.typeMappings[resColumn?.type].includes(colDefault);

      if (errorState) {
        let errorMessage =
          "the set default value is not compatible with the column type";
        return { ...state, errorState, errorMessage };
      }

      newState = { ...state };
      newState.columns[columnID].default = colDefault;

      return newState;
    }
    case "setIndex": {
      const { columnID, index } = payload;
      const newState = { ...state };
      if (!columnID) return state;
      const resColumn = newState.columns[columnID];

      if (resColumn.index === index) return state;
      switch (index) {
        case "COMPOSITE_PRIMARY": {
          const errorState = Object.values(state.columns).some((col) => {
            return col.index === "COMPOSITE_PRIMARY" || col.index === "PRIMARY";
          });

          if (errorState) {
            let errorMessage =
              "this table already has a primary/composite primary key. remove the previous if you intend to use another key.";
            return { ...state, errorState, errorMessage };
          }

          const newState = { ...state };

          let tableKeys = Object.entries(newState.columns)
            .filter(([k, v]) => {
              return (
                v.index !== "COMPOSITE_FOREIGN" &&
                v.index !== "COMPOSITE_PRIMARY" &&
                k !== columnID
              );
            })
            .map(([key, col]) => {
              return `${key}:${col.name}`;
            }) as string[];

          tableKeys = tableKeys.length ? tableKeys : ["NONE"];

          const resColumn = {
            ...newState.columns[columnID],
            index: "COMPOSITE_PRIMARY" as const,
            name: internalIndexMarkers.COMPOSITE_PRIMARY,
            compositeOn: tableKeys,
          };

          newState.columns[columnID] = resColumn;

          return newState;
        }
        case "COMPOSITE_FOREIGN": {
          return state; // KEYS ARE ONLY ALLOWED TO START FROM FOREIGN ON CREATION so, DO NOTHING
        }
        case "FOREIGN": {
          resColumn.compositeOn = ["NONE"];
          resColumn.index = "FOREIGN";
          const { COMPOSITE_FOREIGN, COMPOSITE_PRIMARY } = internalIndexMarkers;
          resColumn.name =
            resColumn.name === COMPOSITE_FOREIGN ||
            resColumn.name === COMPOSITE_PRIMARY
              ? ""
              : resColumn.name;
          break;
        }
        case "NONE": {
          resColumn.compositeOn = ["NONE"];
          resColumn.index = "NONE";
          const { COMPOSITE_FOREIGN, COMPOSITE_PRIMARY } = internalIndexMarkers;
          resColumn.name =
            resColumn.name === COMPOSITE_FOREIGN ||
            resColumn.name === COMPOSITE_PRIMARY
              ? ""
              : resColumn.name;
          break;
        }
        case "PRIMARY": {
          const errorState = Object.values(state.columns).some((col) => {
            return col.index === "COMPOSITE_PRIMARY" || col.index === "PRIMARY";
          });

          if (errorState) {
            let errorMessage =
              "this table already has a primary/composite primary key. if you intend to use another key, you must remove the previous key";
            return { ...state, errorState, errorMessage };
          }

          resColumn.compositeOn = ["NONE"];
          resColumn.unique = true;
          resColumn.nullable = false;
          resColumn.index = "PRIMARY";
          const { COMPOSITE_FOREIGN, COMPOSITE_PRIMARY } = internalIndexMarkers;
          resColumn.name =
            resColumn.name === COMPOSITE_FOREIGN ||
            resColumn.name === COMPOSITE_PRIMARY
              ? ""
              : resColumn.name;
          break;
        }
        default: {
          break;
        }
      }

      newState.columns[columnID] = resColumn;

      return newState;
    }
    case "setName": {
      const { columnID, name } = payload;
      if (!columnID) {
        return state;
      }

      const resColumn = state.columns[columnID];
      if (!resColumn) return state;
      if (
        resColumn.index === "COMPOSITE_FOREIGN" ||
        resColumn.index === "COMPOSITE_PRIMARY"
      )
        return state; // you can't directly edit the name of a composite key
      if (resColumn.name === name) return state;

      const errorState = (name?.split(" ").length || 0) > 1;

      if (errorState) {
        let errorMessage = "column names are not allowed to have spaces!";
        return { ...state, errorState, errorMessage };
      }

      resColumn.name = name;

      const newState = { ...state };
      newState.columns[columnID] = resColumn;

      return newState;
    }
    case "setTableName": {
      const { name } = payload;
      if (name === state.tableName) return state;

      const errorState = (name?.split(" ").length || 0) > 1;

      if (errorState) {
        let errorMessage = "table name cannot contain spaces!";
        return { ...state, errorState, errorMessage };
      }

      const newState = { ...state };
      newState.tableName = name;

      return newState;
    }
    case "toggleNullibility": {
      const { columnID } = payload;
      if (!columnID) return state;
      const newState = { ...state };
      newState.columns[columnID].nullable =
        !newState.columns[columnID].nullable;

      return newState;
    }
    case "setType": {
      const { columnID, type: colType } = payload;
      if (!columnID) return state;

      const newState = { ...state };
      const resColumn = newState.columns[columnID];
      if (!colType) return state;
      if (resColumn.type === colType) return state;

      if (
        resColumn.index === "COMPOSITE_FOREIGN" ||
        resColumn.index === "COMPOSITE_PRIMARY"
      )
        return state; // you can't override the types of composite keys

      let supportedDefaultSet: string[];
      if (typeDefaultMappings[colType])
        supportedDefaultSet = Array.from(typeDefaultMappings[colType]);
      else {
        supportedDefaultSet = state.typeMappings[colType];
      }
      if (!supportedDefaultSet) return state; // workaround: the typeMappings is only updated from a parent state so, there's a possibility that it won't exist just yet
      const [preferedDefault] = supportedDefaultSet;

      newState.columns[columnID].default = preferedDefault;

      newState.columns[columnID].type = colType;

      return newState;
    }
    case "ToggleUniqueness": {
      const { columnID } = payload;
      if (!columnID) return state;

      const newState = { ...state };
      newState.columns[columnID].unique = !newState.columns[columnID].unique;

      return newState;
    }
    case "setError": {
      const { errorMessage } = payload;
      if (state.errorMessage && state.errorMessage === errorMessage)
        return state;
      return { ...state, errorMessage, errorState: true };
    }
    case "validate": {
      try {
        validateColumnName(state);
        validateColumnType(state);
        validatePrimaryKeyExists(state);
      } catch (err) {
        const errorMessage = (err as Error).message;
        return { ...state, errorState: true, errorMessage };
      }
      return state;
    }
    default:
      return state;
  }
};

// EXPLICIT STATE VALIDATORS
function validateColumnType(state: TableCreationFormStateType) {
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

function validatePrimaryKeyExists(state: TableCreationFormStateType) {
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

function validateColumnName(state: TableCreationFormStateType) {
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

export const __validate: () => TableFormUpdateActionType = () => {
  return {
    type: "validate",
    payload: {},
  };
};

export const __clearError: () => TableFormUpdateActionType = () => {
  return {
    type: "clearError",
    payload: {},
  };
};

export const __setError: (errorMessage: string) => TableFormUpdateActionType = (
  errorMessage
) => {
  return {
    type: "setError",
    payload: {
      errorMessage,
    },
  };
};

export const __addColumn: () => TableFormUpdateActionType = () => {
  return {
    type: "addColumn",
    payload: {},
  };
};

export const __dropColumn: (columnID: string) => TableFormUpdateActionType = (
  columnID
) => {
  return {
    type: "dropColumn",
    payload: { columnID },
  };
};

export const __addToComposite: (
  columnID: string,
  compositeOn: string
) => TableFormUpdateActionType = (columnID, compositeOn) => {
  return {
    type: "addToComposite",
    payload: { columnID, compositeOn },
  };
};

export const __removeFromComposite: (
  columnID: string,
  compositeOn: string
) => TableFormUpdateActionType = (columnID, compositeOn) => {
  return {
    type: "removeFromComposite",
    payload: { columnID, compositeOn },
  };
};

export const __setDefault: (
  columnID: string,
  colDefault: string
) => TableFormUpdateActionType = (columnID, colDefault) => {
  return {
    type: "setDefault",
    payload: { columnID, default: colDefault },
  };
};

export const __setIndex: (
  columnID: string,
  index: GlobalColumnIndexType
) => TableFormUpdateActionType = (columnID, index) => {
  return {
    type: "setIndex",
    payload: { columnID, index },
  };
};

export const __setName: (
  columnID: string,
  name: string
) => TableFormUpdateActionType = (columnID, name) => {
  return {
    type: "setName",
    payload: { columnID, name },
  };
};

export const __setTableName: (name: string) => TableFormUpdateActionType = (
  name
) => {
  return {
    type: "setTableName",
    payload: { name },
  };
};

export const __setType: (
  columnID: string,
  colType: GlobalColumnTypeType
) => TableFormUpdateActionType = (columnID, type) => {
  return {
    type: "setType",
    payload: { columnID, type },
  };
};

export const __toggleUniqueness: (
  columnID: string
) => TableFormUpdateActionType = (columnID) => {
  return {
    type: "ToggleUniqueness",
    payload: { columnID },
  };
};

export const __toggleNullibility: (
  columnID: string
) => TableFormUpdateActionType = (columnID) => {
  return {
    type: "toggleNullibility",
    payload: { columnID },
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
