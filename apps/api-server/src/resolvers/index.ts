import { prisma, Role } from "@repo/database";
import { generateCustomId } from "../utils/idGenerator";
import { deleteFromCloudinary, generateSignature } from "../utils/cloudinary";

export const resolvers = {
  Query: {
    users: async () => await prisma.user.findMany(),
    myCollections: async (_: any, { uploaderId }: { uploaderId: string }) => {
      return await prisma.collection.findMany({
        where: { uploader_id: uploaderId },
        include: { pdfs: true },
      });
    },
  },
  Mutation: {
    createUser: async (
      _: any,
      {
        email,
        role,
        tenantId,
      }: { email: string; role: string; tenantId: string },
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
      { filename, cloudinaryId, secureUrl, collectionId }: any,
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

    createCollection: async (_: any, { name, uploaderId, tenantId }: any) => {
      return await prisma.collection.create({
        data: {
          name,
          tenant_id: tenantId,
          uploader: { connect: { id: uploaderId } },
        },
      });
    },

    deletePdf: async (_: any, { id }: { id: string }) => {
      const pdf = await prisma.pDF.findUnique({ where: { id } });

      if (pdf?.cloudinary_id) {
        await deleteFromCloudinary(pdf.cloudinary_id);
      }

      return await prisma.pDF.delete({
        where: { id },
      });
    },

    deleteCollection: async (_: any, { id }: { id: string }) => {
      const pdfs = await prisma.pDF.findMany({
        where: { collection_id: id },
      });

      await Promise.all(
        pdfs.map((pdf) => {
          if (pdf.cloudinary_id) return deleteFromCloudinary(pdf.cloudinary_id);
        }),
      );

      await prisma.pDF.deleteMany({ where: { collection_id: id } });

      return await prisma.collection.delete({
        where: { id },
      });
    },
  },
};
