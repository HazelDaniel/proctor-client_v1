export const designPaneActionTypes = {
  setActiveTab: "SET_ACTIVE_TAB",
};

export interface DesignPaneActionType<T> {
  type: keyof typeof designPaneActionTypes;
  payload: T;
}

export interface DesignPaneStateType {
  activeTab: "comment" | "table" | "select" | null;
}

export const initialDesignPaneState: DesignPaneStateType = {
  activeTab: null,
};

export const designPaneReducer: (
  state: DesignPaneStateType,
  action: DesignPaneActionType<unknown>
) => DesignPaneStateType = (state = initialDesignPaneState, action) => {
  let newState: DesignPaneStateType;
  switch (action.type) {
    case "setActiveTab": {
      if (state.activeTab === action.payload) return state;
      newState = { ...state };
      newState.activeTab = action.payload as
        | "comment"
        | "table"
        | "select"
        | null;
      return newState;
    }
    default:
      return state;
  }
};


// ACTION PRODUCERS

export const __setActiveTab: (
  tab: "comment" | "table" | "select" | null
) => DesignPaneActionType<"comment" | "table" | "select" | null> = (tab) => {
  return {
    type: "setActiveTab",
    payload: tab,
  };
};

// SELECTORS
