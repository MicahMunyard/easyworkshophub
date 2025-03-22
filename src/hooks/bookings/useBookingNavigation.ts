
import { useState } from "react";
import { BookingView } from "./types";

export const useBookingNavigation = (initialDate = new Date(), initialView: BookingView = "day") => {
  const [date, setDate] = useState<Date>(initialDate);
  const [view, setView] = useState<BookingView>(initialView);

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(date);
    if (view === "day") {
      newDate.setDate(date.getDate() + (direction === "next" ? 1 : -1));
    } else if (view === "week") {
      newDate.setDate(date.getDate() + (direction === "next" ? 7 : -7));
    } else if (view === "month") {
      newDate.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
    }
    setDate(newDate);
  };

  return {
    date,
    setDate,
    view,
    setView,
    navigateDate
  };
};
