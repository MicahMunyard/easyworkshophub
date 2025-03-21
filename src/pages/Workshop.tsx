
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Workshop page that redirects to the booking-diary by default
 * This serves as the main container for all workshop-related functionality
 */
const Workshop: React.FC = () => {
  return <Navigate to="/booking-diary" replace />;
};

export default Workshop;
