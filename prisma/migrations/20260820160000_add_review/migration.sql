-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;
-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");
-- CreateIndex
CREATE INDEX "Review_buyerId_idx" ON "Review"("buyerId");
-- CreateIndex
CREATE UNIQUE INDEX "Review_orderId_productId_key" ON "Review"("orderId", "productId");
-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Old ratings were typed by the seller, so they are cleared rather than left masquerading as review data.
UPDATE "Product" SET "rating" = NULL;
