
import { TechnicianJob, JobStatus, JobNote } from "@/types/technician";

/**
 * Transform jobs data from the jobs table to match TechnicianJob interface
 */
export const transformJobsData = (jobsData: any[]): TechnicianJob[] => {
  if (jobsData.length === 0) {
    return [];
  }
  
  console.log(`Found ${jobsData.length} jobs in jobs table`);
  
  return jobsData.map(job => ({
    id: job.id,
    title: job.service,
    description: `Customer: ${job.customer}, Vehicle: ${job.vehicle}`,
    customer: job.customer,
    vehicle: job.vehicle,
    status: job.status as JobStatus,
    assignedAt: job.created_at,
    scheduledFor: job.date,
    estimatedTime: job.time_estimate,
    priority: job.priority,
    timeLogged: 0, // We'll need to calculate this from a separate time logs table
    partsRequested: [], // We'll need to fetch this from a separate parts requests table
    photos: [], // We'll need to fetch this from storage
    notes: [],
    isActive: false
  }));
};

/**
 * Transform bookings data from the user_bookings table to match TechnicianJob interface
 */
export const transformBookingsData = (bookingsData: any[]): TechnicianJob[] => {
  if (bookingsData.length === 0) {
    return [];
  }
  
  console.log(`Found ${bookingsData.length} bookings in user_bookings table`);
  
  return bookingsData.map(booking => {
    // Create a default JobNote structure for the booking notes
    const notesArray: JobNote[] = booking.notes 
      ? [{
          id: `note-${booking.id}`,
          content: booking.notes,
          created_at: booking.created_at,
          author: 'System'
        }] 
      : [];
      
    return {
      id: booking.id,
      title: booking.service,
      description: `Customer: ${booking.customer_name}, Vehicle: ${booking.car}`,
      customer: booking.customer_name,
      vehicle: booking.car,
      status: (booking.status === 'confirmed' ? 'pending' : 
              booking.status === 'completed' ? 'completed' : 
              booking.status === 'cancelled' ? 'cancelled' : 'pending') as JobStatus,
      assignedAt: booking.created_at,
      scheduledFor: booking.booking_date,
      estimatedTime: `${booking.duration} minutes`,
      priority: 'Medium', // Default priority
      timeLogged: 0,
      partsRequested: [],
      photos: [],
      notes: notesArray,
      isActive: false
    };
  });
};
