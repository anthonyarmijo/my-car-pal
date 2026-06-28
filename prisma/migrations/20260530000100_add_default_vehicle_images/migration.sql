CREATE TABLE "DefaultVehicleImage" (
    "id" TEXT NOT NULL,
    "kind" "VehicleKind" NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "trim" TEXT,
    "generation" TEXT,
    "bodyClass" TEXT,
    "normalizedMake" TEXT,
    "normalizedModel" TEXT,
    "normalizedTrim" TEXT,
    "yearStart" INTEGER,
    "yearEnd" INTEGER,
    "assetUrl" TEXT,
    "storageKey" TEXT,
    "sourceProvider" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "license" TEXT NOT NULL,
    "licenseUrl" TEXT,
    "attribution" TEXT,
    "commercialUseAllowed" BOOLEAN NOT NULL DEFAULT false,
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DefaultVehicleImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DefaultVehicleImage_kind_status_idx" ON "DefaultVehicleImage"("kind", "status");
CREATE INDEX "DefaultVehicleImage_kind_normalizedMake_normalizedModel_status_idx" ON "DefaultVehicleImage"("kind", "normalizedMake", "normalizedModel", "status");
CREATE INDEX "DefaultVehicleImage_kind_normalizedMake_normalizedModel_normalizedTrim_status_idx" ON "DefaultVehicleImage"("kind", "normalizedMake", "normalizedModel", "normalizedTrim", "status");
CREATE INDEX "DefaultVehicleImage_yearStart_yearEnd_idx" ON "DefaultVehicleImage"("yearStart", "yearEnd");
