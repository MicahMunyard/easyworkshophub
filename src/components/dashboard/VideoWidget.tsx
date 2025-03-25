
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoWidgetProps {
  videoId?: string;
  title?: string;
}

const VideoWidget: React.FC<VideoWidgetProps> = ({ 
  videoId = "BHGh0rVxTbo", 
  title = "TOLICCS Video" 
}) => {
  const [playing, setPlaying] = useState(false);
  
  return (
    <Card className="h-full">
      <CardHeader className="p-4 pb-2 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Video className="mr-2 h-5 w-5 text-workshop-red" />
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col items-center justify-center h-[calc(100%-4rem)]">
        <div className="relative w-full h-full bg-black/90 rounded-lg flex items-center justify-center">
          {!playing ? (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30"
              onClick={() => setPlaying(true)}
            >
              <Play className="h-8 w-8 text-white" />
            </Button>
          ) : (
            <iframe 
              className="w-full h-full rounded-lg" 
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} 
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoWidget;
