import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { getUserAlerts } from "@/lib/alerts";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const alerts = await getUserAlerts(user.id, 365);
  const notificationCutoff = new Date();
  notificationCutoff.setDate(notificationCutoff.getDate() + 30);

  const count = alerts.reduce(
    (total, alert) => total + (!alert.read && alert.dueAt <= notificationCutoff ? 1 : 0),
    0,
  );

  return NextResponse.json({
    activeCount: alerts.length,
    count,
    hasNotifications: count > 0,
  });
}
