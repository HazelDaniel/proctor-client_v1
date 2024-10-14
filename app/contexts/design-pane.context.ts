import React from "react";
import {
  DesignPaneActionType,
  DesignPaneStateType,
} from "~/reducers/design-pane.reducer";

export interface DesignPaneContextValueType {
  designPaneState: DesignPaneStateType;
  designPaneDispatch: React.Dispatch<DesignPaneActionType<unknown>>;
}

export const designPaneContext =
  React.createContext<DesignPaneContextValueType | null>(null);

export const DesignPaneProvider = designPaneContext.Provider;
