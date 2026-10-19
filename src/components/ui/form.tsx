"use client";

import * as React from "react";
import {
  FormProvider,
  type FieldValues,
  type FormProviderProps,
  type UseFormReturn,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * Deliberately small form layer.
 *
 * shadcn's stock `<FormControl>` expects `<Controller>` as a child, which makes
 * every form verbose. Here a `<FormItem>` owns the label association, the
 * `aria-invalid` wiring, and the error slot, and clones its single control to
 * connect them. The result reads like:
 *
 *   <FormItem label="Email" error={errors.email?.message} required>
 *     <Input {...register("email")} type="email" autoComplete="email" />
 *   </FormItem>
 */

export function Form<T extends FieldValues>(
  props: FormProviderProps<T> & React.ComponentProps<"form">,
) {
  const { children, ...rest } = props;
  return (
    <FormProvider {...(rest as FormProviderProps<T>)}>
      <form noValidate {...(rest as React.ComponentProps<"form">)}>
        {children}
      </form>
    </FormProvider>
  );
}

interface FormItemProps extends Omit<React.ComponentProps<"div">, "children"> {
  label?: React.ReactNode;
  /** Pass the RHF error message; `null`/`undefined` renders nothing. */
  error?: string | null;
  hint?: React.ReactNode;
  required?: boolean;
  /** Renders the label visually hidden but still associated. */
  hideLabel?: boolean;
  children: React.ReactElement<Record<string, unknown>>;
}

export function FormItem({
  label,
  error,
  hint,
  required,
  hideLabel,
  className,
  children,
  ...rest
}: FormItemProps) {
  const id = React.useId();
  const describedBy: string[] = [];
  if (hint) describedBy.push(`${id}-hint`);
  if (error) describedBy.push(`${id}-error`);

  const control = React.cloneElement(children, {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy.length ? describedBy.join(" ") : undefined,
  });

  return (
    <div data-slot="form-item" className={cn("grid gap-1.5", className)} {...rest}>
      {label ? (
        <Label
          htmlFor={id}
          className={cn(required && "[&_span]:text-crimson", hideLabel && "sr-only")}
        >
          {label}
          {required ? (
            <span className="ml-0.5 text-crimson" aria-hidden="true">
              *
            </span>
          ) : null}
        </Label>
      ) : null}

      {control}

      {hint ? (
        <p id={`${id}-hint`} className="text-[12.5px] leading-snug text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[12.5px] leading-snug text-crimson">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Groups a set of fields under one error message (e.g. file uploads). */
export function FormFieldset({
  label,
  error,
  hint,
  className,
  children,
  ...rest
}: React.ComponentProps<"fieldset"> & {
  label?: React.ReactNode;
  error?: string | null;
  hint?: React.ReactNode;
}) {
  return (
    <fieldset className={cn("grid gap-1.5", className)} {...rest}>
      {label ? <legend className="text-[13px] font-medium">{label}</legend> : null}
      {children}
      {hint ? <p className="text-[12.5px] leading-snug text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-[12.5px] leading-snug text-crimson">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/**
 * Maps a server-side `{ field: message }` error map onto RHF so the inline
 * messages light up without re-running client validation.
 */
export function applyServerErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldErrors: Record<string, string>,
): void {
  for (const [path, message] of Object.entries(fieldErrors)) {
    if (!path) {
      form.setError("root", { type: "server", message });
      continue;
    }

    const segments = path.split(".") as (keyof T)[];
    if (segments.length === 1) {
      form.setError(segments[0] as never, { type: "server", message });
    } else {
      const [group, field] = segments;
      form.setError(`${String(group)}.${String(field)}` as never, {
        type: "server",
        message,
      });
    }
  }
}
