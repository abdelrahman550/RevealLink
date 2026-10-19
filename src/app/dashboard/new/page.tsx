"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { ComposeForm } from "@/components/messages/compose-form";

export default function NewMessagePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compose"
        title="Send a message"
        description="Paste someone’s RevealLink link — or their id — and write. Replies happen in your conversations."
      />

      <div className="flat-card max-w-2xl rounded-2xl p-5 shadow-lg sm:p-6">
        <ComposeForm />
      </div>
    </div>
  );
}
