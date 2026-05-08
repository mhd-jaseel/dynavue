import { Link } from 'react-router-dom';
import { Instagram, Mail, Facebook } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-base pt-24 pb-16 md:pt-32 md:pb-20 px-6 transition-colors duration-500">
      {/* Subtle Top Separation Gradient */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/[0.02] dark:from-white/[0.02] to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-primary/10" />

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
        
        {/* Brand Logo */}
        <Link to="/" className="font-heading text-3xl tracking-[0.3em] uppercase mb-10 hover:opacity-60 transition-opacity">
          Dynavue
        </Link>

        {/* Minimal Navigation */}
        <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4 mb-12">
          {['Home', 'Portfolio', 'Services', 'About', 'Contact'].map((item) => (
            <Link 
              key={item} 
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="text-[10px] uppercase tracking-[0.4em] font-medium text-secondary hover:text-primary transition-all duration-500"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Social Links */}
        <div className="flex gap-8 mb-16">
          <a href="#" className="text-secondary/40 hover:text-primary transition-colors duration-500" aria-label="Instagram">
            <Instagram size={18} strokeWidth={1.5} />
          </a>
          <a href="#" className="text-secondary/40 hover:text-primary transition-colors duration-500" aria-label="Facebook">
            <Facebook size={18} strokeWidth={1.5} />
          </a>
          <a href="mailto:hello@dynavue.in" className="text-secondary/40 hover:text-primary transition-colors duration-500" aria-label="Email">
            <Mail size={18} strokeWidth={1.5} />
          </a>
        </div>

        {/* Legal & Copyright */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-[9px] uppercase tracking-[0.3em] text-secondary/30">
          <p>&copy; {currentYear} Dynavue</p>
          <span className="hidden md:block w-1 h-1 rounded-full bg-secondary/20" />
          <div className="flex gap-6">
            <button className="hover:text-primary transition-colors">Privacy</button>
            <button className="hover:text-primary transition-colors">Terms</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
