"use client";

import { useState } from "react";
import { siteConfig } from "@/data/site";
import { submitContactForm, type ContactFormValues } from "@/lib/contact";

type Status = "idle" | "submitting" | "success" | "error";

type Errors = Partial<Record<keyof ContactFormValues, string>>;

const emptyValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  interestedIn: siteConfig.interestedInOptions[0],
  message: "",
};

const fieldClass =
  "w-full rounded-lg bg-input px-4 py-2 text-base leading-8 text-black outline-none focus-visible:outline-2 focus-visible:outline-primary";

const labelClass = "block text-lg leading-8 text-secondary";

function validate(values: ContactFormValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Please enter your full name.";
  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!values.message.trim()) errors.message = "Please enter a message.";
  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(emptyValues);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  function update<K extends keyof ContactFormValues>(field: K, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("idle");
      return;
    }

    setStatus("submitting");
    try {
      await submitContactForm(values);
      setStatus("success");
      setValues(emptyValues);
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className={labelClass}>
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={fieldClass}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="mt-1 text-sm text-[#ff6b6b]">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={fieldClass}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="mt-1 text-sm text-[#ff6b6b]">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(event) => update("phone", event.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="interestedIn" className={labelClass}>
          Interested In
        </label>
        <select
          id="interestedIn"
          name="interestedIn"
          value={values.interestedIn}
          onChange={(event) => update("interestedIn", event.target.value)}
          className={fieldClass}
        >
          {siteConfig.interestedInOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`${fieldClass} resize-y leading-normal`}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="mt-1 text-sm text-[#ff6b6b]">
            {errors.message}
          </p>
        )}
      </div>

      <div className="mt-2 sm:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-lg bg-primary px-6 py-3 text-base text-primary-foreground transition-colors duration-300 hover:bg-[#029b36] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "submitting" ? "Sending…" : "Send Message"}
        </button>
      </div>

      <p aria-live="polite" className="min-h-6 text-base sm:col-span-2">
        {status === "success" && (
          <span className="text-primary">
            Thanks — your message has been sent. We&apos;ll get back to you shortly.
          </span>
        )}
        {status === "error" && (
          <span className="text-[#ff6b6b]">
            Something went wrong sending your message. Please email us at {siteConfig.email}.
          </span>
        )}
      </p>
    </form>
  );
}
