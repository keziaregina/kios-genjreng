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

  const categoryRows = await prisma.category.findMany();
  const categoryId = (name: string) =>
    categoryRows.find((row) => row.name === name)?.id;

  // Demo catalogue so the search page has enough rows to fill both sections.
  const demoProducts = [
    { name: "Gitar Akustik Yamaha F310", price: 1_150_000, category: "Akustik", weight: 15, rating: 5, soldCount: 1_200, image: "/assets/yamaha.png" },
    { name: "Gitar Akustik Cort AD810OP", price: 2_300_000, category: "Akustik", weight: 15, rating: 4.9, soldCount: 860, image: "/assets/Gitarakustikcord.png" },
    { name: "Gitar Akustik JGS TR 01 NA", price: 495_000, category: "Akustik", weight: 11, rating: 4.6, soldCount: 40_000, image: null },
    { name: "Gitar Akustik Mini Yamaha GL1SL", price: 850_000, category: "Ukulele", weight: 5, rating: 4.5, soldCount: 3_100, image: null },
    { name: "Gitar Akustik Taylor Natural Custom", price: 372_000, category: "Melodi", weight: 10, rating: 3.8, soldCount: 10_400, image: null },
    { name: "Bass Ibanez GSR180", price: 3_200_000, category: "Bass", weight: 16, rating: 4.7, soldCount: 260, image: null },
  ];

  for (const product of demoProducts) {
    const id = categoryId(product.category);
    if (!id) continue;

    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (existing) continue;

    await prisma.product.create({
      data: {
        name: product.name,
        price: product.price,
        weight: product.weight,
        rating: product.rating,
        soldCount: product.soldCount,
        image: product.image,
        categoryId: id,
        userId: seller.id,
      },
    });
  }

  console.log("Seed done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
