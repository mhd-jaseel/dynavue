import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, User, Camera } from 'lucide-react';
import api from '../../lib/api';

const BookingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/enquiries');
      const enquiries = res.data.enquiries || res.data || [];
      
      const mappedBookings = {};
      enquiries.forEach(enq => {
        if (enq.eventDate) {
          const date = new Date(enq.eventDate).toISOString().split('T')[0];
          mappedBookings[date] = {
            status: enq.status === 'confirmed' ? 'confirmed' : 'pending',
            client: enq.name,
            service: enq.serviceType
          };
        }
      });
      setBookings(mappedBookings);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };
  
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const days = [];
  const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  // Padding for start of month
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  // Bookings are fetched from API

  return (
    <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-2xl font-heading mb-1">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold">Booking Schedule</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-light rounded-full transition-colors"><ChevronLeft size={20} /></button>
          <button onClick={nextMonth} className="p-2 hover:bg-light rounded-full transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-black/5 rounded-2xl overflow-hidden border border-black/5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="bg-[#FBFBFB] py-4 text-center text-[10px] uppercase tracking-widest font-bold text-secondary/40">
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
          const booking = day ? bookings[dateStr] : null;

          return (
            <div key={i} className={`bg-white min-h-[120px] p-4 relative group hover:bg-light/30 transition-colors ${!day ? 'bg-[#FDFDFD]' : ''}`}>
              {day && (
                <>
                  <span className={`text-xs font-medium ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? 'w-6 h-6 bg-primary text-on-primary rounded-full flex items-center justify-center' : 'text-secondary/60'}`}>
                    {day}
                  </span>
                  
                  {booking && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`mt-2 p-2 rounded-lg text-[9px] font-bold uppercase tracking-tighter border ${
                        booking.status === 'confirmed' ? 'bg-green-50 border-green-200 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      <p className="truncate mb-1">{booking.client}</p>
                      <div className="flex items-center gap-1 opacity-60">
                        <Camera size={10} /> {booking.service}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex flex-wrap gap-6 border-t border-black/5 pt-8">
        {[
          { color: 'bg-green-500', label: 'Confirmed' },
          { color: 'bg-yellow-500', label: 'Pending' },
          { color: 'bg-red-500', label: 'Unavailable' },
          { color: 'bg-primary', label: 'Today' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="text-[10px] uppercase tracking-widest font-bold text-secondary/40">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingCalendar;
