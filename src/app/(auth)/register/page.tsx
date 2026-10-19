import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Your Link",
  description:
    "Create a RevealLink account and start receiving anonymous messages with request-based identity reveals.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
