import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoGallery from '../components/gallery/PhotoGallery';
import api from '../lib/api';

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['All']);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [galleryRes, catRes] = await Promise.all([
          api.get('/galleries'),
          api.get('/categories')
        ]);
        if (galleryRes.data?.data?.length > 0) setGalleries(galleryRes.data.data);
        
        if (catRes.data?.data?.length > 0) {
          const dynamicCats = catRes.data.data.map(c => c.name);
          setCategories(['All', ...dynamicCats]);
        }
      } catch (err) {
        console.error('Error fetching portfolio data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabChange = (cat) => {
    setActiveTab(cat);
    setCurrentPage(1);
  };

  const filteredGalleries = activeTab === 'All' 
    ? galleries 
    : galleries.filter(g => g.category?.toLowerCase() === activeTab.toLowerCase());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-base transition-colors duration-500 ease-out">
      {/* Luxury Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6 md:px-12 bg-base flex flex-col items-center justify-center border-b border-border-light">
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: '80px' }}
          transition={{ duration: 1 }}
          className="w-px bg-primary/20 absolute top-0 left-1/2 -translate-x-1/2"
        />
        <motion.h1 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-heading text-center mb-6 tracking-tight text-primary"
        >
          Curated Stories
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-secondary tracking-[0.2em] uppercase text-xs md:text-sm text-center max-w-2xl font-light"
        >
          A visual archive of love, life, and legacy
        </motion.p>
      </section>

      {/* Main Content */}
      <div className="py-16 md:py-24 px-4 md:px-8 max-w-[1800px] mx-auto">
        {/* Elegant Category Pills */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-20">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => handleTabChange(cat)}
              className={`px-8 py-3 rounded-full text-[11px] md:text-xs tracking-[0.15em] uppercase transition-all duration-500 ease-out ${
                activeTab === cat 
                  ? 'bg-primary text-on-primary shadow-xl shadow-primary/10 scale-105' 
                  : 'bg-base text-secondary border border-border-light hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Gallery Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {filteredGalleries.length > 0 ? (
              <>
                <PhotoGallery galleries={filteredGalleries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} />
                
                {/* Pagination Controls */}
                {filteredGalleries.length > itemsPerPage && (
                  <div className="flex justify-center gap-2 mt-16">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-6 py-2.5 bg-base text-secondary border border-border-light rounded-full text-[11px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    {[...Array(Math.ceil(filteredGalleries.length / itemsPerPage))].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                          currentPage === i + 1
                            ? 'bg-primary text-on-primary shadow-lg shadow-primary/10'
                            : 'bg-base text-secondary border border-border-light hover:border-primary hover:text-primary'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredGalleries.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredGalleries.length / itemsPerPage)}
                      className="px-6 py-2.5 bg-base text-secondary border border-border-light rounded-full text-[11px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-40">
                <span className="text-4xl text-border-light mb-6 opacity-50">✧</span>
                <p className="text-secondary font-light tracking-widest uppercase text-xs">Curating soon...</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Portfolio;
