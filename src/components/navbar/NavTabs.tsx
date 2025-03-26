
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NavTabsProps {
  currentTab: string;
  onTabChange: (value: string) => void;
  sections: { name: string; path: string }[];
  isMobile?: boolean;
}

const NavTabs: React.FC<NavTabsProps> = ({ 
  currentTab, 
  onTabChange, 
  sections,
  isMobile = false
}) => {
  return (
    <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
      <TabsList className={`${isMobile ? 'bg-transparent h-auto w-full flex-col items-stretch justify-start' : 'bg-transparent h-12 justify-start'} px-0 gap-1`}>
        {sections.map((section) => (
          <TabsTrigger 
            key={section.name} 
            value={section.name.toLowerCase()}
            className={`h-10 ${isMobile ? 'w-full justify-start' : ''} px-4 data-[state=active]:bg-muted data-[state=active]:shadow-none transition-all`}
          >
            {section.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default NavTabs;
