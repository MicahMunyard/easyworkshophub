
/**
 * Parse a date string from an email into a standardized format
 * @param dateString The date string from an email (e.g., "next Monday", "tomorrow", etc.)
 * @returns A standardized date string in YYYY-MM-DD format, or null if parsing failed
 */
export function parseEmailDate(dateString: string | null): string | null {
  if (!dateString) return null;
  
  // Current date as fallback
  const today = new Date();
  
  // Try to match common date formats
  const dateMap = getDateMappings();
  if (dateMap[dateString.toLowerCase()]) {
    return dateMap[dateString.toLowerCase()];
  }
  
  // Try to parse the date string using Date constructor
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    // Parsing failed, continue with other methods
  }
  
  // Handle common relative date expressions
  if (/tomorrow/i.test(dateString)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  if (/next week/i.test(dateString)) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }
  
  // If all parsing attempts fail, return null
  return null;
}

/**
 * Get a mapping of common date expressions to actual dates
 * @returns An object mapping date expressions to ISO date strings
 */
export function getDateMappings(): { [key: string]: string } {
  const today = new Date();
  const dateMap: { [key: string]: string } = {};
  
  // Today
  dateMap['today'] = today.toISOString().split('T')[0];
  
  // Tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateMap['tomorrow'] = tomorrow.toISOString().split('T')[0];
  
  // Days of the week
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = today.getDay();
  
  for (let i = 0; i < daysOfWeek.length; i++) {
    // Calculate days until the target day
    let daysUntil = i - currentDay;
    if (daysUntil <= 0) daysUntil += 7; // If day has passed this week, get next week's date
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntil);
    
    // Add both "next Tuesday" and just "Tuesday" formats
    dateMap[`next ${daysOfWeek[i]}`] = targetDate.toISOString().split('T')[0];
    dateMap[daysOfWeek[i]] = targetDate.toISOString().split('T')[0];
  }
  
  return dateMap;
}
