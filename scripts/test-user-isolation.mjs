/* eslint-disable no-console */
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function userOwnsStoredFile(userId, locator) {
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

async function main() {
  const suffix = crypto.randomUUID();
  const userAEmail = `security-a-${suffix}@mycarpal.local`;
  const userBEmail = `security-b-${suffix}@mycarpal.local`;
  const oldReceiptLocator = `blob:security-tests/${suffix}/receipt-old.pdf`;
  const newReceiptLocator = `blob:security-tests/${suffix}/receipt-new.pdf`;
  const archivedRegistrationLocator = `blob:security-tests/${suffix}/registration-old.pdf`;
  const activeRegistrationLocator = `blob:security-tests/${suffix}/registration-new.pdf`;

  const userA = await prisma.user.create({
    data: {
      email: userAEmail,
      emailVerified: true,
      name: "Security User A",
      displayName: "Security User A",
    },
    select: { id: true },
  });

  const userB = await prisma.user.create({
    data: {
      email: userBEmail,
      emailVerified: true,
      name: "Security User B",
      displayName: "Security User B",
    },
    select: { id: true },
  });

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        userId: userA.id,
        kind: "CAR",
        year: 2023,
        make: "Honda",
        model: "Civic",
        trim: "Sport",
        registrationDocUrl: archivedRegistrationLocator,
        registrationDocUploadedAt: new Date(),
      },
      select: { id: true },
    });

    const maintenance = await prisma.maintenance.create({
      data: {
        vehicleId: vehicle.id,
        title: "Oil change",
        odometer: 12345,
        provider: "DIY",
        serviceDate: new Date(),
        receiptUrl: oldReceiptLocator,
      },
      select: { id: true },
    });

    const vehicleVisibleToOwner = await prisma.vehicle.findFirst({
      where: { id: vehicle.id, userId: userA.id },
      select: { id: true },
    });
    const vehicleVisibleToOtherUser = await prisma.vehicle.findFirst({
      where: { id: vehicle.id, userId: userB.id },
      select: { id: true },
    });
    assert(vehicleVisibleToOwner?.id === vehicle.id, "Vehicle owner lost access to their own vehicle record.");
    assert(!vehicleVisibleToOtherUser, "User B matched the vehicle-detail access predicate for user A's vehicle.");

    const maintenanceVisibleToOwner = await prisma.maintenance.findFirst({
      where: { id: maintenance.id, vehicle: { userId: userA.id } },
      select: { id: true },
    });
    const maintenanceVisibleToOtherUser = await prisma.maintenance.findFirst({
      where: { id: maintenance.id, vehicle: { userId: userB.id } },
      select: { id: true },
    });
    assert(maintenanceVisibleToOwner?.id === maintenance.id, "Maintenance owner lost access to their own service record.");
    assert(
      !maintenanceVisibleToOtherUser,
      "User B matched the maintenance-detail access predicate for user A's service record.",
    );

    assert(await userOwnsStoredFile(userA.id, oldReceiptLocator), "Owner could not access their initial receipt locator.");
    assert(!(await userOwnsStoredFile(userB.id, oldReceiptLocator)), "User B could access user A's receipt locator.");

    await prisma.maintenance.update({
      where: { id: maintenance.id },
      data: { receiptUrl: newReceiptLocator },
    });

    assert(
      !(await userOwnsStoredFile(userA.id, oldReceiptLocator)),
      "Old receipt locator remained reachable after the maintenance record stopped referencing it.",
    );
    assert(await userOwnsStoredFile(userA.id, newReceiptLocator), "New receipt locator was not reachable for the owner.");
    assert(!(await userOwnsStoredFile(userB.id, newReceiptLocator)), "User B could access user A's replacement receipt locator.");

    await prisma.gloveboxDocument.create({
      data: {
        userId: userA.id,
        vehicleId: vehicle.id,
        category: "REGISTRATION_ARCHIVE",
        title: "Archived registration",
        fileUrl: archivedRegistrationLocator,
      },
    });

    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: {
        registrationDocUrl: activeRegistrationLocator,
        registrationDocUploadedAt: new Date(),
      },
    });

    assert(
      await userOwnsStoredFile(userA.id, archivedRegistrationLocator),
      "Archived registration locator should remain reachable through the glovebox archive record.",
    );
    assert(
      !(await userOwnsStoredFile(userB.id, archivedRegistrationLocator)),
      "User B could access user A's archived registration locator.",
    );
    assert(
      await userOwnsStoredFile(userA.id, activeRegistrationLocator),
      "Active replacement registration locator was not reachable for the owner.",
    );

    console.log("PASS Vehicle detail ownership predicate blocks cross-user access.");
    console.log("PASS Maintenance detail ownership predicate blocks cross-user access.");
    console.log("PASS File ownership checks deny replaced locators once references are removed.");
    console.log("PASS Archived registration locators remain reachable only through owned archive records.");
  } finally {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [userA.id, userB.id],
        },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(`FAIL ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
