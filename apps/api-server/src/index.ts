import dotenv from "dotenv";
dotenv.config();

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema/typeDefs";
import { resolvers } from "./resolvers";

const start = async () => {
  const server = new ApolloServer({ typeDefs, resolvers });
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  const { url } = await startStandaloneServer(server, {
    listen: { port: port },
  });

  console.log(`Server ready at: ${url}`);
};

start();
