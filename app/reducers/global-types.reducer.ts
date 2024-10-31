import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GlobalColumnTypeType, supportedSQLTypes } from "~/data/table-form";

interface GlobalTypeStateType {
  errorState: boolean;
  errorMessage?: string;
  builtinTypes: GlobalColumnTypeType[];
  typeMappings: Record<string, string[]>
}

const initialGlobalTypeState: GlobalTypeStateType = {
  errorState: false,
  builtinTypes: supportedSQLTypes,
  typeMappings: {}
};

export const typesSlice = createSlice({
  name: "tables:types",
  initialState: initialGlobalTypeState,
  reducers: {
    addType: (
      state,
      action: PayloadAction<{ typeName: string; typeEntries: string[] }>
    ) => {
      if (state.builtinTypes.includes(action.payload.typeName as any)) return; //TODO: set error message to 'cannot create the custom type, it conflicts with a builtin type'
      if (state.typeMappings[action.payload.typeName]) return; // also , we cannot have duplicate types

      state.typeMappings[action.payload.typeName] = action.payload.typeEntries;
    },
  },
});

export const { addType } = typesSlice.actions;
const globalTypesReducer = typesSlice.reducer;
export default globalTypesReducer;
