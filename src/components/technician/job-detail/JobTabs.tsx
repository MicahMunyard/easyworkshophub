
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobPhoto, PartRequest } from "@/types/technician";
import JobPhotosSection from "@/components/technician/photos/JobPhotosSection";
import PartsRequestSection from "@/components/technician/parts/PartsRequestSection";
import JobNotesTab from "./tabs/JobNotesTab";
import JobMessagesTab from "./tabs/JobMessagesTab";

interface JobTabsProps {
  jobId: string;
  photos: JobPhoto[];
  partsRequested: PartRequest[];
  notes: { id: string; content: string; created_at: string; author: string }[];
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
  return (
    <Tabs defaultValue="photos" className="w-full">
      <TabsList className="grid grid-cols-4">
        <TabsTrigger value="photos" className="text-xs sm:text-sm">
          Photos
        </TabsTrigger>
        <TabsTrigger value="parts" className="text-xs sm:text-sm">
          Parts
        </TabsTrigger>
        <TabsTrigger value="notes" className="text-xs sm:text-sm">
          Notes
        </TabsTrigger>
        <TabsTrigger value="messages" className="text-xs sm:text-sm">
          Messages
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="photos" className="mt-4">
        <JobPhotosSection 
          jobId={jobId} 
          photos={photos}
          onUploadPhoto={onUploadPhoto}
        />
      </TabsContent>
      
      <TabsContent value="parts" className="mt-4">
        <PartsRequestSection
          jobId={jobId}
          parts={partsRequested}
          onRequestParts={onRequestParts}
        />
      </TabsContent>
      
      <TabsContent value="notes" className="mt-4">
        <JobNotesTab jobId={jobId} notes={notes} />
      </TabsContent>
      
      <TabsContent value="messages" className="mt-4">
        <JobMessagesTab />
      </TabsContent>
    </Tabs>
  );
};

export default JobTabs;
