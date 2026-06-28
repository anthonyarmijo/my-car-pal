import { NextRequest, NextResponse } from "next/server";
import { AuthRateLimitAction } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth-session";
import { consumeAuthRateLimit, createAuthRateLimitContext } from "@/lib/auth-rate-limit";
import { decodeVinVehicle } from "@/lib/vin-decode";

const VIN_DECODE_RATE_LIMIT_MAX_ATTEMPTS = 12;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rateLimitContext = createAuthRateLimitContext(AuthRateLimitAction.VIN_DECODE, request.headers);
  const { limited } = await consumeAuthRateLimit(rateLimitContext, VIN_DECODE_RATE_LIMIT_MAX_ATTEMPTS);
  if (limited) {
    return NextResponse.json(
      { message: "Too many VIN decode requests. Please wait a minute and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
        },
      },
    );
  }

  let vin: string;

  try {
    const payload = (await request.json()) as { vin?: string };
    vin = String(payload.vin ?? "");
  } catch {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  try {
    const decoded = await decodeVinVehicle(vin);
    return NextResponse.json({
      vin: decoded.vin,
      kind: decoded.kind,
      year: decoded.year,
      make: decoded.make,
      model: decoded.model,
      drivetrain: decoded.drivetrain,
      trimOptions: decoded.trimOptions,
      preferredTrim: decoded.preferredTrim,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "VIN decode failed." },
      { status: 400 },
    );
  }
}
