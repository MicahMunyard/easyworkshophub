
import { TechnicianJob } from "@/types/technician";

/**
 * Load jobs from localStorage if available
 */
export const loadCachedJobs = (storageKey: string): TechnicianJob[] => {
  try {
    const cachedData = localStorage.getItem(storageKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      console.log("Loaded cached jobs:", parsedData.length);
      
      // Validate the cached data structure to ensure it's compatible
      if (Array.isArray(parsedData) && parsedData.length > 0 && 
          parsedData[0].hasOwnProperty('id') && 
          parsedData[0].hasOwnProperty('status')) {
        return parsedData;
      } else {
        console.warn("Cached jobs data format is invalid, ignoring cache");
        return [];
      }
    }
  } catch (e) {
    console.error('Error loading cached jobs:', e);
    // If there's an error with the cache, clear it to prevent future issues
    try {
      localStorage.removeItem(storageKey);
    } catch (clearError) {
      console.error('Error clearing corrupted cache:', clearError);
    }
  }
  return [];
};

/**
 * Save jobs to localStorage
 */
export const cacheJobs = (storageKey: string, jobs: TechnicianJob[]): void => {
  if (!jobs || !Array.isArray(jobs)) {
    console.error('Invalid jobs data, not caching');
    return;
  }
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(jobs));
    console.log(`Cached ${jobs.length} jobs to localStorage`);
  } catch (e) {
    console.error('Error caching jobs:', e);
    
    // If storage is full, try to clear old caches and retry
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      try {
        // Try to remove other storage items that might not be as important
        const keysToPreserve = [storageKey];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && !keysToPreserve.includes(key)) {
            localStorage.removeItem(key);
          }
        }
        
        // Try again with cleared storage
        localStorage.setItem(storageKey, JSON.stringify(jobs));
        console.log('Successfully cached jobs after clearing storage');
      } catch (retryError) {
        console.error('Failed to cache jobs even after clearing storage:', retryError);
      }
    }
  }
};

/**
 * Get the cached timestamp for when jobs were last fetched
 */
export const getLastFetchTime = (storageKey: string): number | null => {
  try {
    const timestamp = localStorage.getItem(`${storageKey}_timestamp`);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (e) {
    console.error('Error getting last fetch time:', e);
    return null;
  }
};

/**
 * Save the timestamp for when jobs were last fetched
 */
export const setLastFetchTime = (storageKey: string): void => {
  try {
    localStorage.setItem(`${storageKey}_timestamp`, Date.now().toString());
  } catch (e) {
    console.error('Error setting last fetch time:', e);
  }
};
