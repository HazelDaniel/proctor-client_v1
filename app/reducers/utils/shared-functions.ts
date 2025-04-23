/* eslint-disable no-extra-boolean-cast */
import {
  GlobalColumnIndexType,
  GlobalColumnTypeType,
  NodeCompositeID,
  StatefulGroupNodeType,
  TableCreationFormStateType,
  TableUpdateFormStateType,
} from "~/types";
import { ConstraintAssertion as assertion } from "~/dao/constraint-assertion";
import { internalIndexMarkers, reservedSQLKeywords } from "~/data/table-form";
import { getNodePropFromID } from "~/utils/node.utils";

export interface ValidatorConfigType {
  isReferenced?: boolean; // Is this column referenced by other tables?
  isPrimaryKeyReferenced?: boolean; // Is table's primary key referenced?

  // Composite Key Validations
  isCompositePrimaryMember?: boolean; // Is part of composite primary key?
  isCompositeForeignMember?: boolean; // Is part of composite foreign key?
  isCompositeMember?: boolean;

  hasCompositeMembers?: boolean; // Does this composite have members?

  // Foreign Key Validations
  isReferencing?: boolean; // Does this column reference other tables?
  // hasCircularReference?: boolean; // Would this create circular reference?

  // Type Validations
  isTypeCompatible?: boolean; // Is new type compatible with references?, applies only to foreign keys . composite foreign keys will be auto-filled with types and data of surrogates

  // Column State
  isLastColumn?: boolean; // Is this the last column in table?

  isCompositeRepReferenced?: boolean; // Is the composition representative referenced (assuming that this one is a 'compositeOn' entry)

  //MISC
}


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

  const duplicateValidator = (
    cols: TableCreationFormStateType["columns"][string][]
  ) => {
    const occHash: Record<string, number> = {};
    return !!!cols.find((el) => {
      if (!el.name) {
        // handling undefined and empty strings
        return false;
      }
      if (!occHash[el.name as string]) {
        occHash[el.name as string] = 1;
      } else {
        occHash[el.name as string] += 1;
      }
      return occHash[el.name as string] > 1;
    });
  };

  const reservedValidator = (
    cols: TableCreationFormStateType["columns"][string][]
  ) => {
    return cols.every((el) => !reservedSQLKeywords.has(el.name as string));
  };

  const tableNameValidator = () => !!state.tableName;

  assertion.construct([tableNameValidator], "the table name cannot be empty");
  assertion.construct(
    [
      () => emptyValidator(stateColumns),
      () => duplicateValidator(stateColumns),
    ],
    "some column names are either empty or duplicated"
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

export const __clearError = <S, T>(tableID?: string) => {
  return {
    type: "clearError" as S,
    payload: { tableID } as T,
  };
};

export const __setError = <S, T>(errorMessage: string, tableID?: string) => {
  return {
    type: "setError" as S,
    payload: {
      errorMessage,
      tableID,
    } as T,
  };
};

export const __addColumn = <S, T>(tableID?: string) => {
  return {
    type: "addColumn" as S,
    payload: { tableID } as T,
  };
};

export const __dropColumn = <S, T>(columnID: string, tableID?: string, config?: ValidatorConfigType) => {
  return {
    type: "dropColumn" as S,
    payload: { columnID, tableID, config } as T,
  };
};

export const __addToComposite = <S, T>(
  columnID: string,
  compositeOn: string,
  tableID?: string,
  config?: ValidatorConfigType
) => {
  return {
    type: "addToComposite" as S,
    payload: { columnID, compositeOn, tableID, config } as T,
  };
};

export const __removeFromComposite = <S, T>(
  columnID: string,
  compositeOn: string,
  tableID?: string,
  config?: ValidatorConfigType
) => {
  return {
    type: "removeFromComposite" as S,
    payload: { columnID, compositeOn, tableID, config } as T,
  };
};

export const __setDefault = <S, T>(
  columnID: string,
  colDefault: string,
  tableID?: string
) => {
  return {
    type: "setDefault" as S,
    payload: { columnID, default: colDefault, tableID } as T,
  };
};

export const __setIndex = <S, T>(
  columnID: string,
  index: GlobalColumnIndexType,
  tableID?: string,
  config?: ValidatorConfigType
) => {
  return {
    type: "setIndex" as S,
    payload: { columnID, index, tableID, config } as T,
  };
};

export const __setName = <S, T>(
  columnID: string,
  name: string,
  tableID?: string
) => {
  return {
    type: "setName" as S,
    payload: { columnID, name, tableID } as T,
  };
};

export const __setTableName = <S, T>(name: string, tableID?: string) => {
  return {
    type: "setTableName" as S,
    payload: { name, tableID } as T,
  };
};

export const __setType = <S, T>(
  columnID: string,
  type: GlobalColumnTypeType,
  tableID?: string,
  config?: ValidatorConfigType
) => {
  return {
    type: "setType" as S,
    payload: { columnID, type, tableID, config } as T,
  };
};

export const __toggleUniqueness = <S, T>(
  columnID: string,
  tableID?: string
) => {
  return {
    type: "ToggleUniqueness" as S,
    payload: { columnID, tableID } as T,
  };
};

export const __toggleNullibility = <S, T>(
  columnID: string,
  tableID?: string
) => {
  return {
    type: "toggleNullibility" as S,
    payload: { columnID, tableID } as T,
  };
};

export const __replaceTable = <S, T>(
  tableID?: string,
  tableBody?: TableUpdateFormStateType[string]
) => {
  return {
    type: "replaceTable" as S,
    payload: { tableID, tableBody } as T,
  };
};

export const __addNodeTable = <S, T>(
  tableID?: string,
  nodeBody?: StatefulGroupNodeType[string],
  mappings?: Record<string, string[]>
) => {
  return {
    type: "addTableNode" as S,
    payload: { tableID, nodeBody, mappings } as T,
  };
};

// SELECTORS
export const selectCompositeColumns: (
  state: TableCreationFormStateType | TableUpdateFormStateType,
  id: string,
  tableID?: string
) => string[] = (state, id, tableID) => {
  if ("columns" in state) {
    const resColumn = (state as TableCreationFormStateType).columns[id];
    if (!resColumn) return ["NONE"];

    const tableKeys = Object.entries(state.columns)
      .filter(([k, v]) => {
        void k;
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
  } else if (`${tableID}` in state) {
    const resColumn = (state as TableUpdateFormStateType)[`${tableID}`].columns[
      id
    ];
    if (!resColumn) return ["NONE"];

    const tableKeys = Object.entries(
      (state as TableUpdateFormStateType)[`${tableID}`].columns
    )
      .filter(([k, v]) => {
        void k;
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
  } else {
    throw new Error("TypeMismatch");
  }
};

export const selectNullibility: (
  state: TableCreationFormStateType | TableUpdateFormStateType,
  id: string,
  tableID?: string
) => boolean = (state, id, tableID) => {
  if ("columns" in state) {
    const resColumn = (state as TableCreationFormStateType).columns[id];
    return resColumn?.nullable || false;
  } else if (`${tableID}` in state) {
    const resColumn = (state as TableUpdateFormStateType)[`${tableID}`].columns[
      id
    ];

    return resColumn?.nullable || false;
  } else {
    throw new Error("TypeMismatch");
  }
};

export const selectUniqueness: (
  state: TableCreationFormStateType | TableUpdateFormStateType,
  id: string,
  tableID?: string
) => boolean = (state, id, tableID) => {
  if ("columns" in state) {
    const resColumn = (state as TableCreationFormStateType).columns[id];
    return resColumn?.unique || false;
  } else if (`${tableID}` in state) {
    const resColumn = (state as TableUpdateFormStateType)[`${tableID}`].columns[
      id
    ];

    return resColumn?.unique || false;
  } else {
    throw new Error("TypeMismatch");
  }
};

export const selectIndex: (
  state: TableCreationFormStateType | TableUpdateFormStateType,
  id: string,
  tableID?: string
) => GlobalColumnIndexType = (state, id, tableID) => {
  if ("columns" in state) {
    const resColumn = (state as TableCreationFormStateType).columns[id];
    return resColumn?.index || "NONE";
  } else if (`${tableID}` in state) {
    const resColumn = (state as TableUpdateFormStateType)[`${tableID}`]
      ?.columns[id];

    return resColumn?.index || "NONE";
  } else {
    throw new Error("TypeMismatch");
  }
};

export const selectType: (
  state: TableCreationFormStateType | TableUpdateFormStateType,
  id: string,
  tableID?: string
) => GlobalColumnTypeType = (state, id, tableID) => {
  if ("columns" in state) {
    const resColumn = (state as TableCreationFormStateType).columns[id];
    return resColumn.type! as GlobalColumnTypeType;
  } else if (`${tableID}` in state) {
    const resColumn = (state as TableUpdateFormStateType)[`${tableID}`].columns[
      id
    ];

    return resColumn.type! as GlobalColumnTypeType;
  } else {
    throw new Error("TypeMismatch");
  }
};

export const selectDefault: (
  state: TableCreationFormStateType | TableUpdateFormStateType,
  id: string,
  tableID?: string
) => string = (state, id, tableID) => {
  if ("columns" in state) {
    const resColumn = (state as TableCreationFormStateType).columns[id];
    return resColumn.default as string;
  } else if (`${tableID}` in state) {
    const resColumn = (state as TableUpdateFormStateType)[`${tableID}`].columns[
      id
    ];
    if (!resColumn) {
      return "";
    }
    return resColumn.default as string;
  } else {
    throw new Error("TypeMismatch");
  }
};

export const selectColumnIDFromName: (
  state: TableCreationFormStateType | TableUpdateFormStateType,
  name: string,
  tableID?: string
) => string | null = (state, name, tableID?: string) => {
  if ("columns" in state) {
    const resColumnEntry = Object.entries(
      (state as TableCreationFormStateType).columns
    ).find(([key, val]) => {
      void key;
      return val.name === name;
    });
    if (resColumnEntry) return resColumnEntry[0];
  } else if (`${tableID}` in state) {
    const resColumnEntry = Object.entries(
      (state as TableUpdateFormStateType)[`${tableID}`].columns
    ).find(([key, val]) => {
      void key;
      return val.name === name;
    });

    if (resColumnEntry) return resColumnEntry[0];
  } else {
    throw new Error("TypeMismatch");
  }

  return null;
};
