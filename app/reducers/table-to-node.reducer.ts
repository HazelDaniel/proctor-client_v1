import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  supportedSQLTypes,
  tableColumnFields,
} from "~/data/table-form";
import { StatefulGroupNodeType } from "~/types";

// THIS IS A SHARED, HAPPY-PATH STATE FOR CREATED/UPDATED TABLE DATA AND AS SUCH, THERE WON'T BE MUCH VALIDATIONS DONE
interface TableToNodeStateType {
  groupNodes: StatefulGroupNodeType;
}

const initialTableToNodeState: TableToNodeStateType = {
  groupNodes: {}
}

export const tableToNodesSlice = createSlice({
  name: "tables:toNodes",
  initialState: initialTableToNodeState,
  reducers: {
  }
});

export const {} = tableToNodesSlice.actions;
const globalTypesReducer = tableToNodesSlice.reducer;

export default globalTypesReducer;

