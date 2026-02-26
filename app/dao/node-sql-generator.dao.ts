/* eslint-disable no-extra-boolean-cast */
//prettier-ignore
import {  NodeCompositeID, TableGraphStateType } from "~/types";
import { NodesStateType } from "~/reducers/nodes.reducer";
import { getNodePropFromID, parseNodeID } from "~/utils/node.utils";
import { getSCCs, hasOutgoingNeighbors } from "~/utils/graph.utils";
import { extractDefaultMappings } from "~/data/table-form";

export const UNPARSED_TOKEN_MARKER = "<UNPARSED>";

type ReferenceListType = {
  id: string;
  label: string;
  referenceNodes: NodeCompositeID[];
}[];

export class NodeSQLGeneratorDao {
  private nodes: NodesStateType;
  private tableSCCs: string[][];
  private predefinedTypesOutput: string = "";

  constructor(
    nodes: NodesStateType,
    public graph: TableGraphStateType,
    public referenceList: ReferenceListType,
    public typeMappings: Record<string, string[]>
  ) {
    this.nodes = structuredClone(nodes); // the only foreign object mutated. so, cloned
    this.tableSCCs = getSCCs(this.graph.tables);
    this.tableSCCs.reverse(); //NOTE: important because referencing comes before referenced in the strongly connected comp
  }

  run(): void {
    this.validate();
    this.generate();
  }

  validate(): void {
    if (Object.keys(this.nodes.groupNodes).length === 0) {
      throw new Error("no tables created yet!");
    }
    for (const group of this.referenceList) {
      this.validateReferences(group);
    }
  }

  generate(): void {
    this.predefinedTypesOutput = "";
    for (const [type, entries] of Object.entries(this.typeMappings)) {
      const entriesString = entries.reduce((acc, curr, idx) => {
        acc += "'";
        acc += curr;
        if (idx !== entries.length - 1) {
          acc += `', `;
        } else {
          acc += "'";
        }
        return acc;
      }, "");
      this.predefinedTypesOutput += `CREATE TYPE IF NOT EXISTS ${type} AS ENUM (${entriesString});\n`;
    }

    for (const scc of this.tableSCCs) {
      scc.reverse();

      const resultGroups = scc
        .map((el) => this.nodes.groupNodes[el])
        .filter((group) => !!group) // Filter out missing groups
        .sort((a, b) => (a.data.createdAt || 0) - (b.data.createdAt || 0));
      const groupCount = resultGroups.length;

      for (let i = 0; i < groupCount; i++) {
        const resultGroup = resultGroups[i];

        const surrogateNodeEntries = Object.entries(resultGroup.nodes).filter(
          ([k, v]) => {
            return v.data.isSurrogate;
          }
        );

        const nodeEntries = Object.entries(resultGroup.nodes).filter(
          ([k, v]) => {
            return !v.data.isSurrogate;
          }
        );

        const nodeEntryLength =
          surrogateNodeEntries.length + nodeEntries.length;

        let j = 0;

        for (; j < surrogateNodeEntries.length; j++) {
          const [k, v] = surrogateNodeEntries[j];
          //prettier-ignore
          // non-trivial cycles
          if (scc.length > 1) {
              // this.generateGroups( k as NodeCompositeID, ["FOREIGN", "COMPOSITE_FOREIGN"].includes( v.data.column?.index || "NONE") && i < groupCount - 1, (j < surrogateNodeEntries.length -1) ? j < surrogateNodeEntries.length - 1 && !!nodeEntryLength : !!nodeEntryLength, resultGroup.id);
              this.generateGroups( k as NodeCompositeID, ["FOREIGN", "COMPOSITE_FOREIGN"].includes( v.data.column?.index || "NONE"), (j < surrogateNodeEntries.length -1) ? j < surrogateNodeEntries.length - 1 && !!nodeEntryLength : !!nodeEntryLength, resultGroup.id, scc);
            } else {
              this.generateGroups( k as NodeCompositeID, false,  (j < surrogateNodeEntries.length - 1) ? j < surrogateNodeEntries.length - 1 && !!nodeEntryLength : !!nodeEntryLength, resultGroup.id, scc);
            }
        }

        for (; j < nodeEntryLength; j++) {
          const [k, v] = nodeEntries[j - surrogateNodeEntries.length];
          //prettier-ignore
          if (scc.length > 1) {
              // this.generateGroups( k as NodeCompositeID, ["FOREIGN", "COMPOSITE_FOREIGN"].includes( v.data.column?.index || "NONE") && i < groupCount - 1, j < nodeEntryLength - 1, resultGroup.id);
              this.generateGroups( k as NodeCompositeID, ["FOREIGN", "COMPOSITE_FOREIGN"].includes( v.data.column?.index || "NONE"), j < nodeEntryLength - 1, resultGroup.id, scc);
            } else {
              this.generateGroups( k as NodeCompositeID, false, j < nodeEntryLength - 1, resultGroup.id, scc);
            }
        }
      }
    }
  }

  validateReferences(group: ReferenceListType[number]) {
    const { id, label, referenceNodes } = group;

    for (const nodeID of referenceNodes) {
      const resultNode = this.nodes.groupNodes[id].nodes[nodeID];
      if (!resultNode || !resultNode.data.column) {
        //prettier-ignore
        // throw new Error( "there are ids do not resolve to corresponding columns");
        continue;
      }

      if (
        (resultNode.data.column.index === "COMPOSITE_FOREIGN" ||
          resultNode.data.column.index === "FOREIGN") &&
        !hasOutgoingNeighbors(this.graph.nodes, nodeID)
      ) {
        // Fallback for COMPOSITE_FOREIGN: check if it has compositeOn data
        if (resultNode.data.column.index === "COMPOSITE_FOREIGN" && (resultNode.data.column.compositeOn?.length || 0) > 0) {
          continue;
        }
        //prettier-ignore
        throw new Error( `table '${label}' has unresolved references. check that all foreign keys are referencing`);
      }
    }
  }

  //prettier-ignore
  get code(): string {
    let acc = `${this.predefinedTypesOutput}` + `${!!this.predefinedTypesOutput ? "\n" : ""}`;

    for (const scc of this.tableSCCs) {
      for (const tableID of scc) {
        const resGroup = this.nodes.groupNodes[tableID];
        if (!resGroup) continue;
        const {nodes, data: {label}} = resGroup;
        acc += `CREATE TABLE IF NOT EXISTS ${label} (\n`;

        const surrogateNodeValues = Object.values(nodes).filter(
          (v) => {
            return v.data.isSurrogate;
          }
        );

        const nodeValues = Object.values(nodes).filter(
          (v) => {
            return !v.data.isSurrogate;
          }
        );

        acc += surrogateNodeValues.reduce((acc2, {data: {column}}) => {
          acc2 += column?.outputSQL || "";
          acc2 +=  "\n";
          return acc2;
        }, "");


        acc += nodeValues.reduce((acc2, {data: {column}}) => {
          acc2 += column?.outputSQL || "";
          acc2 +=  "\n";
          return acc2;
        }, "");

        acc += `);\n\n`;
      }
    }

    return acc;
  }

  generateGroups(
    columnID: NodeCompositeID,
    shouldDefer: boolean,
    shouldPunctuate: boolean,
    originalGroupID: string,
    sccGroup: string[]
  ): string {
    //TODO: we'll handle generated columns and check conditions
    let resultSQL = "";
    const INDENT = "\t";

    let resColumnID = columnID;
    let likelySurrogate: boolean = false;

    const [colParentID] = parseNodeID(resColumnID);
    const parentGroup = this.nodes.groupNodes[colParentID];
    if (!parentGroup) {
      console.warn(`Parent group ${colParentID} not found for column ${columnID}`);
      return "";
    }
    let node = parentGroup.nodes[columnID];

    if (!node) {
      resColumnID = columnID.split("/")[0] as NodeCompositeID;
      node = structuredClone(parentGroup.nodes[resColumnID]);

      if (!node) {
        console.warn(`Node ${columnID} (or surrogate base) not found in group ${colParentID}`);
        return "";
      }

      likelySurrogate = true;
    }
    const { id: NodeID } = node;

    if (!node.data.column) {
      console.warn(
        `there's no corresponding column to parse for this id: ${resColumnID}`
      );
      return "";
    }

    const {
      default: colDefault,
      index,
      name,
      nullable,
      ondelete,
      type: colType,
      unique,
    } = node.data.column;

    if (index !== "COMPOSITE_PRIMARY" && index !== "COMPOSITE_FOREIGN") {
      //prettier-ignore
      resultSQL = `${INDENT}${name} ${colType}${!!unique ? " UNIQUE" : ""}${nullable ? "" : " NOT NULL"}${ !!(colDefault && extractDefaultMappings(colDefault)) ? " DEFAULT " + extractDefaultMappings(colDefault) + "::" + colType : "" }${ index === "PRIMARY" ? " PRIMARY KEY" : "" }`;
    } else if (index === "COMPOSITE_PRIMARY") {
      const resName =
        !!name && name[name.length - 1] === ","
          ? name.slice(0, name.length - 1)
          : name;

      resultSQL += `${INDENT}PRIMARY KEY (${resName})`;
    }

    if (
      (index === "FOREIGN" || index == "COMPOSITE_FOREIGN") &&
      !likelySurrogate
    ) {
      let target = likelySurrogate
        ? resColumnID
        : this.graph.nodes.adjList[NodeID] ? this.graph.nodes.adjList[NodeID][0] : undefined;

      // Fallback for COMPOSITE_FOREIGN: use compositeOn data if graph is missing
      if (!target && index === "COMPOSITE_FOREIGN" && (node.data.column.compositeOn?.length || 0) > 0) {
        target = node.data.column.compositeOn![0];
      }

      if (!target) return "";

      const [referenceParentID] = parseNodeID(target as NodeCompositeID);

      if (resultSQL) resultSQL += `,\n`;

      const refGroup = this.nodes.groupNodes[referenceParentID];
      if (!refGroup) {
        console.warn(`Reference parent group ${referenceParentID} not found`);
        return "";
      }

      if (index === "FOREIGN") {
        const refNode = refGroup.nodes[target as string];
        resultSQL += `${INDENT}FOREIGN KEY (${name}) REFERENCES ${
          refGroup.data.label
        }(${
          refNode?.data?.column?.name || UNPARSED_TOKEN_MARKER
        }) ON DELETE ${ondelete}${
          shouldDefer && sccGroup.includes(referenceParentID) ? " DEFERRABLE INITIALLY DEFERRED" : ""
        }`;
      } else {
        const targetNode = refGroup.nodes[target as string];
        const targetCompositeOn = targetNode?.data?.column?.compositeOn || [];
        const refEntries = targetCompositeOn
          .map((el) => {
            const name = getNodePropFromID(
              el as `${NodeCompositeID}:${string}`
            );
            return name;
          })
          .join(", ");

        const resName =
          !!name && name[name.length - 1] === ","
            ? name.slice(0, name.length - 1)
            : name;

        //prettier-ignore
        resultSQL += `${INDENT}FOREIGN KEY (${resName}) REFERENCES ${ refGroup.data.label }(${refEntries || UNPARSED_TOKEN_MARKER}) ON DELETE ${ondelete}${ shouldDefer && sccGroup.includes(referenceParentID)
          ? " DEFERRABLE INITIALLY DEFERRED" : "" }`;
      }
    }

    resultSQL += shouldPunctuate ? "," : "";
    node.data.column.outputSQL = resultSQL;

    if (likelySurrogate) {
      node.data.column.outputSQL = resultSQL;
      const origGroup = this.nodes.groupNodes[originalGroupID];
      if (origGroup && origGroup.nodes[columnID]?.data?.column) {
        origGroup.nodes[columnID].data.column!.outputSQL = resultSQL;
      }
    } else {
      parentGroup.nodes[resColumnID].data.column!.outputSQL = resultSQL;
    }

    return columnID;
  }
}
