-- CreateEnum
CREATE TYPE "VehicleKind" AS ENUM ('CAR', 'MOTORCYCLE');

-- AlterTable
ALTER TABLE "Vehicle"
ADD COLUMN "kind" "VehicleKind" NOT NULL DEFAULT 'CAR';
