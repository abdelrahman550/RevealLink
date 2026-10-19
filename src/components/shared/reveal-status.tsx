import { EyeOffIcon, LockOpenIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { revealStatusEnum, revealRequestStatusEnum } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";

const REVEAL_STATUS = {
  [revealStatusEnum.NONE]: {
    label: "Anonymous",
    variant: "anon" as const,
    icon: EyeOffIcon,
  },
  [revealStatusEnum.PENDING]: { label: "Requested", variant: "warning" as const },
  [revealStatusEnum.APPROVED]: {
    label: "Revealed",
    variant: "success" as const,
    icon: LockOpenIcon,
  },
  [revealStatusEnum.REJECTED]: { label: "Declined", variant: "outline" as const },
};

export function RevealStatusBadge({
  status,
  className,
}: {
  status: keyof typeof REVEAL_STATUS;
  className?: string;
}) {
  const config = REVEAL_STATUS[status] ?? REVEAL_STATUS.none;
  const Icon = "icon" in config ? config.icon : undefined;

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {Icon ? <Icon aria-hidden="true" /> : null}
      {config.label}
    </Badge>
  );
}

const REQUEST_STATUS = {
  [revealRequestStatusEnum.PENDING]: { label: "Awaiting reply", variant: "warning" as const },
  [revealRequestStatusEnum.APPROVED]: {
    label: "Revealed",
    variant: "success" as const,
    icon: LockOpenIcon,
  },
  [revealRequestStatusEnum.REJECTED]: { label: "Declined", variant: "outline" as const },
};

export function RevealRequestStatusBadge({
  status,
  className,
}: {
  status: keyof typeof REQUEST_STATUS;
  className?: string;
}) {
  const config = REQUEST_STATUS[status] ?? REQUEST_STATUS.pending;
  const Icon = "icon" in config ? config.icon : undefined;

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {Icon ? <Icon aria-hidden="true" /> : null}
      {config.label}
    </Badge>
  );
}
