import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PhotographerCard from '../components/about/PhotographerCard';
import api from '../lib/api';
import ImageWithLoader from '../components/common/ImageWithLoader';

const About = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetchContent();
    fetchTeam();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await api.get('/about');
      if (res.data.success) {
        setContent(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch about content', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await api.get('/photographers');
      if (res.data.success && res.data.data.length > 0) {
        setTeam(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch photographers', err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-20">
      
      {/* Hero */}
      <section className="relative w-full h-[60vh]">
        {content?.hero?.image && (
          <img 
            src={content?.hero?.image} 
            alt="Photographer" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 md:p-16">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white text-4xl md:text-6xl lg:text-7xl max-w-4xl"
          >
            {content?.hero?.title || "The Story Behind DYNAVUE"}
          </motion.h1>
        </div>
      </section>

      {/* Bio Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32 flex flex-col md:flex-row gap-12 md:gap-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="md:w-5/12"
        >
          <ImageWithLoader 
            src={content?.bio?.image || "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=800"} 
            alt="Studio" 
            className="w-full h-auto aspect-[3/4] object-cover"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}
          className="md:w-7/12 flex flex-col justify-center"
        >
          <h2 className="text-3xl md:text-5xl mb-8">{content?.bio?.title || "Hello, I'm the eye behind DYNAVUE."}</h2>
          <div className="space-y-6 text-secondary font-light text-lg leading-relaxed">
            {content?.bio?.paragraphs.length > 0 ? (
              content.bio.paragraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <>
                <p>
                  Based in the culturally rich city of Kozhikode, Kerala, DYNAVUE was born out of a profound passion for freezing fleeting moments in time. What started as a hobby exploring the streets with a vintage film camera has blossomed into a lifelong dedication to the art of storytelling through light and shadow.
                </p>
                <p>
                  My approach to photography is deeply rooted in documentary and editorial styles. I don&apos;t just want to take a picture of what happened; I want to capture how it felt. I seek out the quiet, unnoticed moments—the nervous breath before walking down the aisle, the proud tear in a parent&apos;s eye, the uninhibited laughter between friends.
                </p>
                <p>
                  Every couple, every family, every event has a unique rhythm. My goal is to tune into that rhythm and translate it into a visual legacy that will be cherished for generations.
                </p>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Philosophy Pull Quote */}
      <section className="bg-light/30 py-24 px-6 md:px-12 border-y border-border-light text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <p className="font-heading text-3xl md:text-5xl italic leading-tight text-primary">
            &quot;{content?.philosophy?.quote || "We believe that a photograph shouldn't just be seen; it should be felt. It is the closest thing we have to a time machine."}&quot;
          </p>
        </motion.div>
      </section>

      {/* Stats / Numbers */}
      <section className="py-20 border-b border-border-light">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {(content?.stats?.length > 0 ? content.stats : [
            { num: "500+", label: "Weddings" },
            { num: "8", label: "Years Experience" },
            { num: "15+", label: "Cities Travelled" },
            { num: "10k+", label: "Frames Delivered" }
          ]).map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            >
              <p className="text-4xl md:text-5xl font-heading mb-2">{stat.num}</p>
              <p className="text-xs uppercase tracking-widest text-secondary">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gear Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row gap-12">
        <div className="md:w-1/3">
          <h3 className="text-2xl font-heading mb-4 border-b border-border-light pb-4">Our Gear</h3>
          <p className="text-sm text-secondary font-light">We use industry-leading equipment to ensure uncompromising quality in every shot.</p>
        </div>
        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8 font-light text-secondary">
          <div>
            <h4 className="text-primary font-medium tracking-wide uppercase text-sm mb-4">Cameras</h4>
            <ul className="space-y-2">
              {content?.gear?.cameras.length > 0 ? (
                content.gear.cameras.map((cam, i) => <li key={i}>{cam}</li>)
              ) : (
                <>
                  <li>Sony A7RV (x2)</li>
                  <li>Sony A7IV</li>
                  <li>Fujifilm X100V (for candids)</li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-primary font-medium tracking-wide uppercase text-sm mb-4">Lenses</h4>
            <ul className="space-y-2">
              {content?.gear?.lenses.length > 0 ? (
                content.gear.lenses.map((lens, i) => <li key={i}>{lens}</li>)
              ) : (
                <>
                  <li>Sony FE 35mm f/1.4 GM</li>
                  <li>Sony FE 50mm f/1.2 GM</li>
                  <li>Sony FE 85mm f/1.4 GM</li>
                  <li>Sony FE 24-70mm f/2.8 GM II</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Team Section: Behind The Lens */}
      <section className="py-24 px-6 md:px-12 bg-light/30 border-b border-border-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl md:text-5xl font-heading mb-4"
            >
              Behind The Lens
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-secondary font-light text-lg max-w-2xl mx-auto"
            >
              Every perfect shot has a passionate storyteller behind it.
            </motion.p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-white dark:bg-black/20 rounded-[2rem] h-[500px] border border-black/5 dark:border-white/5" />
              ))}
            </div>
          ) : team.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member, i) => (
                <PhotographerCard 
                  key={member._id} 
                  member={member} 
                  index={i} 
                  isFeatured={i === 0} // Make the first photographer featured optionally
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-secondary/60">No team members to display at the moment.</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20">
        <Link to="/contact" className="inline-block px-10 py-4 bg-primary text-white dark:text-black text-sm tracking-widest uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300">
          Let&apos;s Work Together
        </Link>
      </section>

    </motion.div>
  );
};

export default About;
