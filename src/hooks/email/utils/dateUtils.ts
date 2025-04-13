
export const getDateMappings = (): Record<string, string> => {
  const today = new Date();
  
  // Helper to format a date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  // Get date for a specific day of the current week
  const getDayThisWeek = (dayName: string): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = today.getDay(); // 0-6, 0 is Sunday
    const targetDay = days.indexOf(dayName.toLowerCase());
    
    if (targetDay === -1) return ''; // Invalid day name
    
    const daysToAdd = (targetDay - currentDay + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    
    return formatDate(targetDate);
  };
  
  // Get date for a specific day of next week
  const getDayNextWeek = (dayName: string): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = today.getDay(); // 0-6, 0 is Sunday
    const targetDay = days.indexOf(dayName.toLowerCase());
    
    if (targetDay === -1) return ''; // Invalid day name
    
    const daysToAdd = (targetDay - currentDay + 7) % 7 + 7; // Add an extra week
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    
    return formatDate(targetDate);
  };
  
  // Generate date mappings
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);
  
  // Date for "in X days"
  const getDateInDays = (days: number): string => {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    return formatDate(futureDate);
  };
  
  // Create mappings
  const dateMap: Record<string, string> = {
    'today': formatDate(today),
    'tomorrow': formatDate(tomorrow),
    'day after tomorrow': formatDate(dayAfterTomorrow),
    
    // This week's days
    'this monday': getDayThisWeek('monday'),
    'this tuesday': getDayThisWeek('tuesday'),
    'this wednesday': getDayThisWeek('wednesday'),
    'this thursday': getDayThisWeek('thursday'),
    'this friday': getDayThisWeek('friday'),
    'this saturday': getDayThisWeek('saturday'),
    'this sunday': getDayThisWeek('sunday'),
    
    // Next week's days
    'next monday': getDayNextWeek('monday'),
    'next tuesday': getDayNextWeek('tuesday'),
    'next wednesday': getDayNextWeek('wednesday'),
    'next thursday': getDayNextWeek('thursday'),
    'next friday': getDayNextWeek('friday'),
    'next saturday': getDayNextWeek('saturday'),
    'next sunday': getDayNextWeek('sunday'),
    
    // Just the day names (interpret as this week or next week)
    'monday': getDayThisWeek('monday'),
    'tuesday': getDayThisWeek('tuesday'),
    'wednesday': getDayThisWeek('wednesday'),
    'thursday': getDayThisWeek('thursday'),
    'friday': getDayThisWeek('friday'),
    'saturday': getDayThisWeek('saturday'),
    'sunday': getDayThisWeek('sunday')
  };
  
  // Add "in X days" mappings
  for (let i = 1; i <= 14; i++) {
    dateMap[`in ${i} day${i > 1 ? 's' : ''}`] = getDateInDays(i);
  }
  
  return dateMap;
};

// Function to try to parse a date string into a standard format
export const parseEmailDate = (dateStr: string | null): string | null => {
  if (!dateStr) return null;
  
  // Try direct mapping first
  const dateMap = getDateMappings();
  const lowerDateStr = dateStr.toLowerCase().trim();
  
  if (dateMap[lowerDateStr]) {
    return dateMap[lowerDateStr];
  }
  
  // Try to handle dates in various formats
  try {
    // Check if it's already a valid date format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr; // Already in YYYY-MM-DD format
    }
    
    // Try parsing MM/DD/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    }
    
    // Try parsing as a JavaScript Date
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    // If all else fails, return the original string
    return dateStr;
  } catch (e) {
    console.error("Error parsing date:", e);
    return dateStr;
  }
};
