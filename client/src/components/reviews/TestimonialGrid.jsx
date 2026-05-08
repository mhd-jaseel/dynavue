import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Star, User } from 'lucide-react';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/pagination';

const TestimonialGrid = ({ testimonials = [] }) => {
  if (!testimonials.length) return null;

  return (
    <div className="w-full py-8">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={32}
        slidesPerView={1}
        loop={testimonials.length > 3}
        speed={1200}
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 3, spaceBetween: 32 },
        }}
        className="testimonial-swiper !pb-16"
      >
        {testimonials.map((t, idx) => (
          <SwiperSlide key={t._id || idx} className="h-auto">
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="group h-full flex flex-col p-10 border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] rounded-[2.5rem] transition-all duration-700 hover:border-primary/20 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-black/5"
            >
              {/* Review Text */}
              <p className="font-heading text-lg md:text-xl leading-relaxed text-primary/80 dark:text-white/80 mb-6 font-light flex-grow">
                "{t.review || t.quote}"
              </p>

              {/* User Profile & Stars */}
              <div className="flex items-center justify-between pt-6 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-light dark:bg-white/5 flex-shrink-0 border border-black/5 dark:border-white/10">
                    {t.image || t.user?.profilePic ? (
                      <img 
                        src={t.image || t.user?.profilePic} 
                        alt={t.name} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/10 dark:text-white/10">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-heading text-sm text-primary dark:text-white tracking-wide">
                      {t.name}
                    </h4>
                    {t.event && (
                      <p className="text-[9px] text-secondary/40 uppercase tracking-[0.2em] font-bold mt-0.5">
                        {t.event}
                      </p>
                    )}
                    <p className="text-[9px] text-secondary/30 uppercase tracking-[0.1em] mt-0.5">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>

                {/* Star Rating (Opposite of name) */}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={10} 
                      className={`${i < (t.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-black/5 dark:text-white/5'}`} 
                    />
                  ))}
                </div>
              </div>
            </motion.article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TestimonialGrid;
