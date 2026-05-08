const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./src/models/Service');

dotenv.config();

const services = [
  { 
    title: 'Wedding Photography', 
    subtitle: 'Timeless Elegance',
    description: 'Capturing your most precious moments with timeless elegance and soulful storytelling.', 
    image: { url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200', cloudinaryId: '' }, 
    slug: 'wedding',
    price: '85,000',
    features: ['10 Hours of Coverage', 'Full Day Cinematography', 'Premium Leather Album', '800+ Edited Images', 'Online Gallery Access'],
    order: 0,
    featuredOnHome: true,
    visibility: true
  },
  { 
    title: 'Engagement & Pre-Wedding', 
    subtitle: 'Cinematic Romance',
    description: 'Celebrating the beginning of your beautiful journey together in cinematic locations.', 
    image: { url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=1200', cloudinaryId: '' }, 
    slug: 'engagement',
    price: '35,000',
    features: ['4 Hours Session', 'Two Location Shoots', 'Cinematic Teaser Video', '100+ Edited Images', 'Social Media Ready Files'],
    order: 1,
    featuredOnHome: true,
    visibility: true
  },
  { 
    title: 'Editorial Portraits', 
    subtitle: 'Authentic Self',
    description: 'Professional portraits that reveal your authentic self with architectural precision.', 
    image: { url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=1200', cloudinaryId: '' }, 
    slug: 'portrait',
    price: '15,000',
    features: ['Studio or Location Shoot', 'Multiple Look Changes', 'Creative Art Direction', '15 High-End Retouched Images', 'Full Usage Rights'],
    order: 2,
    featuredOnHome: true,
    visibility: true
  },
  { 
    title: 'Events & Celebrations', 
    subtitle: 'Milestone Memories',
    description: 'Complete documentation of your special celebrations and milestone events.', 
    image: { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200', cloudinaryId: '' }, 
    slug: 'events',
    price: '25,000',
    features: ['Continuous Event Coverage', 'Candid Moment Capture', 'Highlights Video', 'Unlimited High-Res Images', '2 Week Turnaround'],
    order: 3,
    featuredOnHome: true,
    visibility: true
  },
  { 
    title: 'Candid & Lifestyle', 
    subtitle: 'Unscripted Emotions',
    description: 'Unscripted emotions and real moments beautifully captured in their natural state.', 
    image: { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200', cloudinaryId: '' }, 
    slug: 'candid',
    price: '20,000',
    features: ['Non-Intrusive Shooting', 'Authentic Lifestyle Vibe', 'Natural Lighting Focus', '50+ Story-Driven Images', 'Post-Production Grading'],
    order: 4,
    featuredOnHome: true,
    visibility: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dynavue');
    console.log('MongoDB Connected...');
    
    await Service.deleteMany({});
    console.log('Cleared existing services.');

    await Service.insertMany(services);
    console.log('Successfully seeded services!');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
