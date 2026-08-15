-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
-- CreateIndex
CREATE INDEX "Product_userId_idx" ON "Product"("userId");
