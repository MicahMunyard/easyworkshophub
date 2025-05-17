
import type { EmailRecipient } from "@/components/email-marketing/types";

/**
 * Normalizes different recipient formats into a standard EmailRecipient object or array
 * @param recipient Could be string, EmailRecipient object, or arrays of either
 * @returns Normalized EmailRecipient object or array of objects
 */
export const normalizeRecipient = (
  recipient: string | string[] | EmailRecipient | EmailRecipient[]
): EmailRecipient | EmailRecipient[] => {
  // Case 1: Single string email
  if (typeof recipient === 'string') {
    return {
      email: recipient,
      name: recipient.split('@')[0] // Simple name extraction from email
    };
  }
  
  // Case 2: Single EmailRecipient object
  if (typeof recipient === 'object' && !Array.isArray(recipient) && recipient.email) {
    return recipient;
  }
  
  // Case 3: Array of strings or EmailRecipient objects
  if (Array.isArray(recipient)) {
    return recipient.map(item => {
      if (typeof item === 'string') {
        return {
          email: item,
          name: item.split('@')[0]
        };
      }
      return item;
    });
  }
  
  // Default fallback
  console.error('Invalid recipient format:', recipient);
  if (typeof recipient === 'object' && recipient !== null) {
    return {
      email: 'unknown@example.com',
      name: 'Unknown Recipient'
    };
  }
  
  throw new Error('Invalid recipient format');
};

/**
 * Formats an email address with name if available
 * @param recipient The email recipient
 * @returns Formatted email string like "Name <email@example.com>"
 */
export const formatEmailAddress = (recipient: EmailRecipient): string => {
  if (recipient.name) {
    return `${recipient.name} <${recipient.email}>`;
  }
  return recipient.email;
};

/**
 * Validates an email address format
 * @param email Email address to validate
 * @returns Boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};
