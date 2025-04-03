/* eslint-disable @typescript-eslint/no-explicit-any */
import { Node } from "@xyflow/react";

export interface Graph {
  adjList: Record<string, string[]>;
  revAdjList: Record<string, string[]>;
  who: Record<string, string>;
  whose: Record<string, string[]>;
}

export type NodeCompositeID = `${string}:${string}`;
export enum CompositeNodeStringOffset {
  PARENT_ID_OFFSET,
  NODE_ID_OFFSET,
  COMPOSITE_NODE_ID_OFFSET,
  COMPOSITE_NODE_DATA_OFFSET,
}

export interface StatefulChatBubbleType {
  position: { x: number; y: number };
  visible: boolean;
  data: {};
}

const typeSupportHash = {
  TIMESTAMPTZ: true,
  "VARCHAR (256)": true,
  TEXT: true,
  NUMERIC: true,
  UUID: true,
  BIGINT: true,
  BIGSERIAL: true,
  SERIAL: true,
  INT: true,
  YEAR: true,
};

const indexSupportHash = {
  PRIMARY: true,
  FOREIGN: true,
  NONE: true,
  COMPOSITE_PRIMARY: true,
  COMPOSITE_FOREIGN: true,
};

export type GlobalColumnTypeType = keyof typeof typeSupportHash;
export type GlobalColumnIndexType = keyof typeof indexSupportHash;

export interface TableFormColumnSelectType {
  defaultible?: boolean;
  placeholder: string;
  default: string | number;
  entries: (string | number)[];
}

export interface TableFormCompositeSelectType {
  readonly?: true;
  entries: Set<string>;
  placeholder: "NONE";
}

export interface TableFormFieldsType {
  type: TableFormColumnSelectType;
  index: TableFormColumnSelectType;
  nullable: boolean;
  default: TableFormColumnSelectType;
  unique: boolean;
  // "composite on"?: TableFormCompositeSelectType; // this will be passed only as prop coz its only determined at runtime
}

export interface TableFormUpdatePayloadType {
  type: GlobalColumnTypeType;
  index: GlobalColumnIndexType;
  default: string;
  nullable: boolean;
  unique: boolean;
  name: string;
  compositeOn: "NONE" | string;
  oldName?: string;
  readonly?: boolean;
}

export type TableCRUDColumnType = Partial<
  Omit<TableFormUpdatePayloadType, "compositeOn"> & {
    compositeOn: ("NONE" | string)[] | null;
  }
>;

export interface TableCRUDTableType {
  tableID: string;
  tableName: string;
  columns: Record<string, TableCRUDColumnType>;
}

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
      | "ordinary"
      | "composite-primary";
    column?: {
      name: string;
      type: GlobalColumnTypeType;
      index: GlobalColumnIndexType;
      nullable: boolean;
      unique: boolean;
      default: string;
      compositeOn: string[] | null;
    };
    [prop: string]: any;
  };
  type?: string;
}

export interface StatefulGroupNodeType {
  [prop: string]: Omit<StatefulNodeType, "id"> & {
    nodes: { [prop: string]: Omit<StatefulNodeType, "id"> };
  };
}

export interface statefulNodeColorType {
  [prop: StatefulNodeType["data"]["type"]]: string;
}

export type TableCreationFormStateType = Partial<TableCRUDTableType> & {
  errorState: boolean;
  errorMessage?: string | null;
  typeMappings: Record<string, string[]>;
  columns: Record<string, TableCRUDColumnType>;
};

export type TableUpdateFormStateType = Record<
  string,
  Partial<TableCRUDTableType> & {
    errorState: boolean;
    errorMessage?: string | null;
    typeMappings: Record<string, string[]>;
    columns: Record<string, TableCRUDColumnType | undefined>;
  }
>;

export interface TableCRUDFormStateType extends TableCreationFormStateType {} // & TableUpdateFormStateType
