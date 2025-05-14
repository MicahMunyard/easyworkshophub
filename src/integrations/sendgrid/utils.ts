
/**
 * Generate a dynamic workshop email address
 * @param workshopName Name of the workshop
 * @returns Email address for the workshop
 */
export function generateWorkshopEmail(workshopName: string): string {
  if (!workshopName) {
    return 'workshop@workshopbase.com.au';
  }
  
  // Normalize and sanitize the workshop name for email
  const emailPrefix = workshopName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
    
  // Use the sanitized name or a fallback
  return `${emailPrefix || 'workshop'}@workshopbase.com.au`;
}

/**
 * Format recipient for SendGrid API
 * @param recipient Email recipient as string or object
 * @returns Properly formatted recipient object
 */
export function formatRecipient(recipient: string | { email: string; name?: string }): { email: string; name?: string } {
  if (typeof recipient === 'string') {
    return { email: recipient };
  }
  
  if (recipient && typeof recipient === 'object' && 'email' in recipient) {
    return recipient;
  }
  
  throw new Error('Invalid recipient format');
}

/**
 * Format multiple recipients for SendGrid API
 * @param recipients Array of recipients or single recipient
 * @returns Array of properly formatted recipient objects
 */
export function formatRecipients(
  recipients: string | { email: string; name?: string } | Array<string | { email: string; name?: string }>
): Array<{ email: string; name?: string }> {
  if (!recipients) {
    throw new Error('Recipients are required');
  }
  
  const recipientsArray = Array.isArray(recipients) ? recipients : [recipients];
  
  return recipientsArray.map(recipient => formatRecipient(recipient));
}
