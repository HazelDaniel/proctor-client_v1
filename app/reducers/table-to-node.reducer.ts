/* eslint-disable prefer-const */
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { XYPosition } from "@xyflow/react";
import { v7 as UUIDv7 } from "uuid";
import {
  GlobalColumnIndexType,
  GlobalColumnTypeType,
  NodeCompositeID,
  OndeleteOptionType,
  StatefulGroupNodeType,
  StatefulNodeType,
  TableCRUDFormStateType,
  TableCRUDTableType,
} from "~/types";
import {
  getNodePropFromID,
  getNodePropsFromIDS,
  parseNodeID,
} from "~/utils/node.utils";

// THIS IS A SHARED, HAPPY-PATH STATE FOR CREATED/UPDATED TABLE DATA AND AS SUCH, THERE WON'T BE MUCH VALIDATIONS DONE
interface TableToNodeStateType {
  currentGroupID: string | null;
  groupNodes: StatefulGroupNodeType;
  savedTable: TableCRUDFormStateType | null;
}

const initialTableToNodeState: TableToNodeStateType = {
  currentGroupID: null,
  groupNodes: {},
  savedTable: null,
};

export const tableToNodesSlice = createSlice({
  name: "tables:toNodes",
  initialState: initialTableToNodeState,
  reducers: {
    upload: (state, action: PayloadAction<TableCRUDFormStateType>) => {
      const { columns, tableID, tableName, referenceColumns, createdAt } = action.payload;
      if (!(!!tableID && !!columns && !!tableName)) return;
      state.groupNodes[tableID] = {
        data: { label: tableName, type: "table", toolbarVisible: true, createdAt },
        position: { x: 0, y: 0 },
        className: "table-node-group",
        nodes: {},
        referenceNodes: referenceColumns,
        id: tableID,
        type: "group",
      };

      const colToNodeTypeMap: Record<
        GlobalColumnIndexType,
        StatefulNodeType["type"]
      > = {
        COMPOSITE_FOREIGN: "composite-foreign",
        COMPOSITE_PRIMARY: "composite-primary",
        FOREIGN: "secondary",
        PRIMARY: "primary",
        NONE: "ordinary",
      };

      const resNodes: { [prop: NodeCompositeID]: StatefulNodeType } =
        Object.entries(columns).reduce((acc, curr) => {
          const [key, value] = curr;
          let {
            compositeOn,
            default: colDefault,
            index,
            name,
            nullable,
            type: colType,
            unique,
            isSurrogate,
            surrogationTimestamp,
            // oldName,
            ondelete,
            createdAt
          } = value;
          if (!compositeOn) compositeOn = [];
          if (!index) index = "NONE";
          if (!nullable) nullable = false;
          if (!unique) unique = false;
          const isComposite =
            index === "COMPOSITE_PRIMARY" || index === "COMPOSITE_FOREIGN";
          let colHastype = isComposite ? true : !!colType;

          if (!(colHastype && name)) return acc; // NOTE: WE SIMPLY WON'T PICK UP INCOMPLETE NODES
          let computedComposite = compositeOn;
          if (isComposite) {
            computedComposite =
              getNodePropsFromIDS(
                compositeOn as `${NodeCompositeID}:${string}`[]
              ) || [];
          }

          acc[key] = {
            // NOTE: ITS IMPORTANT TO HAVE IT IN THIS FORMAT AS THAT'S HOW IT'S USED IN THE CONNECTION LOGIC
            data: {
              column: {
                compositeOn,
                default: colDefault as string,
                index: index,
                nullable,
                unique,
                type: colType as GlobalColumnTypeType,
                name: !isComposite ? name : computedComposite.join(", "),
                id: key as NodeCompositeID,
                oldName: name,
                ondelete: ondelete as OndeleteOptionType,
                createdAt: createdAt as number
              },
              label: !isComposite ? name : computedComposite.join(", "),
              type: colToNodeTypeMap[index] as "primary",
              isSurrogate,
              surrogationTimestamp,
            },
            id: key,
            position: { x: 0, y: 0 },
          } satisfies StatefulNodeType;
          return acc;
        }, {} as { [prop: string]: StatefulNodeType });

      state.groupNodes[tableID] = {
        ...state.groupNodes[tableID],
        nodes: resNodes,
        id: tableID,
      };
    },
    download: (
      state,
      action: PayloadAction<{
        groupID: string;
        mappings: Record<string, string[]>;
      }>
    ) => {
      // we are going to set the savedTable property of the state to a newly constructed TableCRUDFormStateType derived from the groupNode with the current groupID
      const { groupID, mappings } = action.payload;
      const groupNode = state.groupNodes[groupID];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const colToNodeTypeMap: Record<
        Exclude<StatefulNodeType["type"], undefined>,
        GlobalColumnIndexType
      > = {
        "composite-foreign": "COMPOSITE_FOREIGN",
        "composite-primary": "COMPOSITE_PRIMARY",
        secondary: "FOREIGN",
        primary: "PRIMARY",
        ordinary: "NONE",
      };

      if (!groupNode) return;
      // console.log("got here");
      const resTableFormState: TableCRUDFormStateType = {
        tableID: groupID,
        tableName: groupNode.data.label,
        errorState: false,
        errorMessage: null,
        typeMappings: mappings,
        referenceColumns: groupNode.referenceNodes,
        columns: Object.entries(groupNode.nodes).reduce((acc, curr) => {
          const [columnID, node] = curr;
          acc[columnID] = {
            type: node.data.column?.type,
            nullable: node.data.column?.nullable,
            unique: node.data.column?.unique,
            default: node.data.column?.default,
            index: colToNodeTypeMap[node.data.type],
            compositeOn: node.data.column?.compositeOn,
            oldName: node.data.column?.name,
            name: node.data.label,
            isSurrogate: node.data.isSurrogate,
            surrogationTimestamp: node.data.surrogationTimestamp,
            ondelete: node.data.column?.ondelete,
            createdAt: node.data.column?.createdAt
          } as TableCRUDFormStateType["columns"][string];

          return acc as TableCRUDTableType["columns"];
        }, {} as TableCRUDTableType["columns"]) as unknown as TableCRUDFormStateType["columns"],
      };

      state.savedTable = resTableFormState;
    },
    updatePosition: (
      state,
      action: PayloadAction<{ groupID: string; position: XYPosition }>
    ) => {
      const { groupID, position } = action.payload;
      state.groupNodes[groupID].position = position;
    },
    setCurrentGroupID: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.currentGroupID === id) return;
      state.currentGroupID = id;
    },
    addCompositeColumns: (
      state,
      action: PayloadAction<{
        columns: StatefulNodeType["data"]["column"][];
        nodeID: NodeCompositeID;
      }>
    ) => {
      const { columns, nodeID } = action.payload;
      const [parentID, newNodeID] = parseNodeID(nodeID);
      if (!columns.length) return;
      columns.forEach((column) => {
        if (!column) return;
        let {
          compositeOn,
          default: defaultVal,
          index,
          name,
          nullable,
          type: colType,
          unique,
        } = column;
        if (!compositeOn) compositeOn = [];
        compositeOn = compositeOn.map((comp) => {
          const resComp = getNodePropFromID(
            comp as `${NodeCompositeID}:${string}`
          );
          return `${nodeID}:${resComp}`;
        });
        const generatedUUID = UUIDv7();
        const resColumn =
          state.groupNodes[parentID].nodes[newNodeID].data.column;
        if (!resColumn) return;

        state.groupNodes[parentID].nodes[newNodeID].data.column = {
          ...resColumn,
          compositeOn: [...(resColumn?.compositeOn || [])],
        };
      });
    },
  },
});

export const { upload, updatePosition, setCurrentGroupID, download } =
  tableToNodesSlice.actions;
const tableToNodesReducer = tableToNodesSlice.reducer;

export default tableToNodesReducer;
