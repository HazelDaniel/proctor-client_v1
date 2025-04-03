/* eslint-disable @typescript-eslint/ban-types */
import React from "react";
import { TableFormUpdateActionType } from "~/reducers/table-update-form.reducer";
import { TableUpdateFormStateType } from "~/types";

export interface TableUpdateContextValueType<T = {}> {
  tableUpdateState: TableUpdateFormStateType;
  state: TableUpdateFormStateType;
  tableUpdateDispatch: React.Dispatch<T & TableFormUpdateActionType>;
}

export const tableUpdateContext = 
  React.createContext<TableUpdateContextValueType | null>(null);

export const TableUpdateProvider = tableUpdateContext.Provider;