import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, Trash2, Search, Filter,
  Star, MessageSquare, Clock, User, ImageIcon
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, searchTerm]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reviews/admin/all?status=${statusFilter}&search=${searchTerm}`);
      setReviews(res.data.reviews);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/reviews/${id}/status`, { status });
      toast.success(`Review ${status} successfully`);
      fetchReviews();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review permanently?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review deleted');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="space-y-8">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-black/5">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/30" size={18} />
            <input
              type="text"
              placeholder="Search by name or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-light rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <div className="flex p-1 bg-light rounded-xl">
            {['all', 'pending', 'approved', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all ${statusFilter === s ? 'bg-white shadow-sm text-primary' : 'text-secondary/40 hover:text-primary'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold">Accessing Archive...</p>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review, idx) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-light overflow-hidden flex-shrink-0 border border-black/5">
                    {review.image || review.user?.profilePic ? (
                      <img
                        src={review.image || review.user?.profilePic}
                        alt={review.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/10">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-heading">{review.name}</h4>
                      <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-bold ${review.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                          review.status === 'approved' ? 'bg-green-50 text-green-600' :
                            'bg-red-50 text-red-600'
                        }`}>
                        {review.status}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-black/5'}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-secondary/70 leading-relaxed font-light italic max-w-2xl">
                      "{review.review}"
                    </p>
                    <p className="text-[10px] text-secondary/30 uppercase tracking-widest font-bold pt-2">
                      Submitted on {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex lg:flex-col items-center justify-center gap-3 border-t lg:border-t-0 lg:border-l border-black/5 pt-6 lg:pt-0 lg:pl-8 flex-shrink-0">
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => updateStatus(review._id, 'approved')}
                      className="flex-1 lg:w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-green-600 hover:text-white transition-all"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => updateStatus(review._id, 'rejected')}
                      className="flex-1 lg:w-full flex items-center justify-center gap-2 bg-yellow-50 text-yellow-600 px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-yellow-600 hover:text-white transition-all"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-32 text-center bg-white rounded-3xl border border-dashed border-black/10">
            <MessageSquare size={48} className="mx-auto mb-6 text-black/5" />
            <h3 className="text-xl font-heading text-primary/40">No reviews found</h3>
            <p className="text-[10px] uppercase tracking-widest text-secondary/30 font-bold mt-2">Adjust your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManager;
