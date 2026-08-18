import { hashPassword } from "../lib/auth/password";
import { categories } from "../lib/placeholder";
import { prisma } from "../lib/prisma";

// Idempotent dev seed; category names come from lib/placeholder.ts so mock and database never drift.
async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: { name: category.name },
    });
  }

  // Local development accounts only — the password is "password" for both.
  const password = await hashPassword("password");

  const seller = await prisma.user.upsert({
    where: { email: "rena@kiosgenjreng.test" },
    update: { password, role: "MERCHANT" },
    create: {
      name: "Rena Azalea",
      email: "rena@kiosgenjreng.test",
      password,
      role: "MERCHANT",
    },
  });

  await prisma.user.upsert({
    where: { email: "budi@kiosgenjreng.test" },
    update: { password, role: "BUYER" },
    create: {
      name: "Budi Santoso",
      email: "budi@kiosgenjreng.test",
      password,
      role: "BUYER",
    },
  });

  const akustik = await prisma.category.findUnique({ where: { name: "Akustik" } });

  if (akustik) {
    const existing = await prisma.product.findFirst({
      where: { name: "Yamaha F310" },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          name: "Yamaha F310",
          price: 1_650_000,
          categoryId: akustik.id,
          userId: seller.id,
        },
      });
    }
  }

  console.log("Seed done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
