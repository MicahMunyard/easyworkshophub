
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create authenticated Supabase client using the auth header
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the user from the auth header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request data if available
    let requestData = {};
    if (req.method === "POST") {
      try {
        requestData = await req.json();
      } catch (error) {
        // If request body parsing fails, continue with empty data
        console.error("Failed to parse request body:", error);
      }
    }

    const { action, emailId, to, subject, body } = requestData as any;

    // Extract the path to determine specific operations
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // GET /email-integration/connect - Connect to email account
    if (path === "connect") {
      // This would connect to the external email service
      // For now, we'll just simulate a successful connection
      
      // In a real implementation, you would:
      // 1. Call your Node.js email service to set up the connection
      // 2. Store encrypted credentials securely
      // 3. Return proper status and errors
      
      console.log("Processing email connection request");
      
      // Get request data
      const { provider = "gmail", email = "" } = requestData as any;
      
      // Log the connection request for debugging
      console.log(`Simulating email connection for: ${email} using provider: ${provider}`);
      
      // Update the connection status in the database
      const { error: updateError } = await supabaseClient
        .from('email_connections')
        .update({
          status: 'connected',
          connected_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
        
      if (updateError) {
        console.error("Error updating connection status:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update connection status" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, message: "Email connection simulated successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // GET /email-integration/disconnect - Disconnect from email account
    if (path === "disconnect") {
      // This would disconnect from the external email service
      
      // Update the connection status in the database
      const { error: updateError } = await supabaseClient
        .from('email_connections')
        .update({
          status: 'disconnected',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to update disconnection status" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, message: "Email disconnected successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle specific actions
    if (action === "create-booking" && emailId) {
      // This would call your email service to create a booking
      console.log(`Creating booking from email ID: ${emailId}`);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample booking creation (simulated)
      const bookingId = `booking-${Math.floor(Math.random() * 1000000)}`;
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          bookingId,
          message: "Booking created successfully (simulated)" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "send-email" && to && subject && body) {
      // This would call your email service to send an email
      console.log(`Sending email to: ${to}`);
      console.log(`Subject: ${subject}`);
      
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email sent successfully (simulated)" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default action: Fetch emails
    // In production, this would call your Node.js service to get real emails
    // For now, generate mock emails
    const mockEmails = generateMockEmails(10);
    
    return new Response(
      JSON.stringify({ emails: mockEmails }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in email integration:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to generate mock emails for testing
function generateMockEmails(count: number) {
  const emails = [];
  const subjects = [
    "Booking request for oil change",
    "Need my car serviced next week",
    "Appointment inquiry for brake repair",
    "Car maintenance needed ASAP",
    "Tire rotation and alignment request",
    "Engine check - strange noise",
    "Regular servicing for Toyota Corolla",
    "Urgent - Car won't start",
    "Looking to book a service appointment",
    "Question about service packages"
  ];
  
  const senders = [
    { name: "John Smith", email: "john.smith@example.com" },
    { name: "Emma Johnson", email: "emma.j@example.com" },
    { name: "Michael Brown", email: "m.brown@example.com" },
    { name: "Sarah Wilson", email: "sarahw@example.com" },
    { name: "David Lee", email: "david.lee@example.com" }
  ];
  
  const vehicles = [
    "Toyota Corolla (2018)",
    "Honda Civic (2019)",
    "Ford F-150 (2020)",
    "Hyundai Elantra (2017)",
    "BMW 3 Series (2021)"
  ];
  
  const dates = [
    "next Monday",
    "January 20th",
    "this weekend",
    "tomorrow at 2pm",
    "next Tuesday afternoon"
  ];
  
  const contents = [
    `Hi, I need to get my car serviced. Can you fit me in for an oil change and general check-up? I'm free most weekdays after 3pm. Thanks!`,
    `Hello, my car is making a strange noise when I brake. I think I need to get the brakes checked. Do you have any appointments available this week?`,
    `Good morning, I'd like to schedule a regular maintenance for my vehicle. It's been about 10,000 miles since the last service. Please let me know what times you have available.`,
    `I need to get my tires rotated and balanced. Also, could you check the alignment? The car seems to pull slightly to the left. I'm available any day next week.`,
    `My car battery died yesterday and I had to get a jump. I think it's time for a replacement. Do you sell and install batteries? What would be the cost for my vehicle?`
  ];
  
  for (let i = 0; i < count; i++) {
    const senderIndex = i % senders.length;
    const contentIndex = i % contents.length;
    const vehicleIndex = i % vehicles.length;
    const dateIndex = i % dates.length;
    
    const isBookingEmail = i % 3 === 0; // Make every third email a booking request
    const bookingCreated = i === 0; // Mark the first email as having had a booking created
    
    const email = {
      id: `email-${i + 1}`,
      subject: subjects[i % subjects.length],
      from: senders[senderIndex].name,
      sender_email: senders[senderIndex].email,
      date: new Date(Date.now() - (i * 86400000)).toISOString(), // Each email one day older
      content: `<p>${contents[contentIndex]}</p>`,
      is_booking_email: isBookingEmail,
      booking_created: bookingCreated,
      processing_status: bookingCreated ? 'completed' : (i === 1 ? 'failed' : 'pending')
    };
    
    // Add extracted details for booking emails
    if (isBookingEmail) {
      email.extracted_details = {
        name: senders[senderIndex].name,
        phone: `(555) ${100 + i}-${1000 + i}`,
        date: dates[dateIndex],
        time: i % 2 === 0 ? '10:00 AM' : '2:30 PM',
        service: i % 2 === 0 ? 'Oil Change' : 'Brake Inspection',
        vehicle: vehicles[vehicleIndex]
      };
    }
    
    emails.push(email);
  }
  
  return emails;
}
