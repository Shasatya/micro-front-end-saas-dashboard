import { prisma, Role } from "@repo/database";
import { generateCustomId } from "../utils/idGenerator";
import { generateSignature } from "../utils/cloudinary";

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
          password: "temp_test_password",
        },
      });
    },

    getUploadSignature: () => {
      return generateSignature();
    },

    savePdf: async (
      _: any,
      { filename, cloudinaryId, secureUrl, collectionId }: any
    ) => {
      return await prisma.pDF.create({
        data: {
          filename,
          cloudinary_id: cloudinaryId,
          secure_url: secureUrl,
          collection: { connect: { id: collectionId } },
        },
      });
    },
  },
};
