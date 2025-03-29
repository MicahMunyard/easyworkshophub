
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
import { useMediaQuery } from "@/hooks/use-media-query";

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
  const [playing, setPlaying] = useState<string | null>(null);
  const [api, setApi] = useState<any>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const getThumbnailUrl = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const handlePlay = (videoId: string) => {
    setPlaying(videoId);
  };

  const handleVideoEnd = () => {
    setPlaying(null);
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="p-2 pb-1 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-sm md:text-base">
            <Video className="mr-1 h-4 w-4 md:h-5 md:w-5 text-workshop-red" />
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-2 flex flex-col items-center justify-center overflow-hidden">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {videos.map((video) => (
              <CarouselItem key={video.id} className={isMobile ? "basis-full" : "basis-1/2"}>
                <div className="relative w-full bg-black/90 rounded-lg aspect-video md:h-[190px] h-[160px] flex items-center justify-center overflow-hidden">
                  {playing === video.id ? (
                    <iframe 
                      className="w-full h-full" 
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`} 
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="relative w-full h-full cursor-pointer group" onClick={() => handlePlay(video.id)}>
                      <img 
                        src={video.thumbnail || getThumbnailUrl(video.id)} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30"
                        >
                          <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[10px] border-l-white border-b-[7px] border-b-transparent ml-0.5"></div>
                        </Button>
                      </div>
                      <div className="absolute bottom-1 left-1 right-1 text-white text-xs md:text-sm font-medium bg-black/70 p-1 rounded truncate">
                        {video.title}
                      </div>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8" />
          <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" />
        </Carousel>

        {!playing && (
          <div className="flex justify-center mt-2 gap-1">
            {Math.ceil(videos.length / (isMobile ? 1 : 2)) > 1 && 
              Array.from({ length: Math.ceil(videos.length / (isMobile ? 1 : 2)) }, (_, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="w-6 h-6 p-0 text-xs hover:bg-workshop-red/20"
                  onClick={() => api?.scrollTo(i * (isMobile ? 1 : 2))}
                >
                  {i + 1}
                </Button>
              ))
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoCarousel;
