import { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";

import { useScrollLock } from '../../hooks/useScrollLock';

const PhotoGallery = ({ galleries }) => {
  const [activeGallery, setActiveGallery] = useState(null);
  const [index, setIndex] = useState(-1);
  useScrollLock(index >= 0);

  const handleOpenGallery = (gallery) => {
    setActiveGallery(gallery);
    setIndex(0);
  };

  const handleCloseGallery = () => {
    setIndex(-1);
    setTimeout(() => setActiveGallery(null), 300); // Wait for closing animation
  };

  const getSlides = () => {
    if (!activeGallery) return [];
    
    const imageSlides = (activeGallery.images || []).map(img => ({
      type: 'image',
      src: img.url,
      title: activeGallery.title || '',
      description: activeGallery.description || ''
    }));

    const videoSlides = (activeGallery.videos || []).map(vid => ({
      type: 'video',
      width: 1280,
      height: 720,
      poster: activeGallery.coverImage?.url || activeGallery.url,
      sources: [
        {
          src: vid.url,
          type: "video/mp4",
        }
      ],
      title: activeGallery.title || '',
      description: activeGallery.description || ''
    }));

    // If it's a legacy photo fallback without images/videos arrays
    if (imageSlides.length === 0 && videoSlides.length === 0) {
      return [{
        type: 'image',
        src: activeGallery.lightboxUrl || activeGallery.url,
        title: activeGallery.title || '',
        description: activeGallery.description || ''
      }];
    }

    // Sort them by order if possible, or just concat
    return [...imageSlides, ...videoSlides];
  };

  const slides = getSlides();

  const breakpointColumnsObj = {
    default: 4,
    1440: 4,
    1024: 3,
    768: 2,
    640: 1
  };

  const getRatioClass = (size) => {
    switch(size) {
      case 'small': return 'aspect-[1/1]';
      case 'large': return 'aspect-[3/4]';
      case 'portrait': return 'aspect-[2/3]';
      case 'landscape': return 'aspect-[3/2]';
      case 'medium': 
      default: return 'aspect-[4/5]';
    }
  };

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid flex w-auto -ml-6 md:-ml-10"
        columnClassName="my-masonry-grid_column pl-6 md:pl-10 bg-clip-padding"
      >
        {galleries.map((gallery) => {
          const coverUrl = gallery.coverImage?.url || gallery.thumbnailUrl || gallery.url;
          const mediaCount = (gallery.images?.length || 0) + (gallery.videos?.length || 0) || 1;
          const ratioClass = getRatioClass(gallery.cardSize);

          return (
            <div 
              key={gallery._id || gallery.id} 
              className="group relative cursor-pointer overflow-hidden mb-6 md:mb-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg md:rounded-xl shadow-sm hover:shadow-2xl transition-all duration-700"
              onClick={() => handleOpenGallery(gallery)}
            >
              <div className={`relative ${ratioClass} overflow-hidden`}>
                <img 
                  src={coverUrl} 
                  alt={gallery.title || 'Gallery Cover'} 
                  className="w-full h-full object-cover transform scale-[1.01] group-hover:scale-110 transition-transform duration-1000 ease-[0.22,1,0.36,1]"
                  loading="lazy"
                />
                
                {/* Luxury Minimal Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-between p-6 md:p-8">
                  <div className="flex justify-end transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full tracking-widest font-bold">
                      {mediaCount} {mediaCount === 1 ? 'ITEM' : 'ITEMS'}
                    </span>
                  </div>
                  
                  <div>
                    <div className="overflow-hidden">
                      <span className="block text-white font-heading text-xl md:text-2xl tracking-wide transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out">
                        {gallery.title}
                      </span>
                    </div>
                    <div className="overflow-hidden mt-2">
                      <span className="block text-white/60 text-[10px] tracking-[0.3em] uppercase transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 delay-100 ease-out">
                        {gallery.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </Masonry>

      <Lightbox
        open={index >= 0}
        close={handleCloseGallery}
        index={index}
        slides={slides}
        plugins={[Zoom, Thumbnails, Captions, Fullscreen, Slideshow, Video]}
        carousel={{ preload: 2 }}
        zoom={{ doubleTapDelay: 300, maxZoomPixelRatio: 3 }}
        video={{ autoPlay: true, muted: false, controls: true }}
        controller={{ closeOnPullDown: true, touchAction: "none" }}
        animation={{ swipe: 300 }}
      />
    </>
  );
};

export default PhotoGallery;
