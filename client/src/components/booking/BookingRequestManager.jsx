import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, User, Eye } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const BookingRequestManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/booking-requests/admin/all?status=${statusFilter}`);
      setRequests(res.data.requests);
    } catch (err) {
      console.error('Failed to fetch requests', err);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/booking-requests/${id}/status`, { status });
      toast.success(`Request ${status} successfully`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request');
    }
  };

  const viewRequestDetails = (req) => {
    const booking = req.bookingId || {};
    const user = req.userId || {};
    
    let htmlContent = `
      <div class="text-left space-y-4 text-sm text-secondary">
        <p><span class="font-bold">User:</span> ${user.name || 'N/A'} (${user.email || 'N/A'})</p>
        <p><span class="font-bold">Phone:</span> ${booking.phone || 'N/A'}</p>
        <p><span class="font-bold">Request Type:</span> <span class="uppercase font-bold ${req.requestType === 'edit' ? 'text-blue-600' : 'text-red-600'}">${req.requestType}</span></p>
        <hr class="border-black/5" />
        <p class="font-bold text-primary">Original Booking Details:</p>
        <p><span class="font-bold">Service:</span> ${booking.serviceType || 'N/A'}</p>
        <p><span class="font-bold">Date:</span> ${booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'N/A'}</p>
        <p><span class="font-bold">Venue:</span> ${booking.venue || 'N/A'}</p>
    `;

    if (req.requestType === 'edit' && req.updatedData) {
      const originalDate = booking.eventDate ? new Date(booking.eventDate).toISOString().split('T')[0] : '';
      const updatedDate = req.updatedData.eventDate || '';
      
      const isServiceChanged = req.updatedData.serviceType && req.updatedData.serviceType !== booking.serviceType;
      const isDateChanged = updatedDate && updatedDate !== originalDate;
      const isVenueChanged = req.updatedData.venue && req.updatedData.venue !== booking.venue;
      const isMessageChanged = req.updatedData.message && req.updatedData.message !== booking.message;

      if (isServiceChanged || isDateChanged || isVenueChanged || isMessageChanged) {
        htmlContent += `
          <hr class="border-black/5" />
          <p class="font-bold text-blue-600">Requested Changes:</p>
          ${isServiceChanged ? `<p><span class="font-bold">Service:</span> ${req.updatedData.serviceType}</p>` : ''}
          ${isDateChanged ? `<p><span class="font-bold">Date:</span> ${req.updatedData.eventDate}</p>` : ''}
          ${isVenueChanged ? `<p><span class="font-bold">Venue:</span> ${req.updatedData.venue}</p>` : ''}
          ${isMessageChanged ? `<p><span class="font-bold">Notes:</span> ${req.updatedData.message}</p>` : ''}
        `;
      }
    }

    htmlContent += `</div>`;

    Swal.fire({
      title: 'Request Details',
      html: htmlContent,
      customClass: {
        popup: 'bg-white border border-black/5 rounded-[2.5rem] p-10 shadow-xl max-w-[90%] md:max-w-[500px]',
        title: 'text-2xl font-heading text-primary mb-6',
        confirmButton: 'bg-primary text-on-primary px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/5'
      },
      buttonsStyling: false,
      background: '#ffffff',
      color: '#000000',
    });
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-black/5">
        <h3 className="text-sm uppercase tracking-widest font-bold">Booking Requests</h3>
        <div className="flex p-1 bg-light rounded-xl">
          {['pending', 'approved', 'rejected'].map((s) => (
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

      {/* Requests List */}
      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold">Loading Requests...</p>
          </div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 text-[10px] uppercase tracking-[0.2em] text-secondary/40">
                  <th className="px-8 py-6 font-bold">Type</th>
                  <th className="px-8 py-6 font-bold">User</th>
                  <th className="px-8 py-6 font-bold">Booking Details</th>
                  <th className="px-8 py-6 font-bold">Requested Changes</th>
                  <th className="px-8 py-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {requests.map(req => (
                  <tr key={req._id} className="hover:bg-light/30 transition-colors group">
                    <td className="px-8 py-5">
                      <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-bold ${req.requestType === 'edit' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {req.requestType}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold">{req.userId?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-secondary/40">{req.userId?.email || 'N/A'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold">{req.bookingId?.serviceType || 'Deleted Booking'}</p>
                      <p className="text-[10px] text-secondary/40">{req.bookingId?.eventDate ? new Date(req.bookingId.eventDate).toLocaleDateString() : 'N/A'}</p>
                    </td>
                    <td className="px-8 py-5 text-xs font-light">
                      {req.requestType === 'edit' && req.updatedData ? (
                        <div className="space-y-1">
                          {req.updatedData.eventDate && <p><span className="font-bold">Date:</span> {req.updatedData.eventDate}</p>}
                          {req.updatedData.serviceType && <p><span className="font-bold">Service:</span> {req.updatedData.serviceType}</p>}
                          {req.updatedData.venue && <p><span className="font-bold">Venue:</span> {req.updatedData.venue}</p>}
                          {req.updatedData.message && <p><span className="font-bold">Notes:</span> {req.updatedData.message}</p>}
                        </div>
                      ) : (
                        <span className="text-secondary/40">Cancellation Requested</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right space-x-2">
                      <button
                        onClick={() => viewRequestDetails(req)}
                        className="p-2 text-secondary/30 hover:text-primary transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(req._id, 'approved')}
                            className="p-2 text-secondary/30 hover:text-green-600 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(req._id, 'rejected')}
                            className="p-2 text-secondary/30 hover:text-red-600 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <Clock size={48} className="mx-auto mb-4 text-secondary/20" />
            <h3 className="text-xl font-heading text-primary/40">No requests found</h3>
            <p className="text-[10px] uppercase tracking-widest text-secondary/30 font-bold mt-2">All caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingRequestManager;
