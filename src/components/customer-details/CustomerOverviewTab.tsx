
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CustomerDetailType } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";

interface CustomerOverviewTabProps {
  customer: CustomerDetailType;
}

const CustomerOverviewTab: React.FC<CustomerOverviewTabProps> = ({ customer }) => {
  const [recentNotes, setRecentNotes] = useState<{ note: string, created_at: string }[]>([]);
  const [isLoading, setIsLoading] = useState({
    notes: true,
    communications: true,
    reminders: true
  });

  useEffect(() => {
    if (customer && customer.id) {
      const fetchNotes = async () => {
        try {
          const customerId = parseInt(customer.id, 10);
          const { data, error } = await supabase
            .from('customer_notes')
            .select('note, created_at')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })
            .limit(3);

          if (error) throw error;
          setRecentNotes(data || []);
        } catch (error) {
          console.error("Error fetching customer notes:", error);
        } finally {
          setIsLoading(prev => ({ ...prev, notes: false }));
        }
      };

      fetchNotes();
    }
  }, [customer.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Overview</CardTitle>
        <CardDescription>Summary of customer information and activity</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h3 className="font-medium">Recent Bookings</h3>
            {customer.bookingHistory && customer.bookingHistory.length > 0 ? (
              <div className="space-y-2">
                {customer.bookingHistory.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="text-sm border-l-2 border-primary pl-2">
                    <div className="font-medium">{booking.service}</div>
                    <div className="text-xs text-muted-foreground">{booking.date}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent bookings</p>
            )}
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h3 className="font-medium">Recent Communications</h3>
            <div id="recent-communications-placeholder">
              <p className="text-sm text-muted-foreground">
                {isLoading.communications ? "Loading communication history..." : "No recent communications"}
              </p>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h3 className="font-medium">Upcoming Reminders</h3>
            <div id="upcoming-reminders-placeholder">
              <p className="text-sm text-muted-foreground">
                {isLoading.reminders ? "Loading service reminders..." : "No upcoming reminders"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
          <h3 className="font-medium">Latest Notes</h3>
          {isLoading.notes ? (
            <p className="text-sm text-muted-foreground">Loading customer notes...</p>
          ) : recentNotes.length > 0 ? (
            <div className="space-y-2">
              {recentNotes.map((note, index) => (
                <div key={index} className="text-sm border-l-2 border-primary pl-2">
                  <div className="text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleDateString()}
                  </div>
                  <div className="font-medium">{note.note.substring(0, 100)}{note.note.length > 100 ? '...' : ''}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No notes available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerOverviewTab;
