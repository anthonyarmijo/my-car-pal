import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { getUserUnreadAlertCount } from "@/lib/alerts";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const count = await getUserUnreadAlertCount(user.id, 30);
  return NextResponse.json({ count, hasNotifications: count > 0 });
}
