import { getSession } from "@/lib/session";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <SettingsView
      sessionTwoStepVerification={session?.user?.twoStepVerification ?? false}
    />
  );
}
