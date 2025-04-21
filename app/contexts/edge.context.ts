import { createContext } from 'react';
import { Edge } from '@xyflow/react';

export interface EdgeContextValueType {
  edges: Edge[];
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
}

export const edgeContext = createContext<EdgeContextValueType | null>(null);
export const EdgeProvider = edgeContext.Provider;