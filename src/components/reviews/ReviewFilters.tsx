
import React from "react";
import { ReviewFiltersProps } from "./types";
import { Filter, Calendar, Star } from "lucide-react";

const ReviewFilters: React.FC<ReviewFiltersProps> = ({ filters, setFilters }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-4">
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-muted-foreground" />
        <select 
          className="text-sm bg-transparent border-b focus:outline-none"
          value={filters.rating}
          onChange={(e) => setFilters({...filters, rating: e.target.value})}
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select 
          className="text-sm bg-transparent border-b focus:outline-none"
          value={filters.platform}
          onChange={(e) => setFilters({...filters, platform: e.target.value})}
        >
          <option value="all">All Platforms</option>
          <option value="google">Google</option>
          <option value="facebook">Facebook</option>
          <option value="yelp">Yelp</option>
          <option value="other">Other</option>
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
  );
};

export default ReviewFilters;
