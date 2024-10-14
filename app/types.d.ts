export interface StatefulNodeType {
  position: { x: number; y: number };
  data: { label: string; [prop: string]: any };
  type?: string;
}

export interface StatefulChatBubbleType {
  position: { x: number; y: number };
  visible: boolean;
  data: {};
}
