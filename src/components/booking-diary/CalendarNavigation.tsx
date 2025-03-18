
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarNavigationProps } from "./types";

const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  date,
  formattedDate,
  view,
  setView,
  navigateDate
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateDate("prev")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <CardTitle>{formattedDate}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateDate("next")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Tabs defaultValue="day" value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default CalendarNavigation;
