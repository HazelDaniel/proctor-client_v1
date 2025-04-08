/* eslint-disable prefer-const */
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Edge, XYPosition } from "@xyflow/react";
import type {
  GlobalColumnIndexType,
  GlobalColumnTypeType,
  NodeCompositeID,
  StatefulGroupNodeType,
  StatefulNodeType,
  TableUpdateFormStateType,
} from "~/types";
import { getNodePropsFromIDS } from "~/utils/node.utils";

const NODE_OFFSET_VALUE = 43;

export interface NodesStateType {
  groupNodes: StatefulGroupNodeType;
  edges: { [prop: string]: Omit<Edge, "id"> };
  activeNode: string | null;
}

const initialNodesState: NodesStateType = {
  groupNodes: {},
  edges: {},
  activeNode: null,
};

const nodesSlice = createSlice({
  name: "nodes:nodes",
  initialState: initialNodesState,
  reducers: {
    setNodePosition: (state, action) => {
      const { id, position } = action.payload;
      const node = state.groupNodes[id];
      if (node) {
        node.position = position;
      }
    },
    setActiveNode: (state, action) => {
      const { activeNodeID } = action.payload;
      console.log("active node id set to ", activeNodeID);
      state.activeNode = activeNodeID;
    },
    addNodeGroup: (
      state,
      action: PayloadAction<{
        groupID: string;
        group: StatefulGroupNodeType[string];
        position?: XYPosition;
      }>
    ) => {
      let { position, group, groupID } = action.payload;
      let resultNodes: StatefulGroupNodeType[string]["nodes"];
      if (position) {
        resultNodes = Object.fromEntries(
          Object.entries(group.nodes).map(([key, value], index) => {
            return [
              key,
              {
                ...value,
                position: { x: 0, y: index * NODE_OFFSET_VALUE },
                style: {
                  width: "var(--node-width-here)",
                  height: "var(--global-node-height)",
                },
                type: "tableNode",
                extent: "parent" as const,
                className: "table-node",
                draggable: false,
              },
            ];
          })
        );
        group = {
          ...group,
          position,
        };
      }

      resultNodes = Object.fromEntries(
        Object.entries(group.nodes).map(([key, value], index) => {
          return [
            key,
            {
              ...value,
              position: { x: 0, y: index * NODE_OFFSET_VALUE },
              style: {
                width: "var(--node-width-here)",
                height: "var(--global-node-height)",
              },
              type: "tableNode",
              extent: "parent" as const,
              className: "table-node",
              draggable: false,
            },
          ];
        })
      );
      group = {
        ...group,
        nodes: resultNodes,
        className: "table-node-group",
        style: {
          width: "max-content",
          height: "max-content",
          padding: "0",
          backgroundColor: "unset",
        },
      };
      state.groupNodes[groupID] = group;
    },
    updateNodeGroup: (
      state,
      action: PayloadAction<{
        group: TableUpdateFormStateType[string];
      }>
    ) => {
      let { group } = action.payload;
      const { columns, tableID, tableName } = group;
      if (!tableID) {
        return;
      }

      let resultNodes: StatefulGroupNodeType[string]["nodes"];

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
              },
              label: !isComposite ? name : computedComposite.join(", "),
              type: colToNodeTypeMap[index] as "primary",
              isSurrogate,
              surrogationTimestamp,
            },
            id: isSurrogate ? `${key}/${surrogationTimestamp}` : key,
            position: { x: 0, y: 0 },
          } satisfies StatefulNodeType;
          return acc;
        }, {} as { [prop: string]: StatefulNodeType });

      const resGroup = {
        nodes: resNodes,
        id: tableID,
      } as StatefulGroupNodeType[string];

      resultNodes = Object.fromEntries(
        Object.entries(resGroup.nodes).map(([key, value], index) => {
          const {
            data: { isSurrogate, surrogationTimestamp },
          } = value;

          return [
            isSurrogate ? `${key}/${surrogationTimestamp}` : key,
            {
              ...value,
              position: { x: 0, y: index * NODE_OFFSET_VALUE },
              style: {
                width: "var(--node-width-here)",
                height: "var(--global-node-height)",
              },
              type: "tableNode",
              extent: "parent" as const,
              className: "table-node",
              draggable: false,
            },
          ];
        })
      );

      let resultGroup = {
        ...state.groupNodes[tableID],
        ...resGroup,
        position: state.groupNodes[tableID].position,
        nodes: resultNodes,
        className: "table-node-group",
        style: {
          width: "max-content",
          height: "max-content",
          padding: "0",
          backgroundColor: "unset",
        },
        data: {
          ...state.groupNodes[tableID].data,
          label: tableName,
        },
      } as StatefulGroupNodeType[string];

      state.groupNodes[tableID] = resultGroup;
    },
  },
});

export const { setNodePosition, setActiveNode, addNodeGroup, updateNodeGroup } =
  nodesSlice.actions;

const nodesReducer = nodesSlice.reducer;

export default nodesReducer;
