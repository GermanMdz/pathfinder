import { getSession } from '../db/neo4j';
import { dijkstra, type Edge, type Graph } from '../pathfinding/dijkstra';

interface Step {
  instruction: string;
  fromNode: string;
  toNode: string;
  stepType: string;
}

interface RouteRecord {
  from: string;
  to: string;
  weight: number;
  type: string;
}

// Construye el grafo de conexiones a partir de las filas devueltas por Neo4j.
const buildGraph = (records: RouteRecord[]): Graph => {
  const graph: Graph = new Map<string, Edge[]>();

  for (const record of records) {
    const edge: Edge = {
      to: record.to,
      weight: record.weight,
      type: record.type,
    };

    const existingEdges = graph.get(record.from) ?? [];
    existingEdges.push(edge);
    graph.set(record.from, existingEdges);
  }

  return graph;
};

// Genera un texto legible en español para cada paso del recorrido.
const buildInstruction = (toNode: string, stepType: string): string => {
  if (stepType === 'stairs') {
    return `Subí o bajá por las escaleras hasta ${toNode}`;
  }

  return `Caminá hasta ${toNode}`;
};

// Resolver mínimo para comprobar que la API responde y que Neo4j está leyendo datos.
export const resolvers = {
  Query: {
    testConnection: async (): Promise<string> => {
      const session = getSession();

      try {
        const result = await session.run('MATCH (n) RETURN count(n) AS total');
        const total = result.records[0]?.get('total');
        const nodeCount = typeof total === 'number' ? total : 0;

        return `Conexión exitosa con Neo4j. Nodos totales: ${nodeCount}`;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return `Error al consultar Neo4j: ${message}`;
      } finally {
        await session.close();
      }
    },

    route: async (_root: unknown, args: { from: string; to: string }): Promise<Step[]> => {
      const session = getSession();

      try {
        const result = await session.run(
          `MATCH (a:Node)-[r:CONNECTS_TO]->(b:Node)
           RETURN a.name AS from, b.name AS to, r.weight AS weight, r.type AS type`,
        );

        const records: RouteRecord[] = result.records.map((record) => {
          const from = record.get('from');
          const to = record.get('to');
          const weight = record.get('weight');
          const type = record.get('type');

          return {
            from: typeof from === 'string' ? from : '',
            to: typeof to === 'string' ? to : '',
            weight: typeof weight === 'number' ? weight : 0,
            type: typeof type === 'string' ? type : 'walk',
          };
        });

        const graph = buildGraph(records);
        const routeNodes = dijkstra(graph, args.from, args.to);

        if (routeNodes.length === 0) {
          return [];
        }

        const steps: Step[] = [];

        for (let index = 0; index < routeNodes.length - 1; index += 1) {
          const fromNode = routeNodes[index];
          const toNode = routeNodes[index + 1];
          const edge = graph.get(fromNode)?.find((candidate) => candidate.to === toNode);

          if (!edge) {
            continue;
          }

          steps.push({
            instruction: buildInstruction(toNode, edge.type),
            fromNode,
            toNode,
            stepType: edge.type,
          });
        }

        return steps;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Error al calcular la ruta:', message);
        return [];
      } finally {
        await session.close();
      }
    },
  },
};
