export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  interestedIn: string;
  message: string;
}

/**
 * Single seam for contact-form delivery.
 *
 * No email provider is wired up yet. When one is added, POST to a Next.js Route
 * Handler (e.g. `/api/contact`) from here and keep the provider credentials in
 * server-side environment variables — never in `NEXT_PUBLIC_*`, which ships to
 * the browser. The rest of the form (validation, loading, success and error
 * states) already works against this contract.
 */
export async function submitContactForm(values: ContactFormValues): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

  if (!endpoint) {
    // No provider configured: resolve so the UI can show its success state.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error(`Contact form submission failed with status ${response.status}`);
  }
}
