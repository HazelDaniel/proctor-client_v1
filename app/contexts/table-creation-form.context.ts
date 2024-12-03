import React from "react";
import { TableFormUpdateActionType } from "~/reducers/table-creation-form.reducer";
import { TableCreationFormStateType } from "~/types";
export interface TableCreationContextValueType<T = {}> {
  tableCreationState: TableCreationFormStateType;
  state: TableCreationFormStateType;
  tableCreationDispatch: React.Dispatch<T & TableFormUpdateActionType>;
}

export const tableCreationContext =
  React.createContext<TableCreationContextValueType | null>(null);

export const TableCreationProvider = tableCreationContext.Provider;