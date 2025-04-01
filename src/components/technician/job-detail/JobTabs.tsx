
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { JobPhoto, PartRequest } from "@/types/technician";
import { JobNotesSection } from "./JobNotesSection";
import { PartsRequestSection } from "../parts/PartsRequestSection";
import { JobPhotosSection } from "../photos/JobPhotosSection";

interface JobTabsProps {
  jobId: string;
  photos: JobPhoto[];
  partsRequested: PartRequest[];
  notes: string[];
  onUploadPhoto: (jobId: string, file: File) => void;
  onRequestParts: (jobId: string, parts: { name: string, quantity: number }[]) => void;
}

const JobTabs: React.FC<JobTabsProps> = ({
  jobId,
  photos,
  partsRequested,
  notes,
  onUploadPhoto,
  onRequestParts
}) => {
  const [activeTab, setActiveTab] = useState("photos");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="photos" className="text-base">
          Photos
        </TabsTrigger>
        <TabsTrigger value="parts" className="text-base">
          Parts
        </TabsTrigger>
        <TabsTrigger value="notes" className="text-base">
          Notes
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="photos">
        <JobPhotosSection 
          jobId={jobId} 
          photos={photos} 
          onUploadPhoto={onUploadPhoto} 
        />
      </TabsContent>
      
      <TabsContent value="parts">
        <PartsRequestSection 
          jobId={jobId} 
          parts={partsRequested} 
          onRequestParts={onRequestParts} 
        />
      </TabsContent>
      
      <TabsContent value="notes">
        <Card>
          <JobNotesSection notes={notes} />
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default JobTabs;
