import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { privateBlobUrlFromLocator, isBlobLocator } from "@/lib/storage";
import { userOwnsStoredFile } from "@/lib/storage-ownership";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const locator = request.nextUrl.searchParams.get("locator")?.trim() ?? "";
  if (!locator || !isBlobLocator(locator)) {
    return NextResponse.json({ message: "Missing or invalid locator." }, { status: 400 });
  }

  const ownsFile = await userOwnsStoredFile(user.id, locator);
  if (!ownsFile) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!blobToken) {
    return NextResponse.json({ message: "Blob storage is not configured." }, { status: 500 });
  }

  const upstream = await fetch(privateBlobUrlFromLocator(locator), {
    headers: {
      Authorization: `Bearer ${blobToken}`,
      ...(request.headers.get("if-none-match")
        ? { "if-none-match": request.headers.get("if-none-match") as string }
        : {}),
    },
    cache: "no-store",
  });

  if (upstream.status === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ...(upstream.headers.get("etag") ? { ETag: upstream.headers.get("etag") as string } : {}),
        "Cache-Control": "private, no-cache",
      },
    });
  }

  if (upstream.status === 404) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ message: "Could not load file." }, { status: 502 });
  }

  const headers = new Headers({
    "Cache-Control": "private, no-cache",
    "X-Content-Type-Options": "nosniff",
  });

  for (const [sourceName, targetName] of [
    ["content-type", "Content-Type"],
    ["content-disposition", "Content-Disposition"],
    ["content-length", "Content-Length"],
    ["etag", "ETag"],
  ] as const) {
    const value = upstream.headers.get(sourceName);
    if (value) {
      headers.set(targetName, value);
    }
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers,
  });
}
