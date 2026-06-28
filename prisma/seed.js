/* eslint-disable no-console */
const crypto = require("node:crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function buildDateOnly(daysFromToday = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
}

async function main() {
  const existing = await prisma.vehicle.count();
  if (existing > 0) {
    console.log("Seed skipped: vehicles already exist.");
    return;
  }

  const demoEmail = "demo@mycarpal.local";
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = `${salt}:${crypto.scryptSync("password123", salt, 64).toString("hex")}`;
  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: "Demo Driver",
      displayName: "Demo Driver",
      emailVerified: true,
      passwordHash: null,
    },
    create: {
      email: demoEmail,
      name: "Demo Driver",
      emailVerified: true,
      displayName: "Demo Driver",
    },
    select: { id: true },
  });

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: user.id,
      },
    },
    update: {
      password: passwordHash,
    },
    create: {
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: passwordHash,
    },
  });

  const vehicle = await prisma.vehicle.create({
    data: {
      userId: user.id,
      kind: "CAR",
      year: 2022,
      make: "Toyota",
      model: "RAV4",
      trim: "XLE",
      vin: "",
      licensePlate: "ABC-1234",
      insuranceExpiresAt: buildDateOnly(180),
    },
  });

  await prisma.maintenance.create({
    data: {
      vehicleId: vehicle.id,
      title: "Oil change",
      odometer: 15000,
      cost: 89.99,
      provider: "DIY",
      serviceDate: buildDateOnly(),
      notes: "Initial seeded service entry.",
    },
  });

  await prisma.reminder.create({
    data: {
      vehicleId: vehicle.id,
      title: "Rotate tires",
      dueDate: buildDateOnly(30),
      notes: "Example upcoming manual reminder.",
    },
  });

  console.log("Seed complete. Demo login: demo@mycarpal.local / password123");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
