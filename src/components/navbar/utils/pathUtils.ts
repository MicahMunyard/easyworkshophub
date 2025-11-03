
export const getCurrentTabFromPath = (currentPath: string): string => {
  if (currentPath === '/') return 'dashboard';
  if (currentPath.includes('/booking-diary') || currentPath.includes('/jobs')) return 'bookings';
  if (currentPath.includes('/invoicing')) return 'invoicing';
  if (currentPath.includes('/email-integration')) return 'email';
  if (currentPath.includes('/communication')) return 'communication';
  if (currentPath.includes('/inventory') || currentPath.includes('/suppliers')) return 'inventory';
  if (currentPath.includes('/customers')) return 'customers';
  if (currentPath.includes('/marketing') || currentPath.includes('/email-marketing') || currentPath.includes('/reviews')) return 'marketing';
  if (currentPath.includes('/reports')) return 'reports';
  if (currentPath.includes('/timesheets')) return 'timesheets';
  if (currentPath.includes('/workshop-setup')) return 'workshop';
  return 'dashboard';
};
