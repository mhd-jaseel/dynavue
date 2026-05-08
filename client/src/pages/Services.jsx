import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FAQAccordion from '../components/services/FAQAccordion';
import api from '../lib/api';

const faqs = [
  { question: "How far in advance should I book?", answer: "For weddings, we recommend booking 6-9 months in advance. For portraits and smaller events, 1-2 months is usually sufficient." },
  { question: "Do you travel for weddings?", answer: "Yes! While we are based in Kozhikode, Kerala, we frequently travel across India and internationally for destination weddings." },
  { question: "How many images will we receive?", answer: "For a full wedding day, you can expect between 500-800 fully edited images. For engagements and portraits, typically 50-100 images." },
  { question: "When will we get our photos?", answer: "Portrait/Engagement sessions take 2-3 weeks. Full weddings take 6-8 weeks due to the volume and care we put into editing each image." },
  { question: "Do you provide raw, unedited files?", answer: "We do not provide RAW files. Our editing process is a crucial part of our art and brand, ensuring you receive a finished, polished product." },
  { question: "What are your payment terms?", answer: "We require a 30% retainer fee to secure your date, with the balance due 2 weeks before the event." }
];

const Services = () => {
  const { hash } = useLocation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data?.data) {
          // Only show visible services
          setServices(res.data.data.filter(s => s.visibility !== false));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (!loading && hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [hash, loading]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-24 transition-colors duration-500">
      <div className="pt-32 md:pt-48 pb-16 text-center px-4">
        <h2 className="text-[10px] uppercase tracking-[0.5em] text-primary/40 mb-6 font-semibold">Our Expertise</h2>
        <h1 className="text-4xl md:text-7xl font-heading mb-6 tracking-tight">Tailored Services</h1>
        <p className="text-secondary/60 tracking-[0.3em] uppercase text-[10px] md:text-[11px]">Bespoke photography experiences worldwide</p>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {loading ? (
          <div className="py-20 text-center text-secondary/40 text-sm tracking-widest uppercase font-bold">Loading Services...</div>
        ) : services.map((service, index) => (
          <section key={service._id} id={service.slug} className="mb-32 md:mb-52 scroll-mt-24 px-6 md:px-12">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">
              {/* Image Side */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full lg:w-3/5 aspect-[16/10] lg:aspect-auto lg:h-auto overflow-hidden rounded-2xl relative group ${index % 2 === 0 ? '' : 'lg:order-last'}`}
              >
                <img
                  src={service.image?.url || service.coverImage}
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-700" />
              </motion.div>

              {/* Content Side */}
              <div className="w-full lg:w-2/5 flex flex-col justify-center lg:py-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <span className="text-[10px] uppercase tracking-[0.4em] text-primary/30 mb-4 block">0{index + 1}</span>
                  <h2 className="text-3xl md:text-5xl font-heading mb-8 leading-tight">{service.title || service.name}</h2>
                  {service.subtitle && (
                    <p className="text-lg font-heading text-primary/80 mb-4 italic">{service.subtitle}</p>
                  )}
                  <p className="text-secondary/70 font-light text-lg leading-relaxed mb-10">
                    {service.description}
                  </p>

                  <div className="mb-12">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/40 mb-6 border-b border-black/20 dark:border-white/5 pb-3">What&apos;s Included</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                      {service.features.map((feature, i) => (
                        <li key={i} className="text-[13px] text-secondary/60 flex items-center gap-3">
                          <span className="w-1 h-1 rounded-full bg-primary/30" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-black/20 dark:border-white/5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-secondary/40 mb-1">Investment From</p>
                      <p className="text-2xl font-heading">{service.price || service.startingPrice}</p>
                    </div>
                    <Link
                      to={`/contact?service=${service.slug}`}
                      className="px-8 py-3 border border-primary/10 hover:border-primary text-[10px] uppercase tracking-[0.2em] transition-all duration-500 rounded-full hover:bg-primary hover:text-on-primary"
                    >
                      BOOK NOW
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="max-w-4xl mx-auto px-6 pt-20 border-t border-black/20 dark:border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-[10px] uppercase tracking-[0.5em] text-primary/40 mb-6 font-semibold">Information</h2>
          <h3 className="text-4xl md:text-6xl font-heading mb-6">Common Inquiries</h3>
        </motion.div>
        <FAQAccordion faqs={faqs} />
      </section>
    </motion.div>
  );
};

export default Services;
