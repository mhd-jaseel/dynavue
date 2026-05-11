import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import ImageWithLoader from '../common/ImageWithLoader';

const ServiceCard = ({ id, title, name, description, image, coverImage, slug, order }) => {
  const displayTitle = title || name;
  const displayImage = image?.url || image || coverImage;
  const displayId = id || (order !== undefined ? `0${order + 1}` : '01');

  return (
    <Link to={`/services#${slug}`} className="block h-full group outline-none">
      <div className="relative flex flex-col h-full bg-transparent">
        {/* Card Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl md:rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-primary/5 dark:border-white/5 transition-all duration-700 group-hover:border-primary/20 dark:group-hover:border-white/20 shadow-sm group-hover:shadow-2xl">
          <ImageWithLoader 
            src={displayImage} 
            alt={displayTitle}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-1000 ease-[0.22,1,0.36,1] group-hover:scale-110"
          />
          
          {/* Subtle overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-70 transition-opacity duration-700" />
          
          {/* Numbering - Static for SEO */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6">
            <span className="block text-[10px] md:text-xs font-medium tracking-[0.2em] text-white/70">
              {displayId}
            </span>
          </div>

          {/* Hover Arrow Icon */}
          <div className="absolute bottom-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
             <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                <ArrowUpRight size={18} />
             </div>
          </div>
        </div>
        
        {/* Card Content */}
        <div className="mt-6 flex flex-col px-1">
          <h3 className="text-xl md:text-2xl font-heading tracking-tight mb-2 group-hover:text-primary transition-colors duration-500">
            {displayTitle}
          </h3>
          <p className="text-[13px] md:text-sm text-secondary/60 font-light leading-relaxed line-clamp-2 transition-all duration-500 group-hover:text-secondary">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
