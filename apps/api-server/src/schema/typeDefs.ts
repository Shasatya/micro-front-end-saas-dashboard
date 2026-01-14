export const typeDefs = `#graphql
  type User {
    id: ID!
    display_id: String
    email: String
    role: String
    tenant_id: String
  }

  type Query {
    users: [User]
  }

  type Mutation {
    createUser(email: String!, role: String!, tenantId: String!): User
  }
`;
