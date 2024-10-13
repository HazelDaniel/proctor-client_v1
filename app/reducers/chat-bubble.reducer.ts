export const chatBubbleActionType = {
  setActive: "SET_ACTIVE",
  hideAll: "HIDE_ALL",
  showAll: "SHOW_ALL",
}

export interface ChatBubbleStateType {
  activeID: string | null;
  bubbles: { [prop: string]: {position: {x: number, y: number}; visible: boolean; data: {}} };
}

export const initialChatBubbleState: ChatBubbleStateType = {
  activeID: null,
  bubbles: {
    "12041": {position: {x: 50, y: 145}, visible: true, data: {}},
    "12042": {position: {x: 240, y: 220}, visible: true, data: {}},
    "12043": {position: {x: 50, y: 3}, visible: true, data: {}},
    "12044": {position: {x: 20, y: 210}, visible: true, data: {}},
    "12045": {position: {x: 190, y: 120}, visible: true, data: {}},
  }
}