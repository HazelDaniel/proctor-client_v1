import {
  internalIndexMarkers,
  ondeleteOptions,
  typeDefaultMappings,
} from "~/data/table-form";
import { v7 as UUIDv7 } from "uuid";
import {
  TableFormUpdatePayloadType,
  TableCreationFormStateType,
  NodeCompositeID,
  OndeleteOptionType,
} from "~/types";
import { getNodePropFromID } from "~/utils/node.utils";
import {
  validateColumnName,
  validateColumnType,
  validatePrimaryKeyExists,
  ValidatorConfigType,
} from "./utils/shared-functions";

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
  setOndelete: "SET_ONDELETE",
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
  extends TableFormActionType<{
    columnID: string;
    config?: ValidatorConfigType;
  }> {}

export type TableFormUpdateActionType = TableFormActionType<
  Partial<
    TableFormUpdatePayloadType & {
      columnID?: string;
      errorMessage?: string;
      config?: ValidatorConfigType;
      mappings?: Record<string, string[]>;
    }
  >
>;

export const initialTableCreationFormState: TableCreationFormStateType = {
  errorState: false,
  errorMessage: null,
  columns: {},
  typeMappings: {},
  referenceColumns: {},
};

export const tableCreationFormReducer: (
  state: TableCreationFormStateType,
  action: TableFormUpdateActionType
) => TableCreationFormStateType = (
  state = initialTableCreationFormState,
  action
) => {
  let newState: TableCreationFormStateType;
  const { payload } = action;

  switch (action.type) {
    case "clearError": {
      if (state.errorMessage === "" && !state.errorState) return state;
      return { ...state, errorMessage: "", errorState: false };
    }
    case "addColumn": {
      const { tableID, columns, tableName, referenceColumns } = state;
      const errorState = !!Object.values(state.columns).find((col) => {
        col.name === "";
      });
      if (errorState) {
        const errorMessage =
          "you cannot create new columns if existing column names are empty, name them and try again!";
        return { ...state, errorState, errorMessage };
      }
      let newKey = UUIDv7();
      newKey = `${tableID}:${newKey}`;

      newState = {
        tableID,
        errorState: false,
        typeMappings: state.typeMappings,
        createdAt: state.createdAt,
        columns: {
          ...columns,
          [newKey]: {
            index: "NONE",
            nullable: false,
            default: "NONE",
            name: "",
            unique: false,
            compositeOn: null,
            ondelete: "NONE",
            createdAt: new Date().getTime(),
          },
        },
        tableName,
        referenceColumns,
      };

      return newState;
    }
    case "dropColumn": {
      const { columnID, config } = payload;
      if (!columnID) return state;
      if (!state.columns[columnID]) return state;

      let errorState = config?.isReferenced;
      if (errorState) {
        const errorMessage =
          "you cannot delete a column that's referenced by other tables. drop references first";
        return { ...state, errorState, errorMessage };
      }

      errorState = config?.isCompositeMember;
      if (errorState) {
        const errorMessage =
          "you cannot delete a column that is part of a composite, update the composition first.";
        return { ...state, errorState, errorMessage };
      }

      newState = structuredClone(state);
      delete newState.columns[columnID];
      delete newState.referenceColumns[columnID];

      return newState;
    }
    case "addToComposite": {
      const { columnID, compositeOn } = payload;
      if (!columnID) return state;
      const index = state.columns[columnID]?.index;
      const errorState = !(
        index === "COMPOSITE_PRIMARY" || index === "COMPOSITE_FOREIGN"
      );
      if (errorState) {
        const errorMessage =
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

      const oldCompositeOn = state.columns[columnID]?.compositeOn || [];
      if (oldCompositeOn.includes(`${resColumnID}`)) return state;

      const newState = { ...state };
      const newCompositeOn = [...oldCompositeOn, `${resColumnID}`];
      newState.columns[columnID].compositeOn = newCompositeOn;

      return newState;
    }
    case "removeFromComposite": {
      const { columnID, compositeOn } = payload;
      if (!columnID) return state;
      const index = state.columns[columnID]?.index;
      const errorState = !(
        index === "COMPOSITE_PRIMARY" || index === "COMPOSITE_FOREIGN"
      );
      if (errorState) {
        const errorMessage =
          "you cannot set composite columns for a non composite key!";
        return { ...state, errorState, errorMessage };
      }

      const oldCompositeOn = state.columns[columnID]?.compositeOn || [];

      if (oldCompositeOn.length === 1) {
        const errorMessage =
          "you must have at least one composite column in a composite";
        return { ...state, errorState: true, errorMessage };
      }

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
        console.error("doesn't have composite ", oldCompositeOn, resComposite);
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

      const errorState = supportedDefaultSet
        ? !supportedDefaultSet.has(colDefault)
        : !state.typeMappings[resColumn?.type].includes(colDefault);

      if (errorState) {
        const errorMessage =
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
            const errorMessage =
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

          const newColumn = {
            ...newState.columns[columnID],
            index: "COMPOSITE_PRIMARY" as const,
            name: internalIndexMarkers.COMPOSITE_PRIMARY,
            compositeOn: tableKeys,
            oldName: resColumn.name,
            ondelete: "NONE" as OndeleteOptionType,
          };

          newState.referenceColumns = {
            ...newState.referenceColumns,
            [columnID]: true,
          };
          newState.columns[columnID] = newColumn;

          return newState;
        }
        case "COMPOSITE_FOREIGN": {
          return state; // KEYS ARE ONLY ALLOWED TO START FROM FOREIGN ON CREATION so, DO NOTHING
        }
        case "FOREIGN": {
          resColumn.compositeOn = ["NONE"];
          if (resColumn.index === "COMPOSITE_FOREIGN")
            resColumn.name = resColumn.oldName;
          resColumn.index = "FOREIGN";
          const { COMPOSITE_FOREIGN, COMPOSITE_PRIMARY } = internalIndexMarkers;
          resColumn.name =
            resColumn.name === COMPOSITE_FOREIGN ||
            resColumn.name === COMPOSITE_PRIMARY
              ? ""
              : resColumn.name;
          resColumn.ondelete = "CASCADE";
          newState.referenceColumns = {
            ...newState.referenceColumns,
            [columnID]: true,
          };
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
          resColumn.ondelete = "NONE";
          delete newState.referenceColumns[columnID];
          break;
        }
        case "PRIMARY": {
          const errorState = Object.values(state.columns).some((col) => {
            return col.index === "COMPOSITE_PRIMARY" || col.index === "PRIMARY";
          });

          if (errorState) {
            const errorMessage =
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
          resColumn.ondelete = "NONE";
          newState.referenceColumns = {
            ...newState.referenceColumns,
            [columnID]: true,
          };
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

      let errorState = (name?.split(" ").length || 0) > 1;

      if (errorState) {
        const errorMessage = "column names are not allowed to have spaces!";
        return { ...state, errorState, errorMessage };
      }

      errorState = !!Object.values(state.columns).find(
        (el) => el.name === name
      );

      if (errorState) {
        const errorMessage = "columns cannot have duplicate names!";
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
        const errorMessage = "table name cannot contain spaces!";
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
      const { columnID, type: colType, mappings } = payload;
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

      if (!mappings) {
        console.warn("global mappings not provided!");
        return state;
      }
      let supportedDefaultSet: string[] | undefined;
      if (typeDefaultMappings[colType])
        supportedDefaultSet = Array.from(typeDefaultMappings[colType]);
      else {
        supportedDefaultSet = mappings[colType];
      }
      if (!supportedDefaultSet) return state; // workaround: the typeMappings is only updated from a parent state so, there's a possibility that it won't exist just yet
      const [preferedDefault] = supportedDefaultSet;

      newState.columns[columnID].default = preferedDefault;

      newState.columns[columnID].type = colType;

      return newState;
    }
    case "setOndelete": {
      const { ondelete, columnID } = payload;
      if (!columnID || !ondelete) return state;

      const newState = { ...state };
      const resColumn = newState.columns[columnID];
      if (resColumn.ondelete === ondelete) return state;
      if (!ondeleteOptions.includes(ondelete)) return state;

      if (
        resColumn.index !== "COMPOSITE_FOREIGN" &&
        resColumn.index !== "FOREIGN"
      ) {
        return state;
      }

      newState.columns[columnID].ondelete = ondelete;
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
