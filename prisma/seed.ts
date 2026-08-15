import { categories } from "../lib/placeholder";
import { prisma } from "../lib/prisma";

/**
 * Dev seed. Idempotent — safe to re-run.
 * Category names come from lib/placeholder.ts so the UI mock and the database
 * never drift apart.
 */
async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: { name: category.name },
    });
  }

  // Local development account only. Plain-text password — see the SECURITY TODO
  // in app/api/users/route.ts before this reaches any shared environment.
  const seller = await prisma.user.upsert({
    where: { email: "rena@kiosgenjreng.test" },
    update: {},
    create: {
      name: "Rena Azalea",
      email: "rena@kiosgenjreng.test",
      password: "password",
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
