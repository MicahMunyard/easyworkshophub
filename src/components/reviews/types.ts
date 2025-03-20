
export interface Review {
  id: string;
  customer_name: string;
  customer_avatar?: string;
  platform: 'google' | 'facebook' | 'yelp' | 'other';
  rating: number;
  review_text: string;
  review_date: string;
  response_text?: string;
  response_date?: string;
  platform_review_id: string;
}

export interface ReviewRequest {
  id: string;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  sent_date: string;
  opened_date?: string;
  completed_date?: string;
  status: 'sent' | 'opened' | 'completed';
  template_id: string;
  template_name: string;
}

export interface ReviewFiltersProps {
  filters: {
    rating: string;
    platform: string;
    dateRange: string;
    status: string;
  };
  setFilters: (filters: {
    rating: string;
    platform: string;
    dateRange: string;
    status: string;
  }) => void;
}

export interface ReviewListProps {
  reviews: Review[];
  isLoading: boolean;
  onRespond: (reviewId: string, responseText: string) => Promise<void>;
}

export interface ReviewItemProps {
  review: Review;
  onRespond: (reviewId: string, responseText: string) => Promise<void>;
}

export interface ReviewRequestsListProps {
  requests: ReviewRequest[];
  isLoading: boolean;
}

export interface ReviewAnalyticsProps {
  reviews: Review[];
  isLoading: boolean;
}

export interface SendReviewRequestFormProps {
  onSubmit: (data: {
    customerId: number;
    customerName: string;
    customerEmail: string;
    templateId: string;
  }) => Promise<void>;
}
