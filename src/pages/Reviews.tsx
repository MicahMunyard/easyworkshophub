
import React, { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Star, Send, Filter, Calendar, Clock } from "lucide-react";
import { useReviews } from "@/components/reviews/useReviews";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewAnalytics from "@/components/reviews/ReviewAnalytics";
import ReviewRequestsList from "@/components/reviews/ReviewRequestsList";
import SendReviewRequestForm from "@/components/reviews/SendReviewRequestForm";
import ReviewFilters from "@/components/reviews/ReviewFilters";

const Reviews = () => {
  const [activeTab, setActiveTab] = useState("reviews");
  const [filters, setFilters] = useState({
    rating: "all",
    platform: "all",
    dateRange: "all",
    status: "all"
  });

  const { 
    reviews, 
    reviewRequests, 
    isLoading, 
    respondToReview, 
    sendReviewRequest 
  } = useReviews(filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Reviews</h1>
        <p className="text-muted-foreground">
          Manage and respond to customer reviews across different platforms.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Reviews</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>Review Requests</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All Reviews</CardTitle>
              <CardDescription>
                View and respond to customer reviews from all platforms.
              </CardDescription>
              <ReviewFilters filters={filters} setFilters={setFilters} />
            </CardHeader>
            <CardContent>
              <ReviewList 
                reviews={reviews} 
                isLoading={isLoading} 
                onRespond={respondToReview}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Analytics</CardTitle>
              <CardDescription>
                Insights and trends from your customer reviews.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewAnalytics reviews={reviews} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Review Request</CardTitle>
              <CardDescription>
                Send customized review requests to customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SendReviewRequestForm onSubmit={sendReviewRequest} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Review Request History</CardTitle>
              <CardDescription>
                Track status of sent review requests.
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select 
                    className="text-sm bg-transparent border-b focus:outline-none"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="all">All Statuses</option>
                    <option value="sent">Sent</option>
                    <option value="opened">Opened</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <select 
                    className="text-sm bg-transparent border-b focus:outline-none"
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ReviewRequestsList 
                requests={reviewRequests} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reviews;
