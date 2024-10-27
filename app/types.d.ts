import { Node } from "@xyflow/react";

export interface StatefulNodeType extends Node {
  position: { x: number; y: number };
  data: {
    label: string;
    toolbarVisible?: boolean;
    childPosition?: number;
    type: "table" | "primary" | "secondary" | "composite" | "ordinary";
    columnName: string;
    [prop: string]: any;
  };
  type?: string;
}

export interface StatefulGroupNodeType {
  [prop: string]: Omit<StatefulNodeType, "id" | "data"> & {
    nodes: { [prop: string]: Omit<StatefulNodeType, "id"> };
    data: { [prop: string]: any; toolbarVisible?: boolean; label: string };
  };
}

export interface statefulNodeColorType {
  [prop: StatefulNodeType["data"]["type"]]: string;
}

export interface StatefulChatBubbleType {
  position: { x: number; y: number };
  visible: boolean;
  data: {};
}

export interface TableFormColumnSelectType {
  defaultible?: boolean;
  placeholder: string;
  default: string | number;
  entries: string[];
}

export interface TableFormCompositeSelectType {
  readonly?: true;
  entries: Set<string>;
  placeholder: "NONE";
}

export interface TableFormFieldsType {
  "type": TableFormColumnSelectType;
  "index": TableFormColumnSelectType;
  "nullable": boolean;
  "default": TableFormColumnSelectType;
  "unique": boolean;
  // "composite on"?: TableFormCompositeSelectType; // this will be passed only as prop coz its only determined at runtime
}