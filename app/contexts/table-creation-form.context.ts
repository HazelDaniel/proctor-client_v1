import React from "react";
import { TableCreationFormStateType, TableFormEmptyActionType, TableFormUpdateActionType } from "~/reducers/table-creation-form.reducer";

export interface TableCreationContextValueType {
  tableCreationState: TableCreationFormStateType;
  tableCreationDispatch: React.Dispatch<TableFormUpdateActionType>;
}

export const tableCreationContext =
  React.createContext<TableCreationContextValueType | null>(null);

export const TableCreationProvider = tableCreationContext.Provider;