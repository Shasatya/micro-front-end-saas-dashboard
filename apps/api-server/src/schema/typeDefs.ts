export const typeDefs = `#graphql
  type User {
    id: ID!
    display_id: String
    email: String
    role: String
    tenant_id: String
  }

  type CloudinarySignature {
    signature: String!
    timestamp: Int!
    apiKey: String!
    cloudName: String!
  }

  type PDF {
    id: ID!
    filename: String!
    secure_url: String!
  }

  type Query {
    users: [User]
  }

  type Mutation {
    createUser(email: String!, role: String!, tenantId: String!): User
    
    getUploadSignature: CloudinarySignature
    
    savePdf(
      filename: String!, 
      cloudinaryId: String!, 
      secureUrl: String!, 
      collectionId: String!
    ): PDF
  }
`;
