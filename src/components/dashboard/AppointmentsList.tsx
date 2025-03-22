
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Car, Wrench, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppointmentProps {
  time: string;
  customer: string;
  service: string;
  car: string;
}

interface AppointmentsListProps {
  user: any;
  isLoading: boolean;
  appointments: AppointmentProps[];
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ 
  user, 
  isLoading, 
  appointments 
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full h-full overflow-hidden performance-card">
      <CardHeader className="p-4 pb-2 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-workshop-red" />
            Upcoming Appointments
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm gap-1 hover:text-workshop-red"
            onClick={() => navigate("/booking-diary")}
          >
            View All <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {!user ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">Sign in to view your upcoming appointments</p>
            </div>
          ) : isLoading ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">Loading appointments...</p>
            </div>
          ) : appointments.length > 0 ? (
            appointments.map((appointment, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between group hover:bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-workshop-red/10 text-workshop-red flex items-center justify-center font-medium text-sm">
                    {appointment.time.split(" ")[0]}
                  </div>
                  <div>
                    <div className="font-medium">{appointment.customer}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Car className="h-3 w-3 mr-1" /> {appointment.car} • <Wrench className="h-3 w-3 mx-1" /> {appointment.service}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-workshop-red hover:text-white">
                  Details
                </Button>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No upcoming appointments</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => navigate("/booking-diary")}
              >
                Schedule an appointment
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentsList;
