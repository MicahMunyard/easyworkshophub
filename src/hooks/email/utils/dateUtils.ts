
import { parse, isValid } from 'date-fns';

/**
 * Parse a date from an email in various formats
 * @param dateString The date string to parse
 * @returns ISO string date or null if parsing fails
 */
export const parseEmailDate = (dateString: string | null): string | null => {
  if (!dateString) return null;
  
  // Try to handle common date formats and expressions
  
  // Try date-fns parsing for common formats
  const formats = [
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'MMMM d, yyyy',
    'MMMM d yyyy',
    'MMM d, yyyy',
    'MMM d yyyy',
    'd MMMM yyyy',
    'EEEE, MMMM d',
    'EEEE, MMM d',
  ];
  
  // Today, tomorrow, etc.
  if (dateString.toLowerCase().includes('today')) {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  
  if (dateString.toLowerCase().includes('tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  // Next weekday (e.g. "next Monday")
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const lowercaseDate = dateString.toLowerCase();
  
  for (let i = 0; i < weekdays.length; i++) {
    if (lowercaseDate.includes(`next ${weekdays[i]}`)) {
      const today = new Date();
      const currentDay = today.getDay();
      let daysUntilNextDay = i - currentDay;
      
      if (daysUntilNextDay <= 0) {
        daysUntilNextDay += 7;
      }
      
      const nextDay = new Date();
      nextDay.setDate(today.getDate() + daysUntilNextDay);
      return nextDay.toISOString().split('T')[0];
    }
  }
  
  // Try standard format parsing
  for (const format of formats) {
    try {
      const date = parse(dateString, format, new Date());
      if (isValid(date)) {
        return date.toISOString().split('T')[0];
      }
    } catch {
      // Continue trying other formats
    }
  }
  
  // If all else fails, return null
  return null;
};
