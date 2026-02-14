-- AlterTable
ALTER TABLE "public"."articles" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."categories" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."tags" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "articles_is_deleted_idx" ON "public"."articles"("is_deleted");

-- CreateIndex
CREATE INDEX "articles_deleted_at_idx" ON "public"."articles"("deleted_at");

-- CreateIndex
CREATE INDEX "categories_is_deleted_idx" ON "public"."categories"("is_deleted");

-- CreateIndex
CREATE INDEX "categories_deleted_at_idx" ON "public"."categories"("deleted_at");

-- CreateIndex
CREATE INDEX "tags_is_deleted_idx" ON "public"."tags"("is_deleted");

-- CreateIndex
CREATE INDEX "tags_deleted_at_idx" ON "public"."tags"("deleted_at");
