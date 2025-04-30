/* eslint-disable no-extra-boolean-cast */
import {
  GlobalColumnIndexType,
  GlobalColumnTypeType,
  OndeleteOptionType,
  TableFormFieldsType,
} from "~/types";
import TableGlobalTypes from "./table-globals";
import { v7, v4 } from "uuid";
import { kStringMaxLength } from "node:buffer";

//prettier-ignore
const sqlReservedKeywords = [
  "ADD", "ALL", "ALTER", "AND", "ANY", "AS", "ASC", "BACKUP", "BETWEEN",
  "BY", "CASE", "CHECK", "COLUMN", "CONSTRAINT", "CREATE", "DATABASE",
  "DEFAULT", "DELETE", "DESC", "DISTINCT", "DROP", "EXEC", "EXISTS",
  "FOREIGN", "FROM", "FULL", "GROUP", "HAVING", "IN", "INDEX", "INNER",
  "INSERT", "INTO", "IS", "JOIN", "KEY", "LEFT", "LIKE", "LIMIT", "NOT",
  "NULL", "ON", "OR", "ORDER", "OUTER", "PRIMARY", "PROCEDURE", "RIGHT", "ROW",
  "SELECT", "SET", "TABLE", "TOP", "TRUNCATE", "UNION", "UNIQUE", "UPDATE",
  "VALUES", "VIEW", "WHERE",
  // Data Types
  "BIGINT", "BINARY", "BIT", "BLOB", "BOOLEAN", "CHAR", "DATE", "DECIMAL",
  "DOUBLE", "ENUM", "FLOAT", "INT", "INTEGER", "MONEY", "NUMBER", "NUMERIC",
  "REAL", "SERIAL", "SMALLINT", "TEXT", "TIME", "TIMESTAMP", "TINYINT", "VARCHAR",
  "XML", "TIMESTAMPTZ", "JSONB", "BYTEA", "HSTORE", "JSON",
  // Control Statements
  "BEGIN", "COMMIT", "END", "EXECUTE", "FETCH", "FOR", "GRANT", "IF", "LOOP",
  "PRINT", "ROLLBACK", "SAVEPOINT", "SET", "TRANSACTION", "TRIGGER",
  "WHILE", "WHEN",

  // Database-Specific Keywords
  "ANALYZE", "OPTIMIZE", "REPLACE", "SHOW", "LANGUAGE", "RETURNS", "IMMUTABLE",
  "STABLE", "GO", "OPENQUERY", "PIVOT", "RAISERROR", "FLASHBACK", "MERGE", "NOCOPY",
  "RAW", "SEQUENCE", "SCHEMA",
];

export const reservedSQLKeywords = new Set(sqlReservedKeywords);

export const ondeleteOptions: [
  Exclude<OndeleteOptionType, "SET NULL" | "SET DEFAULT">,
  Exclude<OndeleteOptionType, "CASCADE" | "SET DEFAULT">,
  Exclude<OndeleteOptionType, "CASCADE" | "SET NULL">,
  Exclude<OndeleteOptionType, "CASCADE" | "SET NULL" | "SET DEFAULT">
] = ["CASCADE", "SET NULL", "SET DEFAULT", "NONE"];

export const internalIndexMarkers: Omit<
  Record<GlobalColumnIndexType, string>,
  "PRIMARY" | "FOREIGN" | "NONE"
> = {
  COMPOSITE_FOREIGN: "<COMPOSITE_FOREIGN>",
  COMPOSITE_PRIMARY: "<COMPOSITE_PRIMARY>",
};

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

export const typeDefaultMappings: Record<GlobalColumnTypeType, Set<string>> = {
  TIMESTAMPTZ: new Set(["CURRENT_TIMESTAMP", "NONE"]),
  YEAR: new Set(["CURRENT_YEAR", "NONE"]),
  TEXT: new Set(["RANDOM_TEXT", "NONE"]),
  "VARCHAR (256)": new Set(["RANDOM_TEXT", "NONE"]),
  BIGINT: new Set(["RANDOM_NUMBER", "NONE"]),
  BIGSERIAL: new Set(["NONE"]),
  INT: new Set(["RANDOM_INT", "RANDOM_NUMBER", "NONE"]),
  NUMERIC: new Set(["RANDOM_NUMERIC", "NONE"]),
  SERIAL: new Set(["NONE"]),
  UUID: new Set(["RANDOM_UUID", "NONE"]),
};

function isWord(c: number): boolean {
  return (
    (c >= 65 && c <= 90) ||
    (c >= 94 && c <= 122) ||
    (c >= 48 && c <= 57) ||
    c === 95
  );
}

export function isTextWord(s: string): boolean {
  return /^(\w)+$/g.test(s);
}

export const generateRandomText: () => string = () => {
  let res = "";
  let codePoint = 0;
  for (let i = 0; i < 10; i++) {
    codePoint = 32 + Math.round(Math.random() * (100 - 32));
    let char = String.fromCharCode(codePoint);

    while (!isWord(codePoint) || char === "^" || char === "`") {
      codePoint = 32 + Math.round(Math.random() * (100 - 32));
      char = String.fromCharCode(codePoint);
    }
    res += char;
  }
  return res;
};

export const extractDefaultMappings = (input: string) => {
  const mappings = typeDefaultMappings;
  const outputEntries = Object.values(mappings).reduce((acc, curr) => {
    for (const entry of Array.from(curr)) {
      acc.add(entry);
    }
    return acc;
  }, new Set());

  if (!outputEntries.has(input)) {
    return input;
  }
  if (input === "NONE") return null;

  switch (input) {
    case "CURRENT_TIMESTAMP": {
      return `'${new Date().toISOString()}'`;
    }
    case "CURRENT_YEAR": {
      return `${new Date().getFullYear()}`;
    }
    case "RANDOM_TEXT": {
      return `'${generateRandomText()}'`;
    }
    case "RANDOM_NUMBER":
    case "RANDOM_INT": {
      return `${Math.round(Math.random() * 500000)}`;
    }
    case "RANDOM_NUMERIC": {
      return `'${Math.random() * 500000.9}'`;
    }
    case "RANDOM_UUID": {
      return `gen_random_uuid()`;
    }
    default: {
      return null;
    }
  }
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
    entries: [
      "PRIMARY",
      "FOREIGN",
      "NONE",
      "COMPOSITE_PRIMARY",
      "COMPOSITE_FOREIGN",
    ] satisfies GlobalColumnIndexType[],
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
  ondelete: {
    placeholder: "NONE",
    default: "NONE",
    entries: ["SET NULL", "SET DEFAULT", "CASCADE", "NONE"],
  },
  nullable: false,
  unique: true,
};
