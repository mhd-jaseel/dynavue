import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const FireHero = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [sparks, setSparks] = useState([]);
  const prefersReducedMotion = useReducedMotion();



  const title = "DYNAVUE";

  return (
    <div className="relative w-full h-[100dvh] bg-base overflow-hidden flex flex-col items-center justify-center transition-colors duration-500">
      {/* Animations removed, keeping clean background */}

      <style>{`
        @keyframes letterBlur {
          0%   { opacity: 0; filter: blur(18px); transform: scale(1.15) translateY(8px); }
          40%  { opacity: 1; filter: blur(5px);  transform: scale(1.04) translateY(2px); }
          100% { opacity: 1; filter: blur(0px);  transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Text Reveal Layer */}
      <div className="relative z-30 flex flex-col items-center text-primary mt-12 px-4 text-center">
        <h1 className="flex space-x-[2px] md:space-x-2 text-5xl md:text-8xl font-crake tracking-widest">
          {title.split('').map((char, index) => (
            <span
              key={index}
              className="inline-block"
              style={{
                animation: `letterBlur 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                animationDelay: `${0.8 + index * 0.09}s`,
                opacity: 0
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 1.9 }}
          className="w-16 md:w-32 h-px bg-primary my-6"
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.9 }}
          className="font-body font-light tracking-wider text-sm md:text-lg text-secondary"
        >
          Every Frame. Every Feeling.
        </motion.p>


      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3.1 }}
        className="absolute bottom-12 md:bottom-10 z-30 flex flex-col items-center opacity-70"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-primary mb-3 rotate-90 md:rotate-0 origin-center md:mb-2">Scroll</span>
        <motion.div
          animate={{ height: ["0%", "100%", "0%"], top: ["0%", "0%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-primary/30 relative overflow-hidden"
        >
          <motion.div className="absolute left-0 w-full bg-primary" />
        </motion.div>
      </motion.div>

      {/* Bottom Gradient Fade for Section Blending */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-base to-transparent z-20 pointer-events-none" />
    </div>
  );
};

export default FireHero;
