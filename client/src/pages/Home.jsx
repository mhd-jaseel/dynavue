import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Autoplay, Navigation } from 'swiper/modules';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';

import FireHero from '../components/home/FireHero';
import ServiceCard from '../components/home/ServiceCard';
import TestimonialGrid from '../components/reviews/TestimonialGrid';
import ImageWithLoader from '../components/common/ImageWithLoader';


const Home = () => {
  const [highlightData, setHighlightData] = useState({
    smallHeading: 'Featured Highlights',
    mainTitlePart1: 'The Art of',
    mainTitleItalic: 'Storytelling',
    buttonText: 'Explore Portfolio',
    buttonLink: '/portfolio',
    photos: []
  });

  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchHighlight = async () => {
      try {
        const res = await api.get('/home-highlights');
        if (res.data?.data) {
          const sortedPhotos = res.data.data.photos.sort((a, b) => a.order - b.order);
          setHighlightData({ ...res.data.data, photos: sortedPhotos });
        }
      } catch (err) {
        console.error('Failed to fetch home highlights', err);
      }
    };

    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data?.data) {
          const activeServices = res.data.data.filter(s => s.visibility !== false && s.featuredOnHome);
          setServices(activeServices);
        }
      } catch (err) {
        console.error('Failed to fetch services', err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews/approved');
        setTestimonials(res.data.reviews);
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      }
    };

    fetchHighlight();
    fetchServices();
    fetchReviews();
  }, []);

  // ... rest of logic stays same ...
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-base transition-colors duration-500">
      <FireHero />

      {/* Luxury Framed Gallery Section */}
      <section className="relative px-6 md:px-12 lg:px-16 py-24 md:py-32 max-w-[1400px] mx-auto transition-colors duration-500">
        <header className="mb-16 md:mb-20 flex flex-col md:flex-row items-center md:items-end justify-between gap-8 text-center md:text-left">
          <div className="max-w-2xl">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-primary/40 mb-6 font-semibold">{highlightData.smallHeading}</h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-heading leading-[1.1]">{highlightData.mainTitlePart1} <span className="italic font-light">{highlightData.mainTitleItalic}</span></h3>
          </div>
          <Link
            to={highlightData.buttonLink}
            className="group flex items-center gap-3 text-[11px] tracking-[0.25em] uppercase font-medium border-b border-primary/10 pb-3 hover:border-primary transition-all duration-700 mx-auto md:mx-0"
          >
            {highlightData.buttonText}
            <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 lg:gap-16">
          {highlightData.photos.map((photo, i) => (
            <motion.div
              key={photo._id || i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col group"
            >
              {/* The "Frame" */}
              <div className="relative p-3 md:p-4 bg-white/5 dark:bg-white/[0.02] border border-primary/5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-700 group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)] group-hover:bg-white/10 dark:group-hover:bg-white/[0.05]">
                <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-zinc-100 dark:bg-zinc-900">
                  <ImageWithLoader
                    src={photo.url}
                    alt={photo.alt}
                    className="w-full h-full object-cover grayscale transition-all duration-1000 ease-out group-hover:grayscale-0 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Subtle Overlay Fade */}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                </div>
              </div>

              {/* Minimal Caption Outside the Frame */}
              <div className="mt-6 px-2 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium">{photo.category}</span>
                <span className="w-10 h-px bg-primary/20" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Section Blend Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-base to-transparent pointer-events-none" />
      </section>

      {/* Services Preview */}
      <section className="relative px-6 md:px-12 max-w-[1400px] mx-auto py-12 md:py-16 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12 md:mb-16 gap-6 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-primary/40 mb-4 font-semibold">Our Expertise</h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-heading">What We Do</h3>
          </motion.div>
          
          <motion.div 
             initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
             className="flex gap-3 justify-center md:justify-start"
          >
             <button className="swiper-button-prev-custom w-10 h-10 md:w-12 md:h-12 rounded-full border border-primary/10 dark:border-white/10 flex items-center justify-center text-primary/40 dark:text-white/40 hover:border-primary dark:hover:border-white hover:text-primary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-500">
                <ArrowLeft size={18} strokeWidth={1.5} />
             </button>
             <button className="swiper-button-next-custom w-10 h-10 md:w-12 md:h-12 rounded-full border border-primary/10 dark:border-white/10 flex items-center justify-center text-primary/40 dark:text-white/40 hover:border-primary dark:hover:border-white hover:text-primary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-500">
                <ArrowRight size={18} strokeWidth={1.5} />
             </button>
          </motion.div>
        </div>

        <Swiper
          modules={[FreeMode, Navigation, Autoplay]}
          navigation={{
            prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom',
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          spaceBetween={24}
          slidesPerView={1}
          loop={true}
          grabCursor={true}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
            1280: { slidesPerView: 4, spaceBetween: 32 }
          }}
          className="w-full"
        >
          {services.map((s, i) => (
            <SwiperSlide key={i} className="h-auto">
              <div className="h-full py-4">
                <ServiceCard {...s} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Section Blend Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-base to-transparent pointer-events-none" />
      </section>

      {/* Testimonials Section */}
      <section className="bg-base py-24 md:py-32 px-6 md:px-12 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-20"
          >
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-primary/40 mb-4 font-semibold">Testimonials</h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-heading">Words From Our Couples</h3>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }}
          >
            <TestimonialGrid testimonials={testimonials} />
          </motion.div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="px-6 md:px-12 py-24 md:py-32 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8 }}
            className="w-full md:w-1/2 aspect-[3/4] md:aspect-square overflow-hidden rounded-2xl"
          >
            <ImageWithLoader 
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200" 
              alt="Professional Photographer at work" 
              className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" 
              loading="lazy" 
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full md:w-1/2"
          >
            <h2 className="text-3xl md:text-5xl mb-8">The Eye Behind<br />The Lens</h2>
            <p className="font-body font-light text-secondary text-lg leading-relaxed mb-10">
              At DYNAVUE, we believe that the best photographs are the ones you didn&apos;t know were being taken. We blend into the background, allowing your authentic story to unfold, preserving the raw emotion and fleeting moments that define your celebration.
            </p>
            <Link to="/about" className="inline-block border-b border-primary pb-1 tracking-widest uppercase text-sm hover:text-secondary hover:border-secondary transition-colors">
              Meet the Photographer &rarr;
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-40 md:py-52 px-6 overflow-hidden flex flex-col items-center text-center justify-center">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          {highlightData.ctaBgImage && (
            <ImageWithLoader 
              src={highlightData.ctaBgImage} 
              alt="Cinematic background" 
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-7xl lg:text-8xl font-heading text-white mb-12 tracking-tight"
          >
            Let&apos;s Capture<br/>Your Story
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center gap-8"
          >
            <p className="text-white/60 text-xs md:text-sm uppercase tracking-[0.4em] font-light mb-4">
              Available for Worldwide Commissions
            </p>
            
            <Link 
              to="/contact" 
              className="group relative px-12 py-5 overflow-hidden border border-white/30 text-white text-[11px] tracking-[0.3em] uppercase transition-all duration-700 hover:border-white"
            >
              <span className="relative z-10">Book a Session</span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1]" />
              <span className="absolute inset-0 z-20 flex items-center justify-center text-dark opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                Book a Session
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Decorative Lines */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-white/10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-white/10" />
      </section>
    </motion.div>
  );
};

export default Home;
