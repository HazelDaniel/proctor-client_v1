import {
  GlobalColumnIndexType,
  GlobalColumnTypeType,
  internalIndexMarkers,
  typeDefaultMappings,
} from "~/data/table-form";
import { v4 as UUIDv4 } from "uuid";

export const tableFormActionTypes = {
  dropColumn: "DROP_COLUMN",
  addColumn: "ADD_COLUMN",
  setName: "SET_NAME",
  setTableName: "SET_TABLE_NAME",
  setType: "SET_TYPE",
  setIndex: "SET_INDEX",
  toggleNullibility: "TOGGLE_NULLIBILITY",
  ToggleUniqueness: "TOGGLE_UNIQUENESS",
  setDefault: "SET_DEFAULT",
  setCompositeOn: "SET_COMPOSITE_ON",
  clearError: "CLEAR_ERROR",
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

export interface TableFormUpdatePayloadType {
  type: GlobalColumnTypeType;
  index: GlobalColumnIndexType;
  default: string;
  nullable: boolean;
  unique: boolean;
  name: string;
  compositeOn: "NONE" | string;
}

export type TableFormUpdateActionType = TableFormActionType<
  Partial<TableFormUpdatePayloadType & { columnID?: string }>
>;

export interface TableCreationFormStateType {
  tableID?: string;
  tableName?: string;
  errorState: boolean;
  errorMessage?: string | null;
  columns: Record<
    string,
    Partial<
      Omit<TableFormUpdatePayloadType, "compositeOn"> & {
        compositeOn: ("NONE" | string)[] | null;
      }
    >
  >;
}

export const initialTableCreationFormState: TableCreationFormStateType = {
  errorState: false,
  errorMessage: null,
  columns: {},
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
      return {...state, errorMessage: "", errorState: false};
    }
    case "addColumn": {
      const { tableID, columns, tableName } = state;
      const newKey = UUIDv4();
      let errorState = !!Object.values(state.columns).find((col) => {
        col.name === "";
      });
      if (errorState) return { ...state, errorState };

      newState = {
        tableID,
        errorState: false,
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
      newState = { ...state };
      delete newState.columns[columnID];

      return newState;
    }
    case "setCompositeOn": {
      const { columnID, compositeOn } = payload;
      // TODO: for all the rest of the switch arms, separate the input validation assertions from that of the logical assertions - might be moved else where later
      if (!columnID) return state;
      const index = state.columns[columnID]?.index;

      let errorState = !(
        index === "COMPOSITE_PRIMARY" || index === "COMPOSITE_FOREIGN"
      );
      if (errorState) return { ...state, errorState };

      if (index !== "COMPOSITE_PRIMARY" && index !== "COMPOSITE_FOREIGN")
        return state;
      if (!compositeOn) return state;

      const resColumn = state.columns[columnID];
      if (!resColumn) return state;
      const compositeArrays = compositeOn.split(", ");
      newState = { ...state };
      newState.columns[columnID].compositeOn = compositeArrays;

      return newState;
    }
    case "setDefault": {
      const { columnID, default: colDefault } = payload;
      if (!columnID) return state;
      const resColumn = state.columns[columnID];
      if (!colDefault || !resColumn?.type) return state;
      const supportedDefaultSet = typeDefaultMappings[resColumn?.type];

      const errorState = !supportedDefaultSet.has(colDefault);
      if (errorState) return { ...state, errorState };

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
          const errorState = !!Object.values(state.columns).find((col) => {
            col.index === "COMPOSITE_PRIMARY" || col.index === "PRIMARY";
          });

          if (errorState) {
            let errorMessage =
              "this table already has a primary/composite primary key. if you intend to use another key, you must remove the previous key";
            return { ...state, errorState, errorMessage };
          }

          const newState = { ...state };

          const tableKeys = Object.values(newState.columns)
            .filter((v) => {
              return (
                v.index !== "COMPOSITE_FOREIGN" &&
                v.index !== "COMPOSITE_PRIMARY" &&
                !!v.name
              );
            })
            .map((col) => col.name) as string[];

          const resColumn = newState.columns[columnID];
          resColumn.index = "COMPOSITE_PRIMARY";
          resColumn.name = internalIndexMarkers.COMPOSITE_PRIMARY;
          resColumn.compositeOn = tableKeys;

          return newState;
        }
        case "COMPOSITE_FOREIGN": {
          return state; // KEYS ARE ONLY ALLOWED TO START FROM FOREIGN ON CREATION so, DO NOTHING
        }
        case "FOREIGN": {
          resColumn.compositeOn = null;
          break;
        }
        case "NONE": {
          resColumn.compositeOn = null;
          break;
        }
        case "PRIMARY": {
          resColumn.unique = true;
          resColumn.nullable = false;
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
      if (!columnID) return state;

      const newState = { ...state };
      const resColumn = newState.columns[columnID];
      if (resColumn.name === name) return state;

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

      const supportedDefaultSet = typeDefaultMappings[colType];
      const [preferedDefault] = [...supportedDefaultSet];

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
    default:
      return state;
  }
};

// ACTION PRODUCERS

export const __clearError: () => TableFormUpdateActionType = () => {
  return {
    type: "clearError",
    payload: {},
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

export const __setCompositeOn: (
  columnID: string,
  compositeOn: string
) => TableFormUpdateActionType = (columnID, compositeOn) => {
  return {
    type: "setCompositeOn",
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
// export const selectTableForms: (
//   state: TableFormStateType
// ) => (StatefulTableFormType & { id: string })[] = (state) => {
//   return Object.entries(state.bubbles).reduce(
//     (acc: (StatefulTableFormType & { id: string })[], curr) => {
//       const res = { id: curr[0], ...curr[1] };
//       acc.push(res);
//       return acc;
//     },
//     []
//   );
// };
