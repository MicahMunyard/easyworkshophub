
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Review, ReviewRequest } from "./types";

export function useReviews(filters: {
  rating: string;
  platform: string;
  dateRange: string;
  status: string;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
    fetchReviewRequests();
  }, [filters]);

  async function fetchReviews() {
    setIsLoading(true);
    try {
      // For now, we'll use mock data since the actual implementation would require API integration
      const mockReviews: Review[] = [
        {
          id: "1",
          customer_name: "John Smith",
          customer_avatar: "/lovable-uploads/toliccs-logo.png",
          platform: "google",
          rating: 5,
          review_text: "Great service! They fixed my car quickly and at a reasonable price.",
          review_date: "2023-03-15T10:00:00Z",
          platform_review_id: "g12345"
        },
        {
          id: "2",
          customer_name: "Sarah Johnson",
          platform: "facebook",
          rating: 4,
          review_text: "Good service but a bit pricey. Would still recommend.",
          review_date: "2023-03-10T14:30:00Z",
          response_text: "Thank you for your feedback, Sarah! We appreciate your business and hope to serve you again.",
          response_date: "2023-03-11T09:15:00Z",
          platform_review_id: "fb12345"
        },
        {
          id: "3",
          customer_name: "Mike Davis",
          platform: "yelp",
          rating: 3,
          review_text: "Average experience. They did the job but took longer than expected.",
          review_date: "2023-03-05T16:45:00Z",
          platform_review_id: "y12345"
        },
        {
          id: "4",
          customer_name: "Emily Wilson",
          platform: "google",
          rating: 5,
          review_text: "Excellent service! The staff was very friendly and professional.",
          review_date: "2023-02-28T11:20:00Z",
          response_text: "Thanks for the kind words, Emily! We're glad you had a positive experience.",
          response_date: "2023-03-01T10:30:00Z",
          platform_review_id: "g67890"
        },
        {
          id: "5",
          customer_name: "David Brown",
          platform: "facebook",
          rating: 2,
          review_text: "Disappointed with the service. The issue wasn't fully resolved.",
          review_date: "2023-02-20T15:10:00Z",
          platform_review_id: "fb67890"
        }
      ];

      // Apply filters
      let filteredReviews = [...mockReviews];
      
      if (filters.rating !== 'all') {
        filteredReviews = filteredReviews.filter(
          review => review.rating === parseInt(filters.rating)
        );
      }
      
      if (filters.platform !== 'all') {
        filteredReviews = filteredReviews.filter(
          review => review.platform === filters.platform
        );
      }
      
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let cutoffDate = new Date();
        
        if (filters.dateRange === 'today') {
          cutoffDate.setHours(0, 0, 0, 0);
        } else if (filters.dateRange === 'week') {
          cutoffDate.setDate(now.getDate() - 7);
        } else if (filters.dateRange === 'month') {
          cutoffDate.setMonth(now.getMonth() - 1);
        }
        
        filteredReviews = filteredReviews.filter(
          review => new Date(review.review_date) >= cutoffDate
        );
      }

      setReviews(filteredReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchReviewRequests() {
    setIsLoading(true);
    try {
      // Mock data for review requests
      const mockRequests: ReviewRequest[] = [
        {
          id: "1",
          customer_id: 1,
          customer_name: "John Smith",
          customer_email: "john.smith@example.com",
          sent_date: "2023-03-15T10:00:00Z",
          opened_date: "2023-03-15T14:30:00Z",
          completed_date: "2023-03-16T09:15:00Z",
          status: "completed",
          template_id: "1",
          template_name: "Standard Review Request"
        },
        {
          id: "2",
          customer_id: 2,
          customer_name: "Sarah Johnson",
          customer_email: "sarah.johnson@example.com",
          sent_date: "2023-03-14T11:00:00Z",
          opened_date: "2023-03-14T13:45:00Z",
          status: "opened",
          template_id: "1",
          template_name: "Standard Review Request"
        },
        {
          id: "3",
          customer_id: 3,
          customer_name: "Mike Davis",
          customer_email: "mike.davis@example.com",
          sent_date: "2023-03-13T09:30:00Z",
          status: "sent",
          template_id: "2",
          template_name: "Post-Service Review Request"
        }
      ];

      // Apply status filter
      let filteredRequests = [...mockRequests];
      
      if (filters.status !== 'all') {
        filteredRequests = filteredRequests.filter(
          request => request.status === filters.status
        );
      }
      
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let cutoffDate = new Date();
        
        if (filters.dateRange === 'today') {
          cutoffDate.setHours(0, 0, 0, 0);
        } else if (filters.dateRange === 'week') {
          cutoffDate.setDate(now.getDate() - 7);
        } else if (filters.dateRange === 'month') {
          cutoffDate.setMonth(now.getMonth() - 1);
        }
        
        filteredRequests = filteredRequests.filter(
          request => new Date(request.sent_date) >= cutoffDate
        );
      }

      setReviewRequests(filteredRequests);
    } catch (error) {
      console.error("Error fetching review requests:", error);
      toast({
        title: "Error",
        description: "Failed to load review requests. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function respondToReview(reviewId: string, responseText: string) {
    try {
      // This would normally be an API call to the respective platform
      console.log(`Responding to review ${reviewId} with: ${responseText}`);
      
      // Update the local state
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                response_text: responseText,
                response_date: new Date().toISOString()
              } 
            : review
        )
      );
      
      toast({
        title: "Success",
        description: "Your response has been submitted.",
      });
    } catch (error) {
      console.error("Error responding to review:", error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive"
      });
    }
  }

  async function sendReviewRequest(data: {
    customerId: number;
    customerName: string;
    customerEmail: string;
    templateId: string;
  }) {
    try {
      // This would normally send an email or SMS to the customer
      console.log("Sending review request:", data);
      
      // Create a new request in the local state
      const newRequest: ReviewRequest = {
        id: String(Date.now()),
        customer_id: data.customerId,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        sent_date: new Date().toISOString(),
        status: "sent",
        template_id: data.templateId,
        template_name: data.templateId === "1" ? "Standard Review Request" : "Post-Service Review Request"
      };
      
      setReviewRequests(prev => [newRequest, ...prev]);
      
      toast({
        title: "Success",
        description: "Review request sent successfully.",
      });
    } catch (error) {
      console.error("Error sending review request:", error);
      toast({
        title: "Error",
        description: "Failed to send review request. Please try again.",
        variant: "destructive"
      });
    }
  }

  return {
    reviews,
    reviewRequests,
    isLoading,
    respondToReview,
    sendReviewRequest
  };
}
