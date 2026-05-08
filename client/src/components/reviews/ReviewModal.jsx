import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Upload, Send, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import Swal from 'sweetalert2';

const ReviewModal = ({ isOpen, onClose, userName, reviewToEdit, onReviewUpdated }) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (reviewToEdit) {
      setRating(reviewToEdit.rating);
      setReviewText(reviewToEdit.review);
    } else {
      setRating(5);
      setReviewText('');
    }
  }, [reviewToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reviewText.length < 10) {
      Swal.fire({ title: 'Info', text: 'Please share a bit more detail (min 10 characters)', icon: 'info' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (reviewToEdit) {
        await api.put('/reviews/my-review', {
          review: reviewText,
          rating: rating,
        });
      } else {
        await api.post('/reviews', {
          name: userName,
          review: reviewText,
          rating: rating,
        });
      }
      setIsSuccess(true);
      if (onReviewUpdated) onReviewUpdated();
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setReviewText('');
        setRating(5);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit review', err);
      Swal.fire({ title: 'Error', text: 'Failed to submit review. Please try again.', icon: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-white dark:bg-[#121212] rounded-[3rem] border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="absolute right-8 top-8">
              <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-secondary dark:text-white/40">
                <X size={20} />
              </button>
            </div>

            <div className="p-12">
              {!isSuccess ? (
                <>
                  <div className="mb-10 text-center">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-primary/40 dark:text-white/30 font-bold mb-3">Share Your Experience</p>
                    <h2 className="text-4xl font-heading text-primary dark:text-white">Write a Review</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Star Rating */}
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-secondary/40 dark:text-white/20">How would you rate us?</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-125 duration-300"
                          >
                            <Star 
                              size={32} 
                              className={`${
                                (hoveredRating || rating) >= star 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-black/5 dark:text-white/10'
                              } transition-colors`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30 dark:text-white/20 ml-1">Your Testimonial</label>
                      <textarea
                        required
                        placeholder="Tell us about your experience..."
                        className="w-full bg-transparent border border-black/5 dark:border-white/10 rounded-[2rem] p-6 min-h-[150px] focus:outline-none focus:border-primary dark:focus:border-white transition-all text-sm font-light dark:text-white"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full group flex items-center justify-center gap-4 bg-primary text-on-primary px-10 py-5 rounded-full uppercase tracking-widest text-[11px] font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin"></div>
                      ) : (
                        <>Submit Review <Send size={16} /></>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-12 text-center flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-8"
                  >
                    <CheckCircle size={40} />
                  </motion.div>
                  <h3 className="text-3xl font-heading text-primary dark:text-white mb-4">Thank You!</h3>
                  <p className="text-secondary/40 text-[10px] uppercase tracking-[0.2em] font-bold max-w-xs leading-relaxed dark:text-white/20">Your review has been submitted and is currently awaiting moderation.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
