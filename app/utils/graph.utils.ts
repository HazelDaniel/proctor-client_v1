import type { Graph } from "~/types";

export function addNode(graph: Graph, node: string): void {
  if (!graph.adjList[node]) graph.adjList[node] = [];
  if (!graph.revAdjList[node]) graph.revAdjList[node] = [];
}

export function addEdge(graph: Graph, src: string, dest: string): void {
  addNode(graph, src);
  addNode(graph, dest);
  graph.adjList[src].push(dest);
  graph.revAdjList[dest].push(src);
}

export function removeEdge(graph: Graph, src: string, dest: string): void {
  if (graph.adjList[src]) {
    graph.adjList[src] = graph.adjList[src].filter((node) => node !== dest);
  }
  if (graph.revAdjList[dest]) {
    graph.revAdjList[dest] = graph.revAdjList[dest].filter(
      (node) => node !== src
    );
  }
}

export function hasIncomingNeighbors(graph: Graph, node: string): boolean {
  return graph.revAdjList[node]?.length > 0 || false;
}

export function hasOutgoingNeighbors(graph: Graph, node: string): boolean {
  return graph.adjList[node]?.length > 0 || false;
}

export function getOrphanedNodes(graph: Graph): string[] {
  const orphanedNodes: string[] = [];
  for (const node in graph.adjList) {
    if (
      !hasIncomingNeighbors(graph, node) &&
      !hasOutgoingNeighbors(graph, node)
    ) {
      orphanedNodes.push(node);
    }
  }
  return orphanedNodes;
}

export function getSCCs(graph: Graph): string[][] {
  const visited: Record<string, boolean> = {};
  const stack: string[] = [];
  const sccs: string[][] = [];

  for (const node in graph.adjList) {
    if (!visited[node]) {
      fillOrder(graph, node, visited, stack);
    }
  }

  const reversedVisited: Record<string, boolean> = {};
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (!reversedVisited[node]) {
      const component: string[] = [];
      dfsReverse(graph, node, reversedVisited, component);
      sccs.push(component);
    }
  }
  return sccs;
}

function fillOrder(
  graph: Graph,
  node: string,
  visited: Record<string, boolean>,
  stack: string[]
): void {
  visited[node] = true;
  for (const neighbor of graph.adjList[node]) {
    if (!visited[neighbor]) {
      fillOrder(graph, neighbor, visited, stack);
    }
  }
  stack.push(node);
}

function dfsReverse(
  graph: Graph,
  node: string,
  visited: Record<string, boolean>,
  component: string[]
): void {
  visited[node] = true;
  component.push(node);
  for (const neighbor of graph.revAdjList[node]) {
    if (!visited[neighbor]) {
      dfsReverse(graph, neighbor, visited, component);
    }
  }
}

export function createGraph(): Graph {
  return {
    adjList: {},
    revAdjList: {},
    who: {},
    whose: {},
  };
}

const createRepresentatives = (sccs: string[][]) => {
  const resWho: Record<string, string> = {};
  for (let i = 0; i < sccs.length; i++) {
    const componentSet = sccs[i];
    for (let j = 0; j < componentSet.length; j++) {
      const component = componentSet[j];
      if (j === 0) {
        resWho[component] = component;
      } else {
        resWho[component] = componentSet[0];
      }
    }
  }
  return resWho;
};

const createMembers = (sccs: string[][]) => {
  const resWhose: Record<string, string[]> = {};

  for (let i = 0; i < sccs.length; i++) {
    const componentSet = sccs[i];
    for (let j = 0; j < componentSet.length; j++) {
      const component = componentSet[j];
      if (j === 0) {
        resWhose[component] = [component];
      } else {
        resWhose[componentSet[0]] = [
          ...(resWhose[componentSet[0]] || []),
          component,
        ];
      }
    }
  }

  return resWhose;
};

export const condenseGraph = (graph: Graph) => {
  const graphCP = structuredClone(graph);
  const sccs: string[][] = getSCCs(graphCP);
  graphCP.who = createRepresentatives(sccs);
  graphCP.whose = createMembers(sccs);

  graphCP.revAdjList = {}; // WE DON'T CARE ABOUT THE REVERSE ADJACENCY LIST AFTER GETTING SCCS

  for (const [key, value] of Object.entries(graphCP.adjList)) {
    for (const entry of value) {
      const whoKey = graphCP.who[key];
      const whoEntry = graphCP.who[entry];

      if (whoKey !== whoEntry) {
        if (
          !graphCP.adjList[whoKey] ||
          !graphCP.adjList[whoKey].includes(whoEntry)
        ) {
          graphCP.adjList[whoKey] = [
            ...(graphCP.adjList[whoKey] || []),
            whoEntry,
          ];
        }
      }

      if (whoKey !== key || whoEntry !== entry) {
        // severing connection in cases where both are not their own rep nodes
        if (graphCP.adjList[key]) {
          graphCP.adjList[key] =
            graphCP.adjList[key]?.filter((el) => el !== entry) || [];
        }

        if (graphCP.adjList[entry]) {
          graphCP.adjList[entry] =
            graphCP.adjList[entry]?.filter((el) => el !== key) || [];
        }
      }
      if (whoKey !== key) {
        graphCP.adjList[whoKey] = Array.from(
          new Set(
            ...(graphCP.adjList[whoKey] || []),
            ...(graphCP.adjList[key] || [])
          )
        );
        delete graphCP.adjList[key];
      }
      if (whoEntry !== entry) {
        graphCP.adjList[whoEntry] = Array.from(
          new Set(
            ...(graphCP.adjList[whoEntry] || []),
            ...(graphCP.adjList[entry] || [])
          )
        );
        delete graphCP.adjList[entry];
      }
    }
  }

  return graphCP;
};

export const topologicalSort = (graph: Graph) => {
  const topoList: string[] = [];
  const netTopoList: string[] = [];
  const inDegree: Record<string, number> = {};
  const queue: string[] = [];

  for (const el in graph.adjList) {
    inDegree[el] = 0;
  }

  for (const el in graph.adjList) {
    for (const neighbor of graph.adjList[el]) {
      inDegree[neighbor] = (inDegree[neighbor] || 0) + 1;
    }
  }

  for (const el in graph.adjList) {
    if (inDegree[el] === 0) {
      queue.push(el);
    }
  }

  while (queue.length) {
    const curr = queue.shift();
    topoList.push(curr as string);

    for (const neighbor of graph.adjList[curr as string] || []) {
      inDegree[neighbor] = (inDegree[neighbor] || 1) - 1;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  for (const u of topoList) {
    for (const v of graph.whose[u] || []) {
      netTopoList.push(v);
    }
  }

  return netTopoList;
};