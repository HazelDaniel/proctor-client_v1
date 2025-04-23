import { internalIndexMarkers, typeDefaultMappings } from "~/data/table-form";
import { v7 as UUIDv7 } from "uuid";
import {
  TableFormUpdatePayloadType,
  NodeCompositeID,
  TableUpdateFormStateType,
  TableCRUDColumnType,
  StatefulGroupNodeType,
} from "~/types";
import { getNodePropFromID, parseNodeID } from "~/utils/node.utils";
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
  replaceTable: "REPLACE_TABLE",
  addTableNode: "ADD_TABLE_NODE",
  passComposites: "PASS_COMPOSITES",
  retractComposites: "RETRACT_COMPOSITES",
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
      compositeOn: string[];
    }
  > & {
    tableID: string;
    tableBody?: TableUpdateFormStateType[string];
    nodeBody?: StatefulGroupNodeType[string];
    mappings?: Record<string, string[]>;
    sourceCompositeID?: NodeCompositeID;
    targetSecondaryID?: string;
    config?: ValidatorConfigType;
  }
>;

export type TableFormBatchUpdateActionType = TableFormActionType<
  (TableFormUpdatePayloadType & {
    columnID?: string;
    errorMessage?: string;
    compositeOn: string[];
    config?: ValidatorConfigType;
  })[]
>;

// TODO: THERE ARE BREAKING UPDATES HERE, PLEASE CHECK THOROUGHLY FOR BUGS
export interface TableFormBatchColumnActionType
  extends TableFormActionType<string[]> {}

export const initialTableUpdateFormState: TableUpdateFormStateType = {};

export const tableUpdateFormReducer: (
  state: TableUpdateFormStateType,
  action: TableFormUpdateActionType
) => TableUpdateFormStateType = (
  state = initialTableUpdateFormState,
  action
) => {
  let newState: TableUpdateFormStateType;
  const { payload } = action;

  const { tableID } = payload;

  switch (action.type) {
    case "clearError": {
      if (state[tableID].errorMessage === "" && !state[tableID].errorState)
        return state;
      return {
        ...state,
        [tableID]: { ...state[tableID], errorMessage: "", errorState: false },
      };
    }
    case "addColumn": {
      const { columns, tableName } = state[tableID];
      const errorState = !!Object.values(state[tableID].columns).find((col) => {
        col.name === "";
      });
      if (errorState) {
        const errorMessage =
          "you cannot create new columns if existing column names are empty, name them and try again!";
        return {
          ...state,
          [tableID]: { ...state[tableID], errorState, errorMessage },
        };
      }
      let newKey = UUIDv7();
      newKey = `${tableID}:${newKey}`;

      newState = {
        ...state,
        [tableID]: {
          ...state[tableID],
          errorState: false,
          typeMappings: state[tableID].typeMappings,
          columns: {
            ...columns,
            [newKey]: {
              index: "NONE",
              nullable: false,
              default: "NONE",
              name: "",
              unique: true,
              compositeOn: null,
              isSurrogate: false,
            },
          },
          tableName,
          tableID,
        },
      };

      return newState;
    }
    case "dropColumn": {
      const { columnID, config } = payload;
      if (!columnID) return state;

      if (
        !state[tableID].columns[columnID] ||
        state[tableID].columns[columnID].readonly
      )
        return state;

      let errorState = config?.isReferencing;
      if (errorState) {
        const errorMessage =
          "you cannot delete a column that is referencing other tables. remove references first";
        return {
          ...state,
          [tableID]: {
            ...state[tableID],
            errorState: true,
            errorMessage,
          },
        };
      }

      errorState = config?.isCompositeMember;
      if (errorState) {
        const errorMessage =
          "you cannot delete a column that is part of a composite, update the composition first.";

        return {
          ...state,
          [tableID]: {
            ...state[tableID],
            errorState: true,
            errorMessage,
          },
        };
      }

      errorState = config?.isReferenced;
      if (errorState) {
        const errorMessage =
          "you cannot delete a column that is referenced by other tables. remove references first";
        return {
          ...state,
          [tableID]: {
            ...state[tableID],
            errorState: true,
            errorMessage,
          },
        };
      }

      const resColumn = state[tableID].columns[columnID];
      if (resColumn.index === "COMPOSITE_FOREIGN") {
        for (const entry of resColumn.compositeOn || []) {
          // const [parentID, nodeID, nodeName] =
          //   entry as `${string}:${NodeCompositeID}`;
          console.warn("TODO: remove entry: ", entry);
        }
      }

      newState = structuredClone(state);
      delete newState[tableID]?.columns[columnID];

      return newState;
    }
    case "passComposites": {
      const { sourceCompositeID, targetSecondaryID } = action.payload;
      if (!sourceCompositeID || !targetSecondaryID) return state;
      const [sourceTableID] = parseNodeID(sourceCompositeID);
      const [targetTableID] = parseNodeID(targetSecondaryID as NodeCompositeID);

      if (!state[sourceTableID]?.columns[sourceCompositeID]) {
        return {
          ...state,
          [targetTableID]: {
            ...state[targetTableID],
            errorState: true,
            errorMessage: "Source composite primary key not found",
          },
        };
      }

      const sourceNode = state[sourceTableID].columns[sourceCompositeID];
      const compositeEntries = sourceNode.compositeOn || [];

      const newColumns = compositeEntries.reduce((acc, entry) => {
        const [parentId, colId, _3] = entry.split(":");
        const sourceColumn = state[parentId].columns[`${parentId}:${colId}`];

        acc[`${parentId}:${colId}`] = {
          ...sourceColumn,
          isSurrogate: true,
          surrogationTimestamp: new Date().toISOString(),
        };

        return acc;
      }, {} as Record<string, TableCRUDColumnType>);

      return {
        ...state,
        [targetTableID]: {
          ...state[targetTableID],
          columns: {
            ...state[targetTableID].columns,
            ...newColumns,
            [targetSecondaryID]: {
              ...state[targetTableID].columns[targetSecondaryID],
              index: "COMPOSITE_FOREIGN",
              compositeOn: compositeEntries,
              oldName: state[targetTableID].columns[targetSecondaryID]?.name,
            },
          },
        },
      };
    }
    case "retractComposites": {
      const { columnID } = action.payload;
      if (!columnID) return state;
      const [tableID] = parseNodeID(columnID as NodeCompositeID);

      const targetNode = state[tableID]?.columns[columnID];
      if (!targetNode || targetNode.index !== "COMPOSITE_FOREIGN") {
        return {
          ...state,
          [tableID]: {
            ...state[tableID],
            errorState: true,
            errorMessage: "Invalid composite foreign key",
          },
        };
      }

      const compositeEntries = targetNode.compositeOn || [];
      const newColumns = { ...state[tableID].columns };

      compositeEntries.forEach((entry) => {
        const [parentId, colId] = entry.split(":");
        for (const key of Object.keys(newColumns)) {
          if (key.startsWith(`${parentId}:${colId}`)) {
            delete newColumns[key];
          }
        }
      });

      newColumns[columnID] = {
        ...newColumns[columnID],
        index: "FOREIGN",
        name: newColumns[columnID].oldName,
        compositeOn: [],
      };

      return {
        ...state,
        [tableID]: {
          ...state[tableID],
          columns: newColumns,
        },
      };
    }
    case "addToComposite": {
      const { columnID, compositeOn, config } = payload;
      if (!columnID) return state;
      const index = state[tableID].columns[columnID]?.index;
      let errorState = !(
        index === "COMPOSITE_PRIMARY" || index === "COMPOSITE_FOREIGN"
      );
      if (errorState) {
        const errorMessage =
          "you cannot set composite columns for a non composite key!";
        return {
          ...state,
          [tableID]: { ...state[tableID], errorState, errorMessage },
        };
      }

      errorState = index === "COMPOSITE_FOREIGN";
      if (errorState) {
        const errorMessage =
          "you cannot manually update the composite entries of a composite foreign key";
        return {
          ...state,
          [tableID]: { ...state[tableID], errorState, errorMessage },
        };
      }

      errorState = config?.isReferenced || false;
      if (errorState) {
        const errorMessage =
          "you cannot update the composite entries of a referenced composite primary key";
        return {
          ...state,
          [tableID]: { ...state[tableID], errorState, errorMessage },
        };
      }

      let resColumnID: string | null = null;
      for (const entry of Object.entries(state[tableID].columns)) {
        const [key, value] = entry;
        if (value.name === compositeOn) {
          resColumnID = `${key}:${compositeOn}`;
        }
      }
      if (!resColumnID) return state;

      const oldCompositeOn =
        state[tableID].columns[columnID]?.compositeOn || [];
      if (oldCompositeOn.includes(`${resColumnID}`)) return state;

      newState = structuredClone(state);
      const newCompositeOn = [...oldCompositeOn, `${resColumnID}`];
      newState[tableID].columns[columnID].compositeOn = newCompositeOn;

      return newState;
    }
    case "removeFromComposite": {
      const { columnID, compositeOn } = payload;
      if (!columnID) return state;
      const index = state[tableID].columns[columnID]?.index;
      const errorState = !(
        index === "COMPOSITE_PRIMARY" || index === "COMPOSITE_FOREIGN"
      );
      if (errorState) {
        const errorMessage =
          "you cannot set composite columns for a non composite key!";
        return {
          ...state,
          [tableID]: { ...state[tableID], errorState, errorMessage },
        };
      }

      const oldCompositeOn =
        state[tableID].columns[columnID]?.compositeOn || [];

      let resComposite: string | null = null;
      for (const entry of state[tableID].columns[columnID].compositeOn || []) {
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

      newState = structuredClone(state);
      let newCompositeOn = oldCompositeOn.filter((el) => {
        return el !== `${resComposite}`;
      });

      newCompositeOn = newCompositeOn.length ? newCompositeOn : [];

      newState[tableID].columns[columnID].compositeOn = newCompositeOn;

      return newState;
    }
    case "setDefault": {
      const { columnID, default: colDefault } = payload;
      if (!columnID) return state;
      const resColumn = state[tableID].columns[columnID];
      if (resColumn.readonly) return state;
      if (!colDefault || !resColumn?.type) return state;
      const supportedDefaultSet = typeDefaultMappings[resColumn.type];

      const errorState = supportedDefaultSet
        ? !supportedDefaultSet.has(colDefault)
        : !state[tableID].typeMappings[resColumn?.type].includes(colDefault);

      if (errorState) {
        const errorMessage =
          "the set default value is not compatible with the column type";
        return {
          ...state,
          [tableID]: { ...state[tableID], errorState, errorMessage },
        };
      }

      newState = structuredClone(state);
      newState[tableID].columns[columnID].default = colDefault;

      return newState;
    }
    case "setIndex": {
      const { columnID, index, config } = payload;
      newState = structuredClone(state);
      if (!columnID) return state;
      const resColumn = newState[tableID].columns[columnID];
      // if (resColumn.readonly) return state;
      if (resColumn.index === index) return state;

      let errorState = true;
      if (errorState) {
        const errorMessage =
          "index is not updatable, delete column and add again if you have to";
        return {
          ...state,
          [tableID]: { ...state[tableID], errorState, errorMessage },
        };
      }

      return state;

      errorState = config?.isCompositeMember || false;
      if (errorState) {
        const errorMessage =
          "you can't update the index of a composite key member. remove composition and retry";
        return {
          ...state,
          [tableID]: { ...state[tableID], errorState, errorMessage },
        };
      }

      switch (index) {
        case "COMPOSITE_PRIMARY": {
          const errorState = Object.values(state[tableID].columns).some(
            (col) => {
              return (
                col.index === "COMPOSITE_PRIMARY" || col.index === "PRIMARY"
              );
            }
          );

          if (errorState) {
            const errorMessage =
              "this table already has a primary/composite primary key. remove the previous if you intend to use another key.";
            return {
              ...state,
              [tableID]: { ...state[tableID], errorState, errorMessage },
            };
          }

          newState = structuredClone(state);

          let tableKeys = Object.entries(newState[tableID].columns)
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
            ...newState[tableID].columns[columnID],
            index: "COMPOSITE_PRIMARY" as const,
            name: internalIndexMarkers.COMPOSITE_PRIMARY,
            oldName: resColumn.name,
            compositeOn: tableKeys,
          };

          newState[tableID].columns[columnID] = newColumn;

          return newState;
        }
        case "COMPOSITE_FOREIGN": {
          return state;
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
          const errorState = Object.values(state[tableID].columns).some(
            (col) => {
              return (
                col.index === "COMPOSITE_PRIMARY" || col.index === "PRIMARY"
              );
            }
          );

          if (errorState) {
            const errorMessage =
              "this table already has a primary/composite primary key. if you intend to use another key, you must remove the previous key";
            return {
              ...state,
              [tableID]: { ...state[tableID], errorState, errorMessage },
            };
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

      newState[tableID].columns[columnID] = resColumn;

      return newState;
    }
    case "setName": {
      const { columnID, name } = payload;
      if (!columnID) {
        return state;
      }

      const resColumn = state[tableID].columns[columnID];
      if (!resColumn) return state;
      if (resColumn.readonly) return state;
      if (
        resColumn.index === "COMPOSITE_FOREIGN" ||
        resColumn.index === "COMPOSITE_PRIMARY"
      )
        return state; // you can't directly edit the name of a composite key
      if (resColumn.name === name) return state;

      const errorState = (name?.split(" ").length || 0) > 1;

      if (errorState) {
        const errorMessage = "column names are not allowed to have spaces!";
        return {
          ...state,
          [tableID]: { ...state[tableID], errorState, errorMessage },
        };
      }

      resColumn.name = name;

      newState = structuredClone(state);
      newState[tableID].columns[columnID] = resColumn;

      return newState;
    }
    case "setTableName": {
      const { name } = payload;
      if (name === state[tableID].tableName) return state;

      const errorState = (name?.split(" ").length || 0) > 1;

      if (errorState) {
        const errorMessage = "table name cannot contain spaces!";
        return {
          ...state,
          [tableID]: { ...state[tableID], errorState, errorMessage },
        };
      }

      newState = structuredClone(state);
      newState[tableID].tableName = name;

      return newState;
    }
    case "toggleNullibility": {
      const { columnID } = payload;
      if (!columnID) return state;
      newState = structuredClone(state);
      newState[tableID].columns[columnID].nullable =
        !newState[tableID].columns[columnID].nullable;

      return newState;
    }
    case "setType": {
      const { columnID, type: colType, tableID, config } = payload;
      if (!columnID) return state;

      newState = structuredClone(state);
      const resColumn = newState[tableID].columns[columnID];
      if (resColumn.readonly) return state;
      if (!colType) return state;
      if (resColumn.type === colType) return state;

      if (
        resColumn.index === "COMPOSITE_FOREIGN" ||
        resColumn.index === "COMPOSITE_PRIMARY"
      )
        return {
          ...state,
          [tableID]: {
            ...state[tableID],
            errorState: true,
            errorMessage: "you can't override the types of composite keys",
          },
        };

      if (resColumn.index === "PRIMARY" && config?.isReferenced) {
        return {
          ...state,
          [tableID]: {
            ...state[tableID],
            errorState: true,
            errorMessage:
              "primary index is referenced, remove references and try again",
          },
        };
      } else if (resColumn.index === "FOREIGN" && config?.isReferencing) {
        console.warn(
          "foreign index references other tables, remove references and try again"
        );
        return {
          ...state,
          [tableID]: {
            ...state[tableID],
            errorState: true,
            errorMessage:
              "foreign index references other tables, remove references and try again",
          },
        };
      } else if (
        resColumn.index === "NONE" &&
        config?.isCompositeRepReferenced
      ) {
        console.warn(
          "this column is a composite entry of a primary key that's being referenced."
        );
        return {
          ...state,
          [tableID]: {
            ...state[tableID],
            errorState: true,
            errorMessage:
              "this column is a composite entry of a primary key that's being referenced.",
          },
        };
      }

      let supportedDefaultSet: string[];
      if (typeDefaultMappings[colType])
        supportedDefaultSet = Array.from(typeDefaultMappings[colType]);
      else {
        supportedDefaultSet = state[tableID].typeMappings[colType];
      }
      if (!supportedDefaultSet) return state; // workaround: the typeMappings is only updated from a parent state so, there's a possibility that it won't exist just yet
      const [preferedDefault] = supportedDefaultSet;

      newState[tableID].columns[columnID].default = preferedDefault;

      newState[tableID].columns[columnID].type = colType;

      return newState;
    }
    case "ToggleUniqueness": {
      const { columnID } = payload;
      if (!columnID) return state;
      if (state[tableID].columns[columnID]?.readonly) return state;

      newState = structuredClone(state);
      newState[tableID].columns[columnID].unique =
        !newState[tableID].columns[columnID].unique;

      return newState;
    }
    case "setError": {
      const { errorMessage } = payload;
      if (
        state[tableID].errorMessage &&
        state[tableID].errorMessage === errorMessage
      )
        return state;
      return {
        ...state,
        [tableID]: { ...state[tableID], errorState: true, errorMessage },
      };
    }
    case "validate": {
      try {
        validateColumnName(state[tableID]);
        validateColumnType(state[tableID]);
        validatePrimaryKeyExists(state[tableID]);
      } catch (err) {
        const errorMessage = (err as Error).message;
        return {
          ...state,
          [tableID]: { ...state[tableID], errorState: true, errorMessage },
        };
      }
      return state;
    }
    case "replaceTable": {
      const { tableID, tableBody } = payload;
      if (!tableBody) return state;
      const newState = { ...state, ...{ [tableID]: tableBody } };

      return newState;
    }
    case "addTableNode": {
      const { nodeBody, mappings } = payload;
      if (!nodeBody) return state;

      const tableBody: TableUpdateFormStateType[string] = {
        columns: Object.entries(nodeBody.nodes).reduce((acc, [k, v]) => {
          const {
            data: { column, isSurrogate, surrogationTimestamp },
          } = v;
          acc[k as NodeCompositeID] = {
            ...column,
            isSurrogate,
            surrogationTimestamp,
          } as TableCRUDColumnType;
          return acc;
        }, {} as Record<NodeCompositeID, TableCRUDColumnType>),
        errorState: false,
        errorMessage: "",
        tableName: nodeBody.data.label,
        tableID: nodeBody.id,
        typeMappings: mappings!,
      };
      const newState = {
        ...state,
        ...{ [nodeBody.id]: tableBody },
      };

      return newState;
    }
    default:
      return state;
  }
};

export const __passComposites = <S, T>(
  sourceCompositeID: NodeCompositeID,
  targetSecondaryID: string
) => {
  return {
    type: "passComposites" as S,
    payload: { sourceCompositeID, targetSecondaryID } as T,
  };
};

export const __retractComposites = <S, T>(columnID: NodeCompositeID) => {
  return {
    type: "retractComposites" as S,
    payload: { columnID } as T,
  };
};
