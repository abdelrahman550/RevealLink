"use client";

import * as React from "react";

import { useGetMeQuery } from "@/store/api/users.api";
import { PageHeader } from "@/components/dashboard/page-header";
import { ShareLink } from "@/components/share/share-link";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { ProfileForm } from "@/components/settings/profile-form";
import { TwoFactorCard } from "@/components/settings/two-factor-card";
import { AppearanceCard } from "@/components/settings/appearance-card";
import { QueryError } from "@/components/shared/query-error";
import { Skeleton } from "@/components/ui/skeleton";

const SECTIONS = [
  { id: "link", label: "Your link" },
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "appearance", label: "Appearance" },
] as const;

export function SettingsView({
  sessionTwoStepVerification,
}: {
  /** Read from the Auth.js session on the server — the durable source of truth. */
  sessionTwoStepVerification: boolean;
}) {
  const {
    data: user,
    isLoading,
    isUninitialized,
    isError,
    error,
    refetch,
  } = useGetMeQuery();
  const loading = isLoading || isUninitialized;

  // The session remembers the flag (set on a two-step sign-in or when enabling
  // it); the profile endpoint may not echo it yet.
  const twoStepVerification =
    sessionTwoStepVerification || user?.twoStepVerification === true;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Account & preferences"
        description="Your link, your details, and how you sign in."
      />

      <nav aria-label="Settings sections" className="flex flex-wrap gap-x-4 gap-y-2">
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="text-[12.5px] text-muted-foreground underline-offset-4 transition-colors hover:text-crimson hover:underline"
          >
            {section.label}
          </a>
        ))}
      </nav>

      {loading ? (
        <div className="space-y-4" role="status" aria-label="Loading settings">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : isError || !user ? (
        <QueryError error={error} onRetry={() => void refetch()} />
      ) : (
        <div className="space-y-10">
          <SettingsSection
            id="link"
            eyebrow="Sharing"
            title="Your message link"
            description="The one URL that lets anyone write to you without a name."
          >
            <ShareLink userId={user._id} />
          </SettingsSection>

          <SettingsSection
            id="profile"
            eyebrow="Identity"
            title="Profile"
            description="What people see once a reveal has been approved."
          >
            <div className="space-y-6">
              <AvatarUpload user={user} />

              <div className="flat-card rounded-xl px-4 py-3">
                <p className="label-caps text-muted-foreground">Email</p>
                <p className="mt-1 text-[13.5px] text-foreground" translate="no">
                  {user.email}
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Your sign-in email can’t be changed here yet.
                </p>
              </div>

              <ProfileForm user={user} />
            </div>
          </SettingsSection>

          <SettingsSection
            id="security"
            eyebrow="Access"
            title="Sign-in & security"
            description="Protect your account with a second step."
          >
            <TwoFactorCard user={user} twoStepVerification={twoStepVerification} />
          </SettingsSection>

          <SettingsSection
            id="appearance"
            eyebrow="Interface"
            title="Appearance"
            description="One theme, built for this: dim, flat, and easy on the eyes."
          >
            <AppearanceCard />
          </SettingsSection>
        </div>
      )}
    </div>
  );
}

function SettingsSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 space-y-5">
      <div className="space-y-1.5">
        <p className="label-caps text-muted-foreground">{eyebrow}</p>
        <h2 id={`${id}-title`} className="font-display text-xl font-bold tracking-[-0.03em]">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}
