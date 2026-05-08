import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const TestimonialSlider = ({ testimonials }) => {
  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={40}
        slidesPerView={1}
        breakpoints={{
          768: { slidesPerView: 2 }
        }}
        autoplay={{ delay: 4000, disableOnInteraction: true, pauseOnMouseEnter: true }}
        touchRatio={1}
        resistance={true}
        className="w-full"
      >
        {testimonials.map((t, idx) => (
          <SwiperSlide key={idx} className="h-auto">
            <div className="h-full flex flex-col p-8 border border-border-light bg-light/20">
              <span className="text-6xl font-heading text-border-light leading-none mb-4">&quot;</span>
              <p className="font-heading text-lg md:text-xl italic mb-8 flex-grow">
                {t.quote}
              </p>
              <div>
                <p className="font-medium text-sm tracking-wide uppercase">{t.name}</p>
                <p className="text-xs text-secondary mt-1 tracking-wider">{t.event}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TestimonialSlider;
