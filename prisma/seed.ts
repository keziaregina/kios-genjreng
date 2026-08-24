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

  const buyer = await prisma.user.upsert({
    where: { email: "budi@kiosgenjreng.test" },
    update: { password, role: "BUYER" },
    create: {
      name: "Budi Santoso",
      email: "budi@kiosgenjreng.test",
      password,
      role: "BUYER",
    },
  });

  // Checkout refuses to run without an address, so the demo buyer starts with one.
  const savedAddress = await prisma.address.findFirst({ where: { userId: buyer.id } });
  if (!savedAddress) {
    await prisma.address.create({
      data: {
        userId: buyer.id,
        label: "Rumah",
        recipient: "Budi Santoso",
        phone: "081234567890",
        street: "Jl. Jalanin Aja Dulu RT 7/RW 2",
        village: "Xlogoxari",
        district: "Ximbabwe",
        city: "Semarang",
        postalCode: "50123",
        isDefault: true,
      },
    });
  }

  const categoryRows = await prisma.category.findMany();
  const categoryId = (name: string) =>
    categoryRows.find((row) => row.name === name)?.id;

  // Demo catalogue so the search page has enough rows to fill both sections.
  const demoProducts = [
    { name: "Gitar Akustik Yamaha F310", price: 1_150_000, category: "Akustik", weight: 15, rating: 5, reviewCount: 128, soldCount: 1_200, stock: 10, image: "/assets/yamaha.png", description: "Dibuat dengan teknik pembuatan gitar Yamaha untuk seri premium", warranty: "1 bulan", material: "Rosewood" },
    { name: "Gitar Akustik Cort AD810OP", price: 2_300_000, category: "Akustik", weight: 15, rating: 4.9, reviewCount: 94, soldCount: 860, stock: 10, image: "/assets/Gitarakustikcord.png", description: "Body spruce solid dengan suara terang, cocok untuk panggung kecil", warranty: "3 bulan", material: "Mahogany" },
    { name: "Gitar Akustik JGS TR 01 NA", price: 495_000, category: "Akustik", weight: 11, rating: 4.6, reviewCount: 512, soldCount: 40_000, stock: 10, image: null, description: "Gitar pemula murah dengan aksi senar rendah supaya jari tidak cepat sakit", warranty: "1 bulan", material: "Linden" },
    { name: "Gitar Akustik Mini Yamaha GL1SL", price: 850_000, category: "Ukulele", weight: 5, rating: 4.5, reviewCount: 340, soldCount: 3_100, stock: 10, image: null, description: "Ukuran mini, enteng dibawa, senar nylon yang lembut di jari", warranty: "1 bulan", material: "Meranti" },
    { name: "Gitar Akustik Taylor Natural Custom", price: 372_000, category: "Melodi", weight: 10, rating: 3.8, reviewCount: 780, soldCount: 10_400, stock: 10, image: null, description: "Finishing natural custom dengan bracing tipis untuk sustain panjang", warranty: "1 bulan", material: "Sapele" },
    { name: "Bass Ibanez GSR180", price: 3_200_000, category: "Bass", weight: 16, rating: 4.7, reviewCount: 31, soldCount: 260, stock: 10, image: null, description: "Bass empat senar dengan pickup aktif, low-end tebal untuk band sekolah", warranty: "6 bulan", material: "Poplar" },
  ];

  for (const product of demoProducts) {
    const id = categoryId(product.category);
    if (!id) continue;

    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    // Rows seeded before the spec columns existed still show a bare detail block, so backfill them once.
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          description: existing.description ?? product.description,
          warranty: existing.warranty ?? product.warranty,
          material: existing.material ?? product.material,
        },
      });
      continue;
    }

    await prisma.product.create({
      data: {
        name: product.name,
        price: product.price,
        weight: product.weight,
        description: product.description,
        warranty: product.warranty,
        material: product.material,
        rating: product.rating,
        reviewCount: product.reviewCount,
        soldCount: product.soldCount,
        stock: product.stock,
        image: product.image,
        categoryId: id,
        userId: seller.id,
      },
    });
  }

  // One demo voucher so checkout has something real to type in dev.
  const existingVoucher = await prisma.voucher.findFirst({
    where: { userId: seller.id, code: "GENJRENG10" },
  });
  if (!existingVoucher) {
    await prisma.voucher.create({
      data: {
        userId: seller.id,
        code: "GENJRENG10",
        discountType: "PERCENTAGE",
        amount: 10,
        maxDiscount: 50_000,
        minPurchase: 100_000,
        usageLimit: null,
        isActive: true,
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
