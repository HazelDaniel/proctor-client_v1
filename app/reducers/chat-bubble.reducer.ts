import { XYPosition } from "@xyflow/react";
import { StatefulChatBubbleType } from "~/types";

export const chatBubbleActionTypes = {
  setActive: "SET_ACTIVE",
  hideAll: "HIDE_ALL",
  showAll: "SHOW_ALL",
  add: "ADD",
};

export interface ChatBubbleActionType<T> {
  type: keyof typeof chatBubbleActionTypes;
  payload: T;
}

export interface ChatBubbleAdditionActionType extends ChatBubbleActionType<{pos: {x: number; y: number}}> {
}

export interface ChatBubbleStateType {
  activeID: string | null;
  bubbles: { [prop: string]: StatefulChatBubbleType };
  commonState: "hidden" | "visible";
}

export const initialChatBubbleState: ChatBubbleStateType = {
  activeID: null,
  bubbles: {
  },
  commonState: "visible",
};

export const chatBubbleReducer: (
  state: ChatBubbleStateType,
  action: ChatBubbleActionType<unknown>
) => ChatBubbleStateType = (state = initialChatBubbleState, action) => {
  let newState: ChatBubbleStateType;
  switch (action.type) {
    case "hideAll": {
      if (state.commonState === "hidden") return state;
      newState = { ...state };
      const bubblesEntries = Object.entries(newState.bubbles).map(
        ([key, { data, position, visible }]) => {
          return [key, { data, position, visible: false }];
        }
      );
      newState = Object.fromEntries(bubblesEntries);
      newState.commonState = "hidden";
      return newState;
    }
    case "showAll": {
      if (state.commonState === "visible") return state;
      newState = { ...state };
      const bubblesEntries = Object.entries(newState.bubbles).map(
        ([key, { data, position, visible }]) => {
          return [key, { data, position, visible: true }];
        }
      );
      newState = Object.fromEntries(bubblesEntries);
      newState.commonState = "visible";
      return newState;
    }
    case "setActive": {
      if (state.activeID === action.payload) return state;
      newState = { ...state };
      newState.activeID = action.payload as string | null;
      return newState;
    }
    case "add": {
      newState = {...state};
      const {payload} = (action as ChatBubbleAdditionActionType);
      const id = `${Object.keys(newState.bubbles).length}-${new Date().getTime()}`;
      newState.bubbles[id] = {data: {}, position: payload.pos, visible: newState.commonState === "visible"};
      return newState;
    }
    default:
      return state;
  }
};

// ACTION PRODUCERS
export const __addBubble: (pos: XYPosition) => ChatBubbleAdditionActionType = (
  pos
) => {
  return {
    type: "add",
    payload: {pos},
  };
};

export const __setActiveBubble: (id: string) => ChatBubbleActionType<string> = (
  id
) => {
  return {
    type: "setActive",
    payload: id,
  };
};

export const __showAll: () => ChatBubbleActionType<undefined> = () => {
  return {
    type: "showAll",
    payload: undefined,
  };
};

export const __hideAll: () => ChatBubbleActionType<undefined> = () => {
  return {
    type: "hideAll",
    payload: undefined,
  };
};

// SELECTORS
export const selectChatBubbles: (
  state: ChatBubbleStateType
) => (StatefulChatBubbleType & { id: string })[] = (state) => {
  return Object.entries(state.bubbles).reduce(
    (acc: (StatefulChatBubbleType & { id: string })[], curr) => {
      const res = { id: curr[0], ...curr[1] };
      acc.push(res);
      return acc;
    },
    []
  );
};
