import { createSlice } from "@reduxjs/toolkit";

export interface UpdateFormModalStateType {
  open: boolean;
}

export const initialUpdateFormModal: UpdateFormModalStateType = {
  open: false,
};

export const updateFormModalSlice = createSlice({
  name: "form:update:modal",
  initialState: initialUpdateFormModal,
  reducers: {
    closeUpdateFormModal: (state) => {
      state.open = false;
    },
    openUpdateFormModal: (state) => {
      state.open = true;
    },
  },
});

export const updateFormModalReducer = updateFormModalSlice.reducer;

export const { closeUpdateFormModal, openUpdateFormModal } =
  updateFormModalSlice.actions;
