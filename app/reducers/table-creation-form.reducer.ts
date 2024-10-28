import {
  GlobalColumnIndexType,
  GlobalColumnTypeType,
  typeDefaultMappings,
} from "~/data/table-form";
import { v4 as UUIDv4 } from "uuid";

export const tableFormActionTypes = {
  dropColumn: "DROP_COLUMN",
  addColumn: "ADD_COLUMN",
  setName: "SET_NAME",
  setType: "SET_TYPE",
  setIndex: "SET_INDEX",
  setNullibility: "SET_NULLIBILITY",
  setUniqueNess: "SET_UNIQUENESS",
  setDefault: "SET_DEFAULT",
  setCompositeOn: "SET_COMPOSITE_ON",
};

export interface TableFormActionType<T> {
  type: keyof typeof tableFormActionTypes;
  payload: T;
}

export interface TableFormAdditionActionType
  extends TableFormActionType<{ columnID: string }> {}

export interface TableFormDeletionActionType
  extends TableFormActionType<{ columnID: string }> {}

interface TableFormUpdatePayloadType {
  type: GlobalColumnTypeType;
  index: GlobalColumnIndexType;
  default: string;
  nullable: boolean;
  unique: boolean;
  name: string;
  compositeOn: "NONE" | string;
}

export interface TableFormUpdateActionType
  extends TableFormActionType<Partial<TableFormUpdatePayloadType>> {}

export interface TableFormStateType {
  tableID?: string;
  tableName?: string;
  columns: Record<
    string,
    Partial<
      Omit<TableFormUpdatePayloadType, "compositeOn"> & {
        compositeOn: ("NONE" | string)[] | null;
      }
    >
  >;
}

export const initialTableFormState: TableFormStateType = {
  columns: {},
};

export const tableFormReducer: (
  state: TableFormStateType,
  action: TableFormActionType<
    Partial<TableFormUpdatePayloadType> & { columnID: string }
  >
) => TableFormStateType = (state = initialTableFormState, action) => {
  let newState: TableFormStateType;
  let { payload } = action;

  switch (action.type) {
    case "addColumn": {
      const { tableID, columns, tableName } = state;
      const newKey = UUIDv4();
      newState = { tableID, columns: { ...columns, [newKey]: {} }, tableName };

      return newState;
    }
    case "dropColumn": {
      const { columnID } = payload;
      if (!state.columns[columnID]) return state;
      newState = { ...state };
      delete newState.columns[columnID];

      return newState;
    }
    case "setCompositeOn": {
      const { columnID, compositeOn } = payload;
      // TODO: for all the rest of the switch arms, separate the input validation assertions from that of the logical assertions - might be moved else where later
      const index = state.columns[columnID]?.index;
      if (index !== "COMPOSITE_PRIMARY" && index !== "COMPOSITE_FOREIGN") return state; //TODO: SHOULD ASSERT THAT INDEX IS ALWAYS COMPOSITE
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
      const resColumn = state.columns[columnID];
      if (!colDefault || !resColumn?.type) return state;
      const supportedDefaultSet = typeDefaultMappings[resColumn?.type];
      if (!supportedDefaultSet.has(colDefault)) return state; // TODO: ALSO ASSERTIONS
      newState = { ...state };
      newState.columns[columnID].default = colDefault;

      return newState;
    }
    case "setIndex": {
      // NOTE: if you are changing the index to another index type, you should make sure you adjust other fields as needed
      const { columnID, index } = payload;
      const newState = {...state};
      const resColumn = newState.columns[columnID];

      if (resColumn.index === index) return state;
      switch (index) {
        case "COMPOSITE_PRIMARY": {
          // TODO: ASSERT THAT THERE'S NO OTHER PRIMARY/PRIMARY_COMPOSITE INDEX ON THIS TABLE

          // TODO: WHEN LISTING THE CANDIDATE KEYS FOR THE COMPOSITE, ASSERT THAT THESE KEY TYPES WON'T SHOW UP:
          // 1. PRIMARY COMPOSITE
          // 2. SECONDARY COMPOSITE

        }
        case "COMPOSITE_FOREIGN": {
          return state; // KEYS ARE ONLY ALLOWED TO START FROM FOREIGN ON CREATION so, DO NOTHING
        }
        case "FOREIGN": {
          resColumn.compositeOn = null;
          break;
        }
        case "NONE": {
          // TODO: (ON EDIT) ASSERT THAT IF THIS WAS A COMPOSITE FOREIGN KEY, IT'S COMPOSITE COLUMNS ARE REMOVED FROM THIS TABLE
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
      const { columnID, name, index } = payload;
      const newState = {...state};
      const resColumn = newState.columns[columnID];

      if (resColumn.name === name) return state;

      return newState;
    }
    case "setNullibility": {
    }
    case "setType": {
    }
    case "setUniqueNess": {
    }
    default:
      return state;
  }
};

// // ACTION PRODUCERS
// export const __addBubble: (pos: XYPosition) => TableFormAdditionActionType = (
//   pos
// ) => {
//   return {
//     type: "add",
//     payload: { pos },
//   };
// };

// export const __setActiveBubble: (id: string) => TableFormActionType<string> = (
//   id
// ) => {
//   return {
//     type: "setActive",
//     payload: id,
//   };
// };

// export const __showAll: () => TableFormActionType<undefined> = () => {
//   return {
//     type: "showAll",
//     payload: undefined,
//   };
// };

// export const __hideAll: () => TableFormActionType<undefined> = () => {
//   return {
//     type: "hideAll",
//     payload: undefined,
//   };
// };

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
