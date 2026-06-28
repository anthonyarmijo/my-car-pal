import { ProfileAvatarUploadForm } from "@/components/profile-avatar-upload-form";
import { requireCurrentUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@/lib/storage";
import { updateProfileAction } from "@/app/profile/actions";
import { CoreInstallPanel } from "@/components/core-install-panel";
import { getVehicleAllowance } from "@/lib/billing";
import { Badge, Button, Card, Field, FormMessage, Input, Textarea } from "@my-car-pal/ui";

type ProfilePageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const user = await requireCurrentUser();
  const params = await searchParams;
  const saved = params.saved === "1";

  const allowance = await getVehicleAllowance(user.id);

  const rawProfile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      email: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
    },
  });
  const profile = rawProfile
    ? {
        ...rawProfile,
        avatarUrl: rawProfile.avatarUrl ? await getSignedUrl(rawProfile.avatarUrl) : null,
      }
    : null;

  return (
    <Card style={{ maxWidth: "44rem" }}>
      <Badge>Profile</Badge>
      <h2 className="section-title">Your account</h2>
      <p className="section-subtitle">Keep this simple: name, photo, and a short bio.</p>

      <div style={{ marginTop: "1rem", display: "grid", justifyItems: "center", gap: "0.55rem" }}>
        <div className="profile-avatar-preview">
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt="Profile avatar"
              style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }}
            />
          ) : (
            <span>Photo</span>
          )}
        </div>
        <ProfileAvatarUploadForm hasAvatar={Boolean(profile?.avatarUrl)} />
      </div>

      <form action={updateProfileAction} className="form-stack" style={{ marginTop: "1rem" }}>
        <Field label="Email" htmlFor="profile-email">
          <Input id="profile-email" type="email" value={profile?.email ?? user.email} disabled />
        </Field>

        <Field label="Display name" htmlFor="profile-display-name">
          <Input id="profile-display-name" name="displayName" type="text" defaultValue={profile?.displayName ?? ""} placeholder="Your name" />
        </Field>

        <Field label="Bio" htmlFor="profile-bio">
          <Textarea id="profile-bio" name="bio" defaultValue={profile?.bio ?? ""} placeholder="A short note about you" />
        </Field>

        <Button type="submit">
          Save profile
        </Button>
      </form>

      <CoreInstallPanel allowsMotorcycles={allowance.allowsMotorcycles} isUnlimited={allowance.isUnlimited} />

      {saved ? (
        <FormMessage tone="success" style={{ marginTop: "0.8rem" }}>
          Profile saved.
        </FormMessage>
      ) : null}
    </Card>
  );
}
