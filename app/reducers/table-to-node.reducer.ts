import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { XYPosition } from "@xyflow/react";
import {
  GlobalColumnIndexType,
  NodeCompositeID,
  StatefulGroupNodeType,
  StatefulNodeType,
  TableCRUDFormStateType,
} from "~/types";
import { getNodePropsFromIDS } from "~/utils/node.utils";

// THIS IS A SHARED, HAPPY-PATH STATE FOR CREATED/UPDATED TABLE DATA AND AS SUCH, THERE WON'T BE MUCH VALIDATIONS DONE
interface TableToNodeStateType {
  currentGroupID: string | null;
  groupNodes: StatefulGroupNodeType;
}

const initialTableToNodeState: TableToNodeStateType = {
  currentGroupID: null,
  groupNodes: {},
};

export const tableToNodesSlice = createSlice({
  name: "tables:toNodes",
  initialState: initialTableToNodeState,
  reducers: {
    upload: (state, action: PayloadAction<TableCRUDFormStateType>) => {
      const { columns, tableID, tableName } = action.payload;
      if (!(!!tableID && !!columns && !!tableName)) return;
      state.groupNodes[tableID] = {
        data: { label: tableName, type: "table", toolbarVisible: true },
        position: { x: 0, y: 0 },
        className: "table-node-group",
        nodes: {},
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

      const resNodes: { [prop: string]: Omit<StatefulNodeType, "id"> } =
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
            computedComposite = getNodePropsFromIDS(compositeOn as `${NodeCompositeID}:${string}`[]) || [];
          }

          acc[key] = {
            // NOTE: ITS IMPORTANT TO HAVE IT IN THIS FORMAT AS THAT'S HOW IT'S USED IN THE CONNECTION LOGIC
            data: {
              column: {
                compositeOn,
                default: colDefault,
                index: index,
                nullable,
                unique,
                type: colType,
                name: !isComposite ? name : computedComposite.join(", "),
              },
              label: !isComposite ? name : computedComposite.join(", "),
              type: colToNodeTypeMap[index],
            },
            position: { x: 0, y: 0 },
          } as Omit<StatefulNodeType, "id">;
          return acc;
        }, {} as { [prop: string]: Omit<StatefulNodeType, "id"> });

      state.groupNodes[tableID] = {
        ...state.groupNodes[tableID],
        nodes: resNodes,
      };
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
  },
});

export const { upload, updatePosition, setCurrentGroupID } =
  tableToNodesSlice.actions;
const tableToNodesReducer = tableToNodesSlice.reducer;

export default tableToNodesReducer;
