
import type { EmailRecipient } from "@/components/email-marketing/types.d";

/**
 * Normalizes different recipient formats into a standard EmailRecipient object or array
 */
export function normalizeRecipient(
  recipient: string | EmailRecipient | Array<string | EmailRecipient>
): EmailRecipient | EmailRecipient[] {
  if (typeof recipient === "string") {
    return { email: recipient };
  } else if (Array.isArray(recipient)) {
    return recipient.map((r) => (typeof r === "string" ? { email: r } : r));
  }
  return recipient;
}

/**
 * Formats recipient for display (e.g. "John Doe <john@example.com>")
 */
export function formatRecipientForDisplay(recipient: EmailRecipient): string {
  if (recipient.name) {
    return `${recipient.name} <${recipient.email}>`;
  }
  return recipient.email;
}

/**
 * Validates an email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Parses a comma-separated list of emails into an array of EmailRecipient objects
 */
export function parseEmailList(emailList: string): EmailRecipient[] {
  return emailList
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email && isValidEmail(email))
    .map((email) => ({ email }));
}

/**
 * Helper to log email operations with consistent formatting
 */
export function logEmailOperation(operation: string, data: any): void {
  console.group(`📧 Email Operation: ${operation}`);
  console.log(JSON.stringify(data, null, 2));
  console.groupEnd();
}
