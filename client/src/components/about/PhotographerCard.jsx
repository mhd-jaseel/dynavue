import { motion } from 'framer-motion';
import { Instagram, Facebook, Globe, Star } from 'lucide-react';
import PropTypes from 'prop-types';
import ImageWithLoader from '../common/ImageWithLoader';

const PhotographerCard = ({ 
  member, 
  index = 0, 
  isFeatured = false 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2"
    >
      {/* Subtle Background Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 dark:from-white/10 dark:via-white/5 dark:to-white/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />

      <div className="relative bg-white dark:bg-[#111] rounded-2xl overflow-hidden flex flex-col flex-grow border border-black/5 dark:border-white/10 shadow-sm group-hover:shadow-xl transition-all duration-500 z-10">
        
        {/* Image Container */}
        <div className="aspect-[4/5] overflow-hidden relative bg-light/50 dark:bg-black/50">
          {member.image ? (
            <ImageWithLoader 
              src={member.image} 
              alt={member.name} 
              loading="lazy"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
              <span className="text-secondary/40 text-xs">No Image</span>
            </div>
          )}
          
          {/* Gradient Overlay for Text Readability and Premium feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          
          {/* Featured Badge */}
          {isFeatured && (
            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-lg">
              <Star size={10} className="fill-white" />
              Featured
            </div>
          )}

          {/* Social Links on Hover */}
          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 translate-y-4 group-hover:translate-y-0">
            {member.instagram && (
              <a href={member.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all hover:scale-110">
                <Instagram size={20} />
              </a>
            )}
            {member.facebook && (
              <a href={member.facebook} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all hover:scale-110">
                <Facebook size={20} />
              </a>
            )}
            {member.website && (
              <a href={member.website} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all hover:scale-110">
                <Globe size={20} />
              </a>
            )}
          </div>
        </div>
        
        {/* Content Section with Glassmorphism Effect overlapping the image */}
        <div className="p-8 flex-grow flex flex-col justify-between bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl relative -mt-8 rounded-t-2xl border-t border-white/20 dark:border-white/10 z-20">
          <div>
            <h3 className="text-2xl font-heading mb-1 text-primary dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
              {member.name}
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[10px] uppercase tracking-widest text-primary/70 dark:text-white/60 font-bold">
                {member.role}
              </p>
              {member.experience && (
                <>
                  <span className="w-1 h-1 rounded-full bg-primary/30 dark:bg-white/30" />
                  <p className="text-[10px] uppercase tracking-widest text-primary/70 dark:text-white/60 font-medium">
                    {member.experience}
                  </p>
                </>
              )}
            </div>
            <p className="text-sm text-secondary dark:text-white/70 font-light leading-relaxed line-clamp-3">
              {member.bio || "No biography available."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

PhotographerCard.propTypes = {
  member: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    image: PropTypes.string,
    instagram: PropTypes.string,
    facebook: PropTypes.string,
    website: PropTypes.string,
    bio: PropTypes.string,
    experience: PropTypes.string,
  }).isRequired,
  index: PropTypes.number,
  isFeatured: PropTypes.bool,
};

export default PhotographerCard;
