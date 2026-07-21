export interface Edge {
  to: string;
  weight: number;
  type: string;
}

export type Graph = Map<string, Edge[]>;

// Implementa Dijkstra para devolver la secuencia de nombres del camino más corto.
export function dijkstra(graph: Graph, start: string, end: string): string[] {
  if (!graph.has(start) && start !== end) {
    return [];
  }

  if (start === end) {
    return [start];
  }

  const distances: Map<string, number> = new Map<string, number>();
  const previous: Map<string, string | null> = new Map<string, string | null>();
  const queue: Array<{ node: string; distance: number }> = [];

  for (const node of graph.keys()) {
    distances.set(node, Number.POSITIVE_INFINITY);
    previous.set(node, null);
  }

  distances.set(start, 0);
  queue.push({ node: start, distance: 0 });

  while (queue.length > 0) {
    queue.sort((left, right) => left.distance - right.distance);
    const current = queue.shift();

    if (!current) {
      continue;
    }

    if (current.node === end) {
      break;
    }

    const neighbors = graph.get(current.node) ?? [];

    for (const edge of neighbors) {
      const candidateDistance = current.distance + edge.weight;
      const existingDistance = distances.get(edge.to) ?? Number.POSITIVE_INFINITY;

      if (candidateDistance < existingDistance) {
        distances.set(edge.to, candidateDistance);
        previous.set(edge.to, current.node);
        queue.push({ node: edge.to, distance: candidateDistance });
      }
    }
  }

  if (distances.get(end) === Number.POSITIVE_INFINITY) {
    return [];
  }

  const path: string[] = [];
  let current: string | null = end;

  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }

  return path;
}
