import { TableFormFieldsType } from "~/types";
import TableGlobalTypes from "./table-globals";

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
  "PRIMARY": true,
  "FOREIGN": true,
  "NONE": true,
  "COMPOSITE_PRIMARY": true,
  "COMPOSITE_FOREIGN": true,
}

export type GlobalColumnTypeType = keyof typeof typeSupportHash;
export type GlobalColumnIndexType = keyof typeof indexSupportHash;

export const supportedSQLTypes: GlobalColumnTypeType[] = [
  "TIMESTAMPTZ",
  "VARCHAR (256)",
  "TEXT",
  "NUMERIC",
  "UUID",
  "BIGINT",
  "BIGSERIAL",
  "SERIAL",
  "INT",
  "YEAR",
];


export const typeDefaultMappings: Record<
  GlobalColumnTypeType,
  Set<string>
> = {
  TIMESTAMPTZ: new Set(["CURRENT_TIMESTAMP"]),
  YEAR: new Set(["CURRENT_YEAR"]),
  TEXT: new Set(["RANDOM_TEXT"]),
  "VARCHAR (256)": new Set(["RANDOM_TEXT"]),
  BIGINT: new Set(["RANDOM_NUMBER"]),
  BIGSERIAL: new Set([]),
  INT: new Set(["RANDOM_INT", "RANDOM_NUMBER"]),
  NUMERIC: new Set(["RANDOM_NUMERIC"]),
  SERIAL: new Set([]),
  UUID: new Set(["RANDOM_UUID"]),
};

export const tableColumnFields: TableFormFieldsType = {
  type: {
    placeholder: "select a type",
    default: "",
    entries: [...supportedSQLTypes, ...(() => TableGlobalTypes)()],
  },
  index: {
    defaultible: true,
    placeholder: "",
    default: "NONE",
    entries: ["PRIMARY", "FOREIGN", "NONE", "COMPOSITE_PRIMARY"] satisfies GlobalColumnIndexType[],
  },
  default: {
    placeholder: "NONE",
    default: "",
    entries: [
      "RANDOM_UUID",
      "CURRENT_TIMESTAMP",
      "RANDOM_INT",
      "RANDOM_NUMERIC",
      "RANDOM_NUMBER",
      "NONE",
      "RANDOM_TEXT",
      "CURRENT_YEAR",
    ],
  },
  nullable: false,
  unique: true,
};
