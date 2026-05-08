import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQAccordion = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-3xl mx-auto border-t border-border-light">
      {faqs.map((faq, index) => (
        <div key={index} className="border-b border-border-light">
          <button
            onClick={() => toggle(index)}
            className="w-full flex justify-between items-center py-6 text-left"
          >
            <span className="font-heading text-xl pr-8">{faq.question}</span>
            {openIndex === index ? (
              <Minus size={20} className="text-secondary flex-shrink-0" />
            ) : (
              <Plus size={20} className="text-secondary flex-shrink-0" />
            )}
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pb-6 text-secondary font-body font-light leading-relaxed">
                  {faq.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;
