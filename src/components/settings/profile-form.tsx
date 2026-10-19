"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { profileFormSchema, type ProfileValues } from "@/lib/validation";
import { GenderEnum, type User } from "@/lib/api/types";
import { updateProfileAction } from "@/actions/user.actions";
import { api } from "@/store/api/base-api";
import { useAppDispatch } from "@/store/hooks";
import { FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { fromE164EgyptPhone, sanitizeEgyptPhoneInput, toE164EgyptPhone } from "@/lib/phone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/shared/spinner";

function splitName(userName?: string | null) {
  const parts = (userName ?? "").trim().split(/\s+/).filter(Boolean);
  const [first = "", ...rest] = parts;
  return { firstName: first, lastName: rest.join(" ") };
}

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [pending, setPending] = React.useState(false);

  const initial = React.useMemo(() => splitName(user.userName), [user.userName]);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: initial.firstName,
      lastName: initial.lastName,
      phone: fromE164EgyptPhone(user.phone),
      DOB: "",
      gender: user.gender,
    },
  });

  const { errors } = form.formState;

  const phoneField = form.register("phone");

  React.useEffect(() => {
    form.reset({
      firstName: splitName(user.userName).firstName,
      lastName: splitName(user.userName).lastName,
      phone: fromE164EgyptPhone(user.phone),
      DOB: "",
      gender: user.gender,
    });
  }, [form, user.userName, user.phone, user.gender]);

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);

    const result = await updateProfileAction({
      ...values,
      phone: toE164EgyptPhone(values.phone),
    });
    setPending(false);

    if (!result.ok) {
      toast.error(result.message);
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        form.setError(field as keyof ProfileValues, { type: "server", message });
      }
      return;
    }

    toast.success("Profile updated");
    dispatch(api.util.invalidateTags(["User"]));
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <FormItem label="First name" error={errors.firstName?.message} required>
        <Input {...form.register("firstName")} autoComplete="given-name" name="firstName" />
      </FormItem>

      <FormItem label="Last name" error={errors.lastName?.message} required>
        <Input {...form.register("lastName")} autoComplete="family-name" name="lastName" />
      </FormItem>

      <FormItem
        label="Phone"
        error={errors.phone?.message}
        hint="Egyptian mobile number — we add the +20 for you."
        required
      >
        <PhoneInput
          {...phoneField}
          onChange={(event) => {
            event.target.value = sanitizeEgyptPhoneInput(event.target.value);
            void phoneField.onChange(event);
          }}
          name="phone"
          placeholder="1012345678"
        />
      </FormItem>

      <FormItem label="Date of birth" error={errors.DOB?.message} hint="Optional.">
        <Input {...form.register("DOB")} type="date" autoComplete="bday" name="DOB" />
      </FormItem>

      <div className="grid gap-1.5 sm:col-span-2 sm:max-w-xs">
        <Label htmlFor="profile-gender">
          Gender
          <span className="ml-0.5 text-crimson" aria-hidden="true">
            *
          </span>
        </Label>

        <Controller
          control={form.control}
          name="gender"
          render={({ field }) => (
            <Select
              value={String(field.value)}
              onValueChange={(value) => field.onChange(Number(value) as ProfileValues["gender"])}
            >
              <SelectTrigger
                id="profile-gender"
                aria-invalid={errors.gender ? true : undefined}
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(GenderEnum.MALE)}>Male</SelectItem>
                <SelectItem value={String(GenderEnum.FEMALE)}>Female</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        {errors.gender ? (
          <p role="alert" className="text-[12.5px] text-crimson">
            {errors.gender.message}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-4 sm:col-span-2">
        <SubmitButton pending={pending} pendingLabel="Saving…">
          Save changes
        </SubmitButton>
      </div>
    </form>
  );
}
