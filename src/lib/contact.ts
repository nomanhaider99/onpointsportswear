export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  interestedIn: string;
  message: string;
}

export async function submitContactForm(values: ContactFormValues): Promise<void> {
  const { store } = await import("@/store/store");
  const { submitContact } = await import("@/store/features/contact/contactSlice");
  const result = await store.dispatch(submitContact(values));
  if (submitContact.rejected.match(result)) {
    throw new Error(String(result.payload || "Contact form submission failed"));
  }
}
