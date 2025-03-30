
import React from "react";
import { Conversation } from "@/types/communication";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Facebook, Instagram, MessageCircle, Phone, Plus, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import CustomerBookingForm from "./CustomerBookingForm";

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  addToCustomers: () => void;
}

const ContactDrawer: React.FC<ContactDrawerProps> = ({
  isOpen,
  onClose,
  conversation,
  addToCustomers
}) => {
  const [showBookingForm, setShowBookingForm] = React.useState(false);
  const navigate = useNavigate();
  
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle>Contact Information</SheetTitle>
          <SheetDescription>
            View and manage this contact
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Contact Header */}
          <div className="flex flex-col items-center text-center p-4">
            <Avatar className="h-24 w-24 mb-4">
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
          <div className="flex gap-2">
            <Button onClick={addToCustomers} className="flex-1" variant="outline">
              <User className="mr-2 h-4 w-4" />
              Add to Customers
            </Button>
            <Button 
              onClick={() => setShowBookingForm(true)} 
              className="flex-1"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </div>
          
          {/* Booking Form */}
          {showBookingForm && (
            <div className="mt-6 border rounded-md p-4">
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ContactDrawer;
