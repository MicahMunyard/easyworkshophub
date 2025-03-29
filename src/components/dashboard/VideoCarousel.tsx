
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface VideoData {
  id: string;
  title: string;
  thumbnail?: string;
}

interface VideoCarouselProps {
  videos: VideoData[];
  title?: string;
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({ 
  videos = [], 
  title = "Workshop Videos" 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  
  const currentVideo = videos[activeIndex];
  
  const handleVideoEnd = () => {
    setPlaying(false);
  };
  
  const handleNext = () => {
    if (!playing) {
      setActiveIndex((prev) => (prev + 1) % videos.length);
    }
  };
  
  const handlePrev = () => {
    if (!playing) {
      setActiveIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
    }
  };
  
  const getThumbnailUrl = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="p-2 pb-1 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-sm">
            <Video className="mr-1 h-4 w-4 text-workshop-red" />
            {title}
          </CardTitle>
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={handlePrev}
              disabled={videos.length <= 1 || playing}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={handleNext}
              disabled={videos.length <= 1 || playing}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 flex flex-col items-center justify-center overflow-hidden">
        <div className="relative w-full bg-black/90 rounded-lg aspect-video h-[90px] flex items-center justify-center overflow-hidden">
          {!playing ? (
            <div className="relative w-full h-full cursor-pointer group" onClick={() => setPlaying(true)}>
              <img 
                src={currentVideo?.thumbnail || getThumbnailUrl(currentVideo?.id || '')} 
                alt={currentVideo?.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30"
                >
                  <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5"></div>
                </Button>
              </div>
              <div className="absolute bottom-1 left-1 right-1 text-white text-xs font-medium bg-black/70 p-1 rounded truncate">
                {currentVideo?.title}
              </div>
            </div>
          ) : (
            <iframe 
              className="w-full h-full aspect-video" 
              src={`https://www.youtube.com/embed/${currentVideo?.id}?autoplay=1&rel=0`} 
              title={currentVideo?.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          )}
        </div>

        {videos.length > 1 && !playing && (
          <div className="flex justify-center mt-1 gap-1">
            {videos.map((_, index) => (
              <Button
                key={index}
                variant={index === activeIndex ? "default" : "outline"}
                size="sm"
                className={`w-5 h-5 p-0 text-xs ${index === activeIndex ? "bg-workshop-red" : ""}`}
                onClick={() => setActiveIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoCarousel;
