import 'dotenv/config';
import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { closeDriver, verifyConnectivity } from './db/neo4j';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

// Inicializa Express y deja el backend listo para recibir requests GraphQL.
const app: Application = express();
const port: number = Number(process.env.PORT ?? 4000);

const bootstrap = async (): Promise<void> => {
  try {
    // Intenta verificar conectividad con Neo4j antes de abrir el servicio HTTP.
    await verifyConnectivity();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('La verificación de Neo4j falló al iniciar. El servidor puede arrancar igual:', message);
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.listen(port, () => {
    console.log(`GraphQL endpoint disponible en http://localhost:${port}${server.graphqlPath}`);
  });
};

// Maneja cierre limpio del driver de Neo4j cuando el proceso recibe señales de apagado.
const gracefulShutdown = async (): Promise<void> => {
  await closeDriver();
  process.exit(0);
};

process.once('SIGINT', () => {
  void gracefulShutdown();
});

process.once('SIGTERM', () => {
  void gracefulShutdown();
});

void bootstrap();
