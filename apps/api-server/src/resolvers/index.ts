import { PrismaClient, Role } from "@repo/database";
import { generateCustomId } from "../utils/idGenerator";

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    users: async () => await prisma.user.findMany(),
  },
  Mutation: {
    createUser: async (
      _: any,
      {
        email,
        role,
        tenantId,
      }: { email: string; role: string; tenantId: string }
    ) => {
      const userRole = role as Role;

      const displayId = await generateCustomId(userRole);

      return await prisma.user.create({
        data: {
          email,
          role: userRole,
          display_id: displayId,
          tenant_id: tenantId,
          password: "temp_test_password", // TODO: Bcrypt
        },
      });
    },
  },
};
