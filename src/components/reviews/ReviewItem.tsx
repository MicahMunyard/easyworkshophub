
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Calendar, 
  Send
} from "lucide-react";
import { ReviewItemProps } from "./types";
import { formatDistanceToNow } from "date-fns";

const platformIcons = {
  google: "G",
  facebook: "FB",
  yelp: "Y",
  other: "⭐"
};

const platformColors = {
  google: "bg-red-500",
  facebook: "bg-blue-500",
  yelp: "bg-purple-500",
  other: "bg-gray-500"
};

const ReviewItem: React.FC<ReviewItemProps> = ({ review, onRespond }) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState(review.response_text || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onRespond(review.id, responseText);
      setShowResponseForm(false);
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.customer_avatar} alt={review.customer_name} />
            <AvatarFallback>{review.customer_name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{review.customer_name}</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className={`flex items-center justify-center h-5 w-5 rounded mr-2 text-white text-xs ${platformColors[review.platform]}`}>
                    {platformIcons[review.platform]}
                  </div>
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {formatDistanceToNow(new Date(review.review_date), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            
            <p className="mt-2">{review.review_text}</p>
            
            {review.response_text && (
              <div className="mt-4 pl-4 border-l-2 border-gray-200">
                <div className="font-medium text-sm">Your Response</div>
                <p className="text-sm mt-1">{review.response_text}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(review.response_date || ""), { addSuffix: true })}
                </div>
              </div>
            )}
            
            {showResponseForm && !review.response_text && (
              <div className="mt-4">
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response..."
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResponseForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitResponse}
                    disabled={isSubmitting || !responseText.trim()}
                    className="flex items-center gap-1"
                  >
                    <Send className="h-3 w-3" />
                    Submit Response
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      {!review.response_text && !showResponseForm && (
        <CardFooter className="border-t px-6 py-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowResponseForm(true)}
          >
            <MessageSquare className="h-3 w-3" />
            Respond
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ReviewItem;
