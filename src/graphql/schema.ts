import { gql } from 'apollo-server-express';

// Schema base para levantar el servidor y dejar la consulta de prueba disponible.
export const typeDefs = gql`
  type Node {
    id: ID
    name: String
    floor: Int
    type: String
  }

  type Step {
    instruction: String!
    fromNode: String!
    toNode: String!
    stepType: String!
  }

  type Query {
    testConnection: String!
    route(from: String!, to: String!): [Step!]!
  }
`;
