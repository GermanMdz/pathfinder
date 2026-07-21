import 'dotenv/config';
import neo4j, { Driver, Session } from 'neo4j-driver';

const uri: string = process.env.NEO4J_URI ?? '';
const user: string = process.env.NEO4J_USER ?? '';
const password: string = process.env.NEO4J_PASSWORD ?? '';

let driver: Driver | null = null;

const ensureEnvironment = (): void => {
  if (!uri || !user || !password) {
    throw new Error(
      'Faltan variables de entorno: NEO4J_URI, NEO4J_USER y NEO4J_PASSWORD deben estar definidas.',
    );
  }
};

// Devuelve una única instancia del driver de Neo4j para reutilizar la conexión.
export const getDriver = (): Driver => {
  ensureEnvironment();

  if (driver === null) {
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  return driver;
};

// Crea una sesión nueva a partir del driver singleton.
export const getSession = (): Session => {
  return getDriver().session();
};

// Verifica la conectividad con Neo4j al iniciar la aplicación.
export const verifyConnectivity = async (): Promise<void> => {
  try {
    await getDriver().verifyConnectivity();
    console.log('Conexión a Neo4j verificada correctamente.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('No se pudo verificar la conexión con Neo4j:', message);
    throw error;
  }
};

// Cierra el driver de forma prolija para shutdown del servidor.
export const closeDriver = async (): Promise<void> => {
  if (driver !== null) {
    await driver.close();
    driver = null;
  }
};
