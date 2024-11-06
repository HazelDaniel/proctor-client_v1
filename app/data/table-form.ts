import { GlobalColumnIndexType, GlobalColumnTypeType, TableFormFieldsType } from "~/types";
import TableGlobalTypes from "./table-globals";

const sqlReservedKeywords = [
  "ADD", "ALL", "ALTER", "AND", "ANY", "AS", "ASC", "BACKUP", "BETWEEN", "BY",
  "CASE", "CHECK", "COLUMN", "CONSTRAINT", "CREATE", "DATABASE", "DEFAULT", "DELETE",
  "DESC", "DISTINCT", "DROP", "EXEC", "EXISTS", "FOREIGN", "FROM", "FULL", "GROUP",
  "HAVING", "IN", "INDEX", "INNER", "INSERT", "INTO", "IS", "JOIN", "KEY", "LEFT",
  "LIKE", "LIMIT", "NOT", "NULL", "ON", "OR", "ORDER", "OUTER", "PRIMARY", "PROCEDURE",
  "RIGHT", "ROW", "SELECT", "SET", "TABLE", "TOP", "TRUNCATE", "UNION", "UNIQUE",
  "UPDATE", "VALUES", "VIEW", "WHERE",
  
  // Data Types
  "BIGINT", "BINARY", "BIT", "BLOB", "BOOLEAN", "CHAR", "DATE", "DECIMAL", "DOUBLE",
  "ENUM", "FLOAT", "INT", "INTEGER", "MONEY", "NUMBER", "NUMERIC", "REAL", "SERIAL",
  "SMALLINT", "TEXT", "TIME", "TIMESTAMP", "TINYINT", "VARCHAR", "XML", "TIMESTAMPTZ",
  "JSONB", "BYTEA", "HSTORE", "JSON",
  
  // Control Statements
  "BEGIN", "COMMIT", "END", "EXECUTE", "FETCH", "GRANT", "IF", "LOOP", "PRINT",
  "ROLLBACK", "SAVEPOINT", "SET", "TRANSACTION", "TRIGGER", "WHILE",
  
  // Database-Specific Keywords
  "ANALYZE", "OPTIMIZE", "REPLACE", "SHOW", "LANGUAGE", "RETURNS", "IMMUTABLE",
  "STABLE", "GO", "OPENQUERY", "PIVOT", "RAISERROR", "FLASHBACK", "MERGE",
  "NOCOPY", "RAW", "SEQUENCE"
];

export const reservedSQLKeywords = new Set(sqlReservedKeywords);



export const internalIndexMarkers: Omit<Record<GlobalColumnIndexType, string>, "PRIMARY" | "FOREIGN" | "NONE"> = {
  "COMPOSITE_FOREIGN": "<COMPOSITE_FOREIGN>",
  "COMPOSITE_PRIMARY": "<COMPOSITE_PRIMARY>"
}

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
    entries: ["PRIMARY", "FOREIGN", "NONE", "COMPOSITE_PRIMARY", "COMPOSITE_FOREIGN"] satisfies GlobalColumnIndexType[],
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
