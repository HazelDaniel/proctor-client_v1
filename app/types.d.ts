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
  data: Record;
  hasComments: boolean;
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
  ondelete: TableFormColumnSelectType;
  unique: boolean;
  // "composite on"?: TableFormCompositeSelectType; // this will be passed only as prop coz its only determined at runtime
}

export type OndeleteOptionType =
  | "SET NULL"
  | "SET DEFAULT"
  | "CASCADE"
  | "NONE";

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
  ondelete?: OndeleteOptionType;
  createdAt: number;
}

export type TableCRUDColumnType = Partial<
  Omit<TableFormUpdatePayloadType, "compositeOn"> & {
    compositeOn: ("NONE" | string)[] | null;
    isSurrogate: boolean;
    surrogationTimestamp?: string;
    outputSQL?: string;
  }
>;

export interface TableCRUDTableType {
  tableID: string;
  tableName: string;
  columns: Record<string, TableCRUDColumnType>;
  referenceColumns: Record<string, boolean>;
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
      oldName?: string;
      name: string;
      type: GlobalColumnTypeType;
      index: GlobalColumnIndexType;
      nullable: boolean;
      unique: boolean;
      default: string;
      compositeOn: string[] | null;
      id: NodeCompositeID;
      ondelete: OndeleteOptionType;
      createdAt: number;
      outputSQL?: string;
    };
    [prop: string]: any;
  };
  type?: string;
}

export interface StatefulGroupNodeType {
  [prop: string]: StatefulNodeType & {
    nodes: { [prop: string]: StatefulNodeType };
    referenceNodes: Record<string, boolean>;
  };
}

export interface statefulNodeColorType {
  [prop: StatefulNodeType["data"]["type"]]: string;
}

export type TableCreationFormStateType = Omit<
  Partial<TableCRUDTableType>,
  "referenceColumns"
> & {
  errorState: boolean;
  errorMessage?: string | null;
  typeMappings: Record<string, string[]>;
  columns: Record<string, TableCRUDColumnType>;
  referenceColumns: Record<string, boolean>;
  createdAt: number;
};

export type TableUpdateFormStateType = Record<
  string,
  Partial<TableCRUDTableType> & {
    errorState: boolean;
    errorMessage?: string | null;
    typeMappings: Record<string, string[]>;
    columns: Record<string, TableCRUDColumnType | undefined>;
    referenceColumns: Record<string, boolean>;
    createdAt: number;
  }
>;

export interface TableGraphStateType {
  tables: Graph;
  nodes: Graph;
}

export interface TableCRUDFormStateType extends TableCreationFormStateType {} // & TableUpdateFormStateType

// 
export interface ToolInstanceType {
  id: string;
  toolType: "schema-design" | string;
  createdAt: Date;
  ownerID: string;
  name: string;
  archivedAt?: Date;
}