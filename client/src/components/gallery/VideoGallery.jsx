import { useState, useRef } from 'react';
import Masonry from 'react-masonry-css';
import { Play, Pause, Volume2, VolumeX, Maximize2, Video as VideoIcon } from 'lucide-react';

const VideoCard = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log('Autoplay blocked:', e));
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoRef.current.currentTime = 0; // reset
    }
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };

  return (
    <div 
      className="group relative cursor-pointer overflow-hidden mb-6 md:mb-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg md:rounded-xl shadow-sm hover:shadow-2xl transition-all duration-700"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* Video Badge */}
        <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
          <VideoIcon size={12} className="text-white" />
          <span className="text-[9px] uppercase tracking-widest font-bold text-white">Video</span>
        </div>

        {/* Video Element */}
        <video 
          ref={videoRef}
          src={video.url}
          poster={video.thumbnailUrl}
          muted={isMuted}
          loop
          playsInline
          className="w-full h-full object-cover transform scale-[1.01] group-hover:scale-105 transition-transform duration-1000 ease-[0.22,1,0.36,1]"
        />
        
        {/* Play State Indicator Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Play size={24} className="ml-1" />
            </div>
          </div>
        )}

        {/* Bottom Overlay with title and controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-6">
          <div className="flex justify-between items-end">
            <div>
              <div className="overflow-hidden">
                <span className="block text-white font-heading text-xl md:text-2xl tracking-wide transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out">
                  {video.title}
                </span>
              </div>
              <div className="overflow-hidden mt-2">
                <span className="block text-white/60 text-[10px] tracking-[0.3em] uppercase transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 delay-100 ease-out">
                  {video.category}
                </span>
              </div>
            </div>
            
            {/* Duration */}
            <div className="overflow-hidden mb-1">
              <span className="block text-white/80 font-mono text-[11px] transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 delay-150 ease-out">
                {video.duration || '0:00'}
              </span>
            </div>
          </div>
          
          {/* Controls */}
          <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-200">
            <button onClick={togglePlay} className="p-2 text-white hover:text-primary transition-colors">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div className="flex gap-2">
              <button onClick={toggleMute} className="p-2 text-white hover:text-primary transition-colors">
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button onClick={toggleFullscreen} className="p-2 text-white hover:text-primary transition-colors">
                <Maximize2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoGallery = ({ videos }) => {
  const breakpointColumnsObj = {
    default: 3,
    1440: 3,
    1024: 2,
    768: 2,
    640: 1
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid flex w-auto -ml-6 md:-ml-10"
      columnClassName="my-masonry-grid_column pl-6 md:pl-10 bg-clip-padding"
    >
      {videos.map((video) => (
        <VideoCard key={video._id || video.id} video={video} />
      ))}
    </Masonry>
  );
};

export default VideoGallery;
