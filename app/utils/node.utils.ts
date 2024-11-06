import { NodeCompositeID } from "~/types";

export const parseNodeID = (nodeID: NodeCompositeID) => {
  const [parentID, ID] = nodeID.split(":");

  return [parentID, ID];
};

export const getNodePropFromID = (nodeID: `${NodeCompositeID}:${string}`) => {
  const [_, _2, property] = nodeID.split(":");

  return property;
};

export const getNodePropsFromIDS = (
  nodeIDs: `${NodeCompositeID}:${string}`[] | null
) => {
  if (!nodeIDs) return null;
  return nodeIDs.map((el) => {
    const [_, _2, prop] = el.split(":");

    return prop;
  });
};
