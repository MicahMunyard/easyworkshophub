
import { TechnicianJob } from "@/types/technician";

/**
 * Load jobs from localStorage if available
 */
export const loadCachedJobs = (storageKey: string): TechnicianJob[] => {
  try {
    const cachedData = localStorage.getItem(storageKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      console.log("Loaded cached jobs:", parsedData);
      return parsedData;
    }
  } catch (e) {
    console.error('Error loading cached jobs:', e);
  }
  return [];
};

/**
 * Save jobs to localStorage
 */
export const cacheJobs = (storageKey: string, jobs: TechnicianJob[]): void => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(jobs));
    console.log("Cached jobs to localStorage:", jobs);
  } catch (e) {
    console.error('Error caching jobs:', e);
  }
};
