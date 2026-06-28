import "server-only";

import { prisma } from "@/lib/prisma";

export async function userOwnsStoredFile(userId: string, locator: string): Promise<boolean> {
  const [avatarCount, vehicleCount, maintenanceCount, gloveboxCount, insuranceCount] = await Promise.all([
    prisma.user.count({
      where: {
        id: userId,
        avatarUrl: locator,
      },
    }),
    prisma.vehicle.count({
      where: {
        userId,
        OR: [{ imageUrl: locator }, { registrationDocUrl: locator }, { insuranceDocUrl: locator }],
      },
    }),
    prisma.maintenance.count({
      where: {
        receiptUrl: locator,
        vehicle: {
          userId,
        },
      },
    }),
    prisma.gloveboxDocument.count({
      where: {
        fileUrl: locator,
        OR: [{ userId }, { vehicle: { userId } }],
      },
    }),
    prisma.insurancePolicy.count({
      where: {
        userId,
        documentUrl: locator,
      },
    }),
  ]);

  return (
    avatarCount > 0 ||
    vehicleCount > 0 ||
    maintenanceCount > 0 ||
    gloveboxCount > 0 ||
    insuranceCount > 0
  );
}
