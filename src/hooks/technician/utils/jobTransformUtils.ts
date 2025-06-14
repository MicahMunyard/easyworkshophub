
import { TechnicianJob, JobStatus, JobNote } from "@/types/technician";

/**
 * Transform jobs data from the jobs table to match TechnicianJob interface
 */
export const transformJobsData = (jobsData: any[]): TechnicianJob[] => {
  if (!jobsData || jobsData.length === 0) {
    return [];
  }
  
  console.log(`Found ${jobsData.length} jobs in jobs table`);
  
  return jobsData.map(job => {
    // Create a more robust job object with explicit typing
    const transformedJob: TechnicianJob = {
      id: job.id,
      title: job.service || 'Unnamed Job',
      description: `Customer: ${job.customer || 'Unknown'}, Vehicle: ${job.vehicle || 'Unknown'}`,
      customer: job.customer || 'Unknown',
      vehicle: job.vehicle || 'Unknown',
      service: job.service || 'General Service',
      status: (job.status as JobStatus) || 'pending',
      assignedTo: job.created_at || new Date().toISOString(),
      scheduledFor: job.date || null,
      estimatedTime: job.time_estimate || 'Not specified',
      priority: job.priority || 'Medium',
      partsRequested: job.parts_requested || [],
      photos: job.photos || [],
      notes: job.notes || [],
      isActive: false,
      timeLogged: job.total_time || 0,
      date: job.date || new Date().toISOString(),
      technicianId: job.assigned_to || null
    };
    
    return transformedJob;
  });
};

/**
 * Transform bookings data from the user_bookings table to match TechnicianJob interface
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
    let status: JobStatus = 'pending';
    if (booking.status === 'confirmed') status = 'pending';
    else if (booking.status === 'completed') status = 'completed';
    else if (booking.status === 'cancelled') status = 'cancelled';
    
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
      estimatedTime: booking.duration ? `${booking.duration} minutes` : 'Not specified',
      priority: 'Medium',
      partsRequested: [],
      photos: [],
      notes: notesArray,
      isActive: false,
      timeLogged: 0,
      date: booking.booking_date || new Date().toISOString(),
      technicianId: booking.technician_id || null
    };
    
    return transformedJob;
  });
};
