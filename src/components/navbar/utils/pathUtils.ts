
export const getCurrentTabFromPath = (currentPath: string): string => {
  if (currentPath === '/') return 'dashboard';
  if (currentPath === '/workshop' || currentPath.includes('/booking-diary') || currentPath.includes('/jobs') || currentPath.includes('/workshop-setup')) return 'workshop';
  if (currentPath.includes('/email-integration')) return 'email';
  if (currentPath.includes('/inventory') || currentPath.includes('/suppliers')) return 'inventory';
  if (currentPath.includes('/customers')) return 'customers';
  if (currentPath.includes('/marketing') || currentPath.includes('/email-marketing') || currentPath.includes('/reviews')) return 'marketing';
  if (currentPath.includes('/reports')) return 'reports';
  return 'dashboard';
};
