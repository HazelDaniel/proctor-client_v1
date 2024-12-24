// import { internalIndexMarkers, typeDefaultMappings } from "~/data/table-form";
// import { v7 as UUIDv7 } from "uuid";
// import { ConstraintAssertion as assertion } from "~/dao/constraint-assertion";
// import {
//   TableFormUpdatePayloadType,
//   GlobalColumnIndexType,
//   GlobalColumnTypeType,
//   NodeCompositeID,
//   TableUpdateFormStateType,
// } from "~/types";
// import { getNodePropFromID } from "~/utils/node.utils";
// import {
//   validateColumnName,
//   validateColumnType,
//   validatePrimaryKeyExists,
// } from "./utils/shared-functions";

// export const tableFormActionTypes = {
//   dropColumn: "DROP_COLUMN",
//   addColumn: "ADD_COLUMN",
//   addToComposite: "ADD_TO_COMPOSITE",
//   removeFromComposite: "REMOVE_FROM_COMPOSITE",
//   setName: "SET_NAME",
//   setTableName: "SET_TABLE_NAME",
//   setType: "SET_TYPE",
//   setIndex: "SET_INDEX",
//   toggleNullibility: "TOGGLE_NULLIBILITY",
//   ToggleUniqueness: "TOGGLE_UNIQUENESS",
//   setDefault: "SET_DEFAULT",
//   clearError: "CLEAR_ERROR",
//   setError: "SET_ERROR",
//   validate: "VALIDATE",
// };

// export interface TableFormActionType<T> {
//   type: keyof typeof tableFormActionTypes;
//   payload: T;
// }

// export interface TableFormEmptyActionType
//   extends TableFormActionType<undefined> {}

// export interface TableFormToggleActionType
//   extends TableFormActionType<{ columnID: string }> {}

// export interface TableFormDeletionActionType
//   extends TableFormActionType<{ columnID: string }> {}

// export type TableFormUpdateActionType = TableFormActionType<
//   Partial<
//     TableFormUpdatePayloadType & {
//       columnID?: string;
//       errorMessage?: string;
//       compositeOn: string[];
//     }
//   > & { tableID: string }
// >;

// export type TableFormBatchUpdateActionType = TableFormActionType<
//   (TableFormUpdatePayloadType & {
//     columnID?: string;
//     errorMessage?: string;
//     compositeOn: string[];
//   })[]
// >;

// // TODO: THERE ARE BREAKING UPDATES HERE, PLEASE CHECK THOROUGHLY FOR BUGS
// export interface TableFormBatchColumnActionType
//   extends TableFormActionType<string[]> {}

// export const initialTableCreationFormState = {};

// export const tableUpdateFormReducer: (
//   state: TableUpdateFormStateType,
//   action: TableFormUpdateActionType
// ) => TableUpdateFormStateType = (
//   state = initialTableCreationFormState,
//   action
// ) => {
//   let newState: TableUpdateFormStateType[string];
//   let { payload } = action;

//   const { tableID } = payload;

//   switch (action.type) {
//     case "clearError": {
//       if (state[tableID].errorMessage === "" && !state[tableID].errorState)
//         return state;
//       return {
//         ...state,
//         [tableID]: { ...state[tableID], errorMessage: "", errorState: false },
//       };
//     }
//     case "addColumn": {
//       const { columns, tableName } = state[tableID];
//       let errorState = !!Object.values(state[tableID].columns).find((col) => {
//         col.name === "";
//       });
//       if (errorState) {
//         let errorMessage =
//           "you cannot create new columns if existing column names are empty, name them and try again!";
//         return {
//           ...state,
//           [tableID]: { ...state[tableID], errorState, errorMessage },
//         };
//       }
//       let newKey = UUIDv7();
//       newKey = `${tableID}:${newKey}`;

//       newState = {
//         tableID,
//         errorState: false,
//         typeMappings: state[tableID].typeMappings,
//         columns: {
//           ...columns,
//           [newKey]: {
//             index: "NONE",
//             nullable: false,
//             default: "NONE",
//             name: "",
//             unique: true,
//             compositeOn: null,
//           },
//         },
//         tableName,
//       };

//       return newState;
//     }
//     case "dropColumn": {
//       const { columnID } = payload;
//       if (!columnID) return state;

//       if (!state.columns[columnID] || state.columns[columnID].readonly)
//         return state;
//       newState = structuredClone(state);
//       delete newState.columns[columnID];

//       return newState;
//     }
//     case "addToComposite": {
//       const { columnID, compositeOn } = payload;
//       if (!columnID) return state;
//       const index = state.columns[columnID]?.index;
//       let errorState = !(
//         index === "COMPOSITE_PRIMARY" || index === "COMPOSITE_FOREIGN"
//       );
//       if (errorState) {
//         let errorMessage =
//           "you cannot set composite columns for a non composite key!";
//         return { ...state, errorState, errorMessage };
//       }

//       let resColumnID: string | null = null;
//       for (const entry of Object.entries(state.columns)) {
//         const [key, value] = entry;
//         if (value.name === compositeOn) {
//           resColumnID = `${key}:${compositeOn}`;
//         }
//       }
//       if (!resColumnID) return state;

//       let oldCompositeOn = state.columns[columnID]?.compositeOn || [];
//       if (oldCompositeOn.includes(`${resColumnID}`)) return state;

//       newState = { ...state };
//       let newCompositeOn = [...oldCompositeOn, `${resColumnID}`];
//       newState.columns[columnID].compositeOn = newCompositeOn;

//       return newState;
//     }
//     case "removeFromComposite": {
//       const { columnID, compositeOn } = payload;
//       if (!columnID) return state;
//       const index = state.columns[columnID]?.index;
//       let errorState = !(
//         index === "COMPOSITE_PRIMARY" || index === "COMPOSITE_FOREIGN"
//       );
//       if (errorState) {
//         let errorMessage =
//           "you cannot set composite columns for a non composite key!";
//         return { ...state, errorState, errorMessage };
//       }

//       let oldCompositeOn = state.columns[columnID]?.compositeOn || [];

//       let resComposite: string | null = null;
//       for (const entry of state.columns[columnID].compositeOn || []) {
//         if (
//           getNodePropFromID(entry as `${NodeCompositeID}:${string}`) ===
//           compositeOn
//         ) {
//           resComposite = entry;
//           break;
//         }
//       }
//       if (!resComposite) return state;

//       if (!oldCompositeOn.includes(`${resComposite}`)) {
//         console.error(
//           "doesn't not have composite ",
//           oldCompositeOn,
//           resComposite
//         );
//         return state;
//       }

//       newState = { ...state };
//       let newCompositeOn = oldCompositeOn.filter((el) => {
//         return el !== `${resComposite}`;
//       });

//       newCompositeOn = newCompositeOn.length ? newCompositeOn : [];

//       newState.columns[columnID].compositeOn = newCompositeOn;

//       return newState;
//     }
//     case "setDefault": {
//       const { columnID, default: colDefault } = payload;
//       if (!columnID) return state;
//       const resColumn = state.columns[columnID];
//       if (resColumn.readonly) return state;
//       if (!colDefault || !resColumn?.type) return state;
//       const supportedDefaultSet = typeDefaultMappings[resColumn.type];

//       let errorState = supportedDefaultSet
//         ? !supportedDefaultSet.has(colDefault)
//         : !state.typeMappings[resColumn?.type].includes(colDefault);

//       if (errorState) {
//         let errorMessage =
//           "the set default value is not compatible with the column type";
//         return { ...state, errorState, errorMessage };
//       }

//       newState = { ...state };
//       newState.columns[columnID].default = colDefault;

//       return newState;
//     }
//     case "setIndex": {
//       const { columnID, index } = payload;
//       newState = { ...state };
//       if (!columnID) return state;
//       const resColumn = newState.columns[columnID];
//       if (resColumn.readonly) return state;
//       if (resColumn.index === index) return state;
//       switch (index) {
//         case "COMPOSITE_PRIMARY": {
//           const errorState = Object.values(state.columns).some((col) => {
//             return col.index === "COMPOSITE_PRIMARY" || col.index === "PRIMARY";
//           });

//           if (errorState) {
//             let errorMessage =
//               "this table already has a primary/composite primary key. remove the previous if you intend to use another key.";
//             return { ...state, errorState, errorMessage };
//           }

//           newState = { ...state };

//           let tableKeys = Object.entries(newState.columns)
//             .filter(([k, v]) => {
//               return (
//                 v.index !== "COMPOSITE_FOREIGN" &&
//                 v.index !== "COMPOSITE_PRIMARY" &&
//                 k !== columnID
//               );
//             })
//             .map(([key, col]) => {
//               return `${key}:${col.name}`;
//             }) as string[];

//           tableKeys = tableKeys.length ? tableKeys : ["NONE"];

//           const newColumn = {
//             ...newState.columns[columnID],
//             index: "COMPOSITE_PRIMARY" as const,
//             name: internalIndexMarkers.COMPOSITE_PRIMARY,
//             oldName: resColumn.name,
//             compositeOn: tableKeys,
//           };

//           newState.columns[columnID] = newColumn;

//           return newState;
//         }
//         case "COMPOSITE_FOREIGN": {
//           return state;
//         }
//         case "FOREIGN": {
//           resColumn.compositeOn = ["NONE"];
//           if (resColumn.index === "COMPOSITE_FOREIGN")
//             resColumn.name = resColumn.oldName;
//           resColumn.index = "FOREIGN";
//           const { COMPOSITE_FOREIGN, COMPOSITE_PRIMARY } = internalIndexMarkers;
//           resColumn.name =
//             resColumn.name === COMPOSITE_FOREIGN ||
//             resColumn.name === COMPOSITE_PRIMARY
//               ? ""
//               : resColumn.name;
//           break;
//         }
//         case "NONE": {
//           resColumn.compositeOn = ["NONE"];
//           resColumn.index = "NONE";
//           const { COMPOSITE_FOREIGN, COMPOSITE_PRIMARY } = internalIndexMarkers;
//           resColumn.name =
//             resColumn.name === COMPOSITE_FOREIGN ||
//             resColumn.name === COMPOSITE_PRIMARY
//               ? ""
//               : resColumn.name;
//           break;
//         }
//         case "PRIMARY": {
//           const errorState = Object.values(state.columns).some((col) => {
//             return col.index === "COMPOSITE_PRIMARY" || col.index === "PRIMARY";
//           });

//           if (errorState) {
//             let errorMessage =
//               "this table already has a primary/composite primary key. if you intend to use another key, you must remove the previous key";
//             return { ...state, errorState, errorMessage };
//           }

//           resColumn.compositeOn = ["NONE"];
//           resColumn.unique = true;
//           resColumn.nullable = false;
//           resColumn.index = "PRIMARY";
//           const { COMPOSITE_FOREIGN, COMPOSITE_PRIMARY } = internalIndexMarkers;
//           resColumn.name =
//             resColumn.name === COMPOSITE_FOREIGN ||
//             resColumn.name === COMPOSITE_PRIMARY
//               ? ""
//               : resColumn.name;
//           break;
//         }
//         default: {
//           break;
//         }
//       }

//       newState.columns[columnID] = resColumn;

//       return newState;
//     }
//     case "setName": {
//       const { columnID, name } = payload;
//       if (!columnID) {
//         return state;
//       }

//       const resColumn = state.columns[columnID];
//       if (!resColumn) return state;
//       if (resColumn.readonly) return state;
//       if (
//         resColumn.index === "COMPOSITE_FOREIGN" ||
//         resColumn.index === "COMPOSITE_PRIMARY"
//       )
//         return state; // you can't directly edit the name of a composite key
//       if (resColumn.name === name) return state;

//       const errorState = (name?.split(" ").length || 0) > 1;

//       if (errorState) {
//         let errorMessage = "column names are not allowed to have spaces!";
//         return { ...state, errorState, errorMessage };
//       }

//       resColumn.name = name;

//       newState = { ...state };
//       newState.columns[columnID] = resColumn;

//       return newState;
//     }
//     case "setTableName": {
//       const { name } = payload;
//       if (name === state.tableName) return state;

//       const errorState = (name?.split(" ").length || 0) > 1;

//       if (errorState) {
//         let errorMessage = "table name cannot contain spaces!";
//         return { ...state, errorState, errorMessage };
//       }

//       newState = { ...state };
//       newState.tableName = name;

//       return newState;
//     }
//     case "toggleNullibility": {
//       const { columnID } = payload;
//       if (!columnID) return state;
//       newState = { ...state };
//       newState.columns[columnID].nullable =
//         !newState.columns[columnID].nullable;

//       return newState;
//     }
//     case "setType": {
//       const { columnID, type: colType } = payload;
//       if (!columnID) return state;

//       newState = { ...state };
//       const resColumn = newState.columns[columnID];
//       if (resColumn.readonly) return state;
//       if (!colType) return state;
//       if (resColumn.type === colType) return state;

//       if (
//         resColumn.index === "COMPOSITE_FOREIGN" ||
//         resColumn.index === "COMPOSITE_PRIMARY"
//       )
//         return state; // you can't override the types of composite keys

//       let supportedDefaultSet: string[];
//       if (typeDefaultMappings[colType])
//         supportedDefaultSet = Array.from(typeDefaultMappings[colType]);
//       else {
//         supportedDefaultSet = state.typeMappings[colType];
//       }
//       if (!supportedDefaultSet) return state; // workaround: the typeMappings is only updated from a parent state so, there's a possibility that it won't exist just yet
//       const [preferedDefault] = supportedDefaultSet;

//       newState.columns[columnID].default = preferedDefault;

//       newState.columns[columnID].type = colType;

//       return newState;
//     }
//     case "ToggleUniqueness": {
//       const { columnID } = payload;
//       if (!columnID) return state;
//       if (state.columns[columnID]?.readonly) return state;

//       newState = { ...state };
//       newState.columns[columnID].unique = !newState.columns[columnID].unique;

//       return newState;
//     }
//     case "setError": {
//       const { errorMessage } = payload;
//       if (state.errorMessage && state.errorMessage === errorMessage)
//         return state;
//       return { ...state, errorMessage, errorState: true };
//     }
//     case "validate": {
//       try {
//         validateColumnName(state);
//         validateColumnType(state);
//         validatePrimaryKeyExists(state);
//       } catch (err) {
//         const errorMessage = (err as Error).message;
//         return { ...state, errorState: true, errorMessage };
//       }
//       return state;
//     }
//     default:
//       return state;
//   }
// };

// // addCompositeColumns: "ADD_COLUMNS",
// // setMultiCompositeOn: "SET_MULTI_COMPOSITE_ON",
// // removeCompositeColumns: "REMOVE_COLUMNS",
// // removeMultiCompositeOn: "REMOVE_MULTI_COMPOSITE_ON",

// // case "addCompositeColumns": {
// //   const payloads = (action as TableFormBatchUpdateActionType).payload;
// //   if (!payloads.length) return state;

// //   newState = { ...state };
// //   payloads.forEach((payload) => {
// //     const {
// //       compositeOn,
// //       default: defaultVal,
// //       index,
// //       name,
// //       nullable,
// //       type: colType,
// //       unique,
// //     } = payload;
// //     const generatedUUID = UUIDv7();
// //     newState.columns[`${state.tableID}:${generatedUUID}`] = {
// //       compositeOn,
// //       default: defaultVal,
// //       index,
// //       name,
// //       nullable,
// //       type: colType,
// //       unique,
// //     };
// //   });
// //   return newState;
// // }
// // case "removeCompositeColumns": {
// //   const payloads = (action as TableFormBatchColumnActionType).payload;
// //   return state;
// // }
// // case "setMultiCompositeOn": {
// //   const { columnID, columns } = (
// //     action as TableFormActionType<{ columnID: string; columns: string[] }>
// //   ).payload;

// //   const resColumn = state.columns[columnID];
// //   // if (resColumn.index !== "COMPOSITE_FOREIGN") return state; // TODO: error with message
// //   // NOTE: we could do the above check but this is a part of a batch update wherein the index is set to composite foreign. this check'll be counter intuitive in that case
// //   if (!resColumn) return state;

// //   newState = { ...state };

// //   newState.columns[columnID].compositeOn = [
// //     ...(resColumn.compositeOn || []),
// //     ...columns.map((el) => `${columnID}:${el}`),
// //   ];

// //   return newState;
// // }
// // case "removeMultiCompositeOn": {
// //   return state;
// // }
