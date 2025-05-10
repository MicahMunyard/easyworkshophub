
/**
 * Utility functions for SendGrid integration
 */

/**
 * Generate a workshop email address from workshop name
 * Format: workshopname@workshopbase.com.au
 */
export function generateWorkshopEmail(workshopName: string): string {
  // Convert the workshop name to a suitable format for email
  const emailPrefix = workshopName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters and spaces
    .trim();
  
  return `${emailPrefix}@workshopbase.com.au`;
}

/**
 * Validates an email address format
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Format a display name and email into proper format
 */
export function formatNameEmail(name: string, email: string): string {
  return name ? `${name} <${email}>` : email;
}
