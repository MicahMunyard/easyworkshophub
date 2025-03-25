
import { format } from "date-fns";

export const formatDate = (dateString: string) => {
  try {
    // Check if the date is in ISO format or YYYY-MM-DD format
    const date = dateString.includes('T') 
      ? new Date(dateString) 
      : new Date(dateString + 'T00:00:00');
      
    return format(date, 'MMM d, yyyy');
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString; // Return original string if format fails
  }
};
