
import React from "react";

const SidebarHeader: React.FC = () => {
  return (
    <div className="mb-8 px-3">
      <div className="flex items-center gap-2">
        <img 
          src="/lovable-uploads/81d792e6-3434-4c42-a968-ea14a4bfa07b.png" 
          alt="TOLICCS Logo" 
          className="h-8 w-auto lg:hidden"
        />
        <p className="text-xs uppercase font-medium text-muted-foreground tracking-wider">
          Workshop Management
        </p>
      </div>
    </div>
  );
};

export default SidebarHeader;
