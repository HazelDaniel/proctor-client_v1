import { Node } from "@xyflow/react";

export interface StatefulNodeType extends Node {
  position: { x: number; y: number };
  data: {
    label: string;
    toolbarVisible?: boolean;
    childPosition?: number;
    type:
      | "table"
      | "primary"
      | "secondary"
      | "composite"
      | "ordinary";
    [prop: string]: any;
  };
  type?: string;
}

export interface statefulNodeColorType {
  [prop: StatefulNodeType["data"]["type"]]: string;
}

export interface StatefulChatBubbleType {
  position: { x: number; y: number };
  visible: boolean;
  data: {};
}
