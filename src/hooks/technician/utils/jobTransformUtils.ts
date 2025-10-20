
import { TechnicianJob, JobStatus, JobNote } from "@/types/technician";

// NOTE: The old jobs table is being deprecated in favor of user_bookings
// This function is no longer needed but kept for reference during migration

/**
 * Transform bookings data from the user_bookings table to match TechnicianJob interface
 * This is now the primary data source for all jobs
 */
export const transformBookingsData = (bookingsData: any[]): TechnicianJob[] => {
  if (!bookingsData || bookingsData.length === 0) {
    return [];
  }
  
  console.log(`Found ${bookingsData.length} bookings in user_bookings table`);
  
  return bookingsData.map(booking => {
    // Create a default JobNote structure for the booking notes
    const notesArray: JobNote[] = booking.notes 
      ? [{
          id: `note-${booking.id}`,
          content: booking.notes,
          created_at: booking.created_at || new Date().toISOString(),
          created_by: 'System'
        }] 
      : [];
      
    // Map booking status to our job status format
    let status: JobStatus = booking.status as JobStatus;
    
    const transformedJob: TechnicianJob = {
      id: booking.id,
      title: booking.service || 'Unnamed Booking',
      description: `Customer: ${booking.customer_name || 'Unknown'}, Vehicle: ${booking.car || 'Unknown'}`,
      customer: booking.customer_name || 'Unknown',
      vehicle: booking.car || 'Unknown',
      service: booking.service || 'General Service',
      status: status,
      assignedTo: booking.created_at || new Date().toISOString(),
      scheduledFor: booking.booking_date || null,
      estimatedTime: booking.time_estimate || (booking.duration ? `${booking.duration} minutes` : 'Not specified'),
      priority: booking.priority || 'Medium',
      partsRequested: [],
      photos: [],
      notes: notesArray,
      isActive: false,
      timeLogged: booking.total_time || 0,
      date: booking.booking_date || new Date().toISOString(),
      technicianId: booking.technician_id || null
    };
    
    return transformedJob;
  });
};
