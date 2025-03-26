
/**
 * Date utility functions for email integration
 */

/**
 * Get the next occurrence of a specific weekday
 * @param dayIndex Day index (0 = Sunday, 1 = Monday, etc.)
 * @returns ISO date string
 */
export const getNextWeekday = (dayIndex: number): string => {
  const today = new Date();
  const todayDay = today.getDay();
  const daysUntilNext = (dayIndex + 7 - todayDay) % 7;
  const nextDate = new Date();
  nextDate.setDate(today.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext));
  return nextDate.toISOString().split('T')[0];
};

/**
 * Get tomorrow's date
 * @returns ISO date string
 */
export const getTomorrow = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

/**
 * Get today's date
 * @returns ISO date string
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Maps text representations of dates to actual date strings
 * @returns Record of date mappings
 */
export const getDateMappings = (): Record<string, string> => {
  return {
    "Monday": getNextWeekday(1),
    "Tuesday": getNextWeekday(2),
    "Wednesday": getNextWeekday(3),
    "Thursday": getNextWeekday(4),
    "Friday": getNextWeekday(5),
    "Saturday": getNextWeekday(6),
    "Sunday": getNextWeekday(0),
    "Tomorrow": getTomorrow(),
    "Today": getTodayDate()
  };
};
