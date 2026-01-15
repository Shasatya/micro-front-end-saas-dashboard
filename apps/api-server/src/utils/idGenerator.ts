import { prisma, Role } from "@repo/database";

export const generateCustomId = async (role: Role) => {
  const prefixes: Record<Role, string> = {
    ADMIN: "1",
    CREATOR: "C",
    APPROVER: "A",
    SUPER_APPROVER: "SA",
    UPLOADER: "U",
  };

  if (role === "ADMIN") return "1";

  const counter = await prisma.roleCounter.upsert({
    where: { role },
    update: { count: { increment: 1 } },
    create: { role, count: 1 },
  });

  return `${prefixes[role]}${counter.count}`;
};
