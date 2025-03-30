
import React from "react";
import { Conversation } from "@/types/communication";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Facebook, Instagram, MessageCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import CustomerBookingForm from "./CustomerBookingForm";

interface ContactPanelProps {
  conversation: Conversation | null;
  addToCustomers: () => void;
}

const ContactPanel: React.FC<ContactPanelProps> = ({
  conversation,
  addToCustomers
}) => {
  const [showBookingForm, setShowBookingForm] = React.useState(false);
  const navigate = useNavigate();
  
  if (!conversation) {
    return (
      <Card className="h-full flex flex-col justify-center items-center p-4 text-center text-muted-foreground">
        <User className="h-8 w-8 mb-2 opacity-40" />
        <p>Select a conversation to view contact details</p>
      </Card>
    );
  }
  
  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'Facebook';
      case 'instagram': return 'Instagram';
      case 'tiktok': return 'TikTok';
      default: return 'Other';
    }
  };
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'tiktok':
        return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.97 2.29a4.5 4.5 0 0 1-.88 1.74c-.14.2-.5.3-.5.3v1.73c.26 0 .94-.39.94-.39v4.33a3.5 3.5 0 0 1-6.07 2.4 3.5 3.5 0 0 1 5.1-4.78V4.96A6.04 6.04 0 0 0 12 6.45V3.62c-.22-.14-.7-.5-.7-.5a3.45 3.45 0 0 0 1.36-2.15h-2.26a11.72 11.72 0 0 1 .57 1.32Z" fill="#FF004F"/>
        </svg>;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader className="text-left">
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          View and manage this contact
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Contact Header */}
        <div className="flex flex-col items-center text-center p-2">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src={conversation.profile_picture_url} alt={conversation.contact_name} />
            <AvatarFallback className="text-xl">{getInitials(conversation.contact_name)}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">{conversation.contact_name}</h2>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            {getPlatformIcon(conversation.platform)}
            <span>{getPlatformName(conversation.platform)} contact</span>
          </div>
          {conversation.contact_handle && (
            <p className="text-sm mt-1">@{conversation.contact_handle}</p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button onClick={addToCustomers} variant="outline" className="w-full justify-start">
            <User className="mr-2 h-4 w-4" />
            Add to Customers
          </Button>
          <Button 
            onClick={() => setShowBookingForm(true)} 
            className="w-full justify-start"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Book Appointment
          </Button>
        </div>
        
        {/* Booking Form */}
        {showBookingForm && (
          <div className="mt-2 border rounded-md p-4">
            <h3 className="font-medium mb-4">Book an Appointment</h3>
            <CustomerBookingForm 
              customerName={conversation.contact_name}
              customerPhone={conversation.contact_handle || ""}
              onBooked={() => {
                setShowBookingForm(false);
                navigate("/booking-diary");
              }}
              onCancel={() => setShowBookingForm(false)}
            />
          </div>
        )}
        
        {/* Contact Details */}
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-3">Contact Details</h3>
          <dl className="space-y-2">
            <div className="flex items-start gap-2">
              <dt className="text-muted-foreground min-w-[100px]">Platform:</dt>
              <dd className="flex items-center">
                {getPlatformIcon(conversation.platform)}
                <span className="ml-1">{getPlatformName(conversation.platform)}</span>
              </dd>
            </div>
            <div className="flex items-start gap-2">
              <dt className="text-muted-foreground min-w-[100px]">First Contact:</dt>
              <dd>{formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}</dd>
            </div>
            <div className="flex items-start gap-2">
              <dt className="text-muted-foreground min-w-[100px]">Last Message:</dt>
              <dd>{formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}</dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactPanel;
