-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "availableColors" JSONB,
ADD COLUMN     "availableSizes" JSONB,
ADD COLUMN     "careInstructions" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "keyFeatures" JSONB,
ADD COLUMN     "material" TEXT,
ADD COLUMN     "stockTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subcategory" TEXT;
