"use client";

import Link from "next/link";
import {
  COUNTRIES,
  postalLabel,
  regionLabel,
  type CheckoutDetails,
  type CheckoutErrors,
  type Country,
} from "@/lib/checkout";

/**
 * Contact and delivery details.
 *
 * Field styling matches the existing contact form so checkout reads as part of
 * the same site. Every input is labelled, and errors are wired through
 * aria-describedby / aria-invalid rather than colour alone.
 */

const fieldClass =
  "w-full rounded-lg bg-input px-4 py-2 text-base leading-8 text-black outline-none focus-visible:outline-2 focus-visible:outline-primary";
const labelClass = "block text-lg leading-8 text-secondary";

function Field({
  id,
  label,
  error,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required ? (
          <span className="text-primary" aria-hidden="true">
            {" "}
            *
          </span>
        ) : (
          <span className="text-sm text-white/50"> (optional)</span>
        )}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-sm text-white/55">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-[#ff6b6b]">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckoutDetailsForm({
  values,
  errors,
  onChange,
  onSubmit,
}: {
  values: CheckoutDetails;
  errors: CheckoutErrors;
  onChange: <K extends keyof CheckoutDetails>(field: K, value: CheckoutDetails[K]) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const errorProps = (field: keyof CheckoutDetails) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });

  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={onSubmit} noValidate>
      {errorCount > 0 && (
        <p role="alert" className="mb-5 rounded-lg border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ff6b6b]">
          Please fix {errorCount} {errorCount === 1 ? "field" : "fields"} below before
          continuing.
        </p>
      )}

      <fieldset>
        <legend className="text-xl font-bold uppercase text-white">Contact</legend>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="fullName" label="Full Name" required error={errors.fullName}>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={values.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              className={fieldClass}
              {...errorProps("fullName")}
            />
          </Field>

          <Field id="organization" label="Team / Organization" error={errors.organization}>
            <input
              id="organization"
              type="text"
              autoComplete="organization"
              value={values.organization}
              onChange={(e) => onChange("organization", e.target.value)}
              className={fieldClass}
            />
          </Field>

          <Field id="email" label="Email Address" required error={errors.email}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
              className={fieldClass}
              {...errorProps("email")}
            />
          </Field>

          <Field id="phone" label="Phone Number" required error={errors.phone}>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className={fieldClass}
              {...errorProps("phone")}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="text-xl font-bold uppercase text-white">Delivery Address</legend>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="address1" label="Street Address" required error={errors.address1}>
              <input
                id="address1"
                type="text"
                autoComplete="address-line1"
                value={values.address1}
                onChange={(e) => onChange("address1", e.target.value)}
                className={fieldClass}
                {...errorProps("address1")}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field id="address2" label="Apartment, Suite, Unit" error={errors.address2}>
              <input
                id="address2"
                type="text"
                autoComplete="address-line2"
                value={values.address2}
                onChange={(e) => onChange("address2", e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <Field id="country" label="Country" required error={errors.country}>
            <select
              id="country"
              autoComplete="country-name"
              value={values.country}
              onChange={(e) => onChange("country", e.target.value as Country)}
              className={fieldClass}
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </Field>

          <Field id="city" label="City" required error={errors.city}>
            <input
              id="city"
              type="text"
              autoComplete="address-level2"
              value={values.city}
              onChange={(e) => onChange("city", e.target.value)}
              className={fieldClass}
              {...errorProps("city")}
            />
          </Field>

          <Field
            id="region"
            label={regionLabel(values.country)}
            required
            error={errors.region}
          >
            <input
              id="region"
              type="text"
              autoComplete="address-level1"
              value={values.region}
              onChange={(e) => onChange("region", e.target.value)}
              className={fieldClass}
              {...errorProps("region")}
            />
          </Field>

          <Field
            id="postalCode"
            label={postalLabel(values.country)}
            required
            error={errors.postalCode}
          >
            <input
              id="postalCode"
              type="text"
              autoComplete="postal-code"
              value={values.postalCode}
              onChange={(e) => onChange("postalCode", e.target.value)}
              className={fieldClass}
              {...errorProps("postalCode")}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="text-xl font-bold uppercase text-white">Order Details</legend>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Field
            id="neededBy"
            label="Needed By"
            error={errors.neededBy}
            hint="Tell us your deadline and we will confirm whether it is achievable."
          >
            <input
              id="neededBy"
              type="date"
              value={values.neededBy}
              onChange={(e) => onChange("neededBy", e.target.value)}
              className={fieldClass}
              {...errorProps("neededBy")}
            />
          </Field>

          <Field
            id="notes"
            label="Notes"
            error={errors.notes}
            hint="Sizes breakdown, player names and numbers, colour matching, anything else."
          >
            <textarea
              id="notes"
              rows={4}
              value={values.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              className={`${fieldClass} leading-normal`}
            />
          </Field>
        </div>
      </fieldset>

      <div className="mt-6">
        <label htmlFor="acceptedTerms" className="flex items-start gap-3 text-base text-white">
          <input
            id="acceptedTerms"
            type="checkbox"
            checked={values.acceptedTerms}
            onChange={(e) => onChange("acceptedTerms", e.target.checked)}
            className="mt-1.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]"
            {...errorProps("acceptedTerms")}
          />
          <span>
            I agree to the{" "}
            <Link href="/terms-of-service" className="text-primary underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="text-primary underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.acceptedTerms && (
          <p id="acceptedTerms-error" role="alert" className="mt-1 text-sm text-[#ff6b6b]">
            {errors.acceptedTerms}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-primary px-8 py-3 text-base text-primary-foreground transition-colors duration-300 hover:bg-[#029b36]"
        >
          Continue to Review
        </button>
        <Link
          href="/cart"
          className="rounded-lg border border-primary px-6 py-3 text-base text-white transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
        >
          Back to Cart
        </Link>
      </div>
    </form>
  );
}
