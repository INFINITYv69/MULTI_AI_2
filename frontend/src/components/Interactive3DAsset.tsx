import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';

export default function Interactive3DAsset() {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (!clicked) {
      setClicked(true);
      setTimeout(() => setClicked(false), 1500); // 1.5s explosion duration
    }
  };

  return (
    <div className="relative flex justify-center items-center w-full z-0 h-full">
      {/* Dedicated floating container */}
      <motion.div 
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative cursor-pointer group"
        onClick={handleClick}
      >

        {/* 3D Image rendering - Massive Background Size */}
        <motion.img 
          src="/3d_business_team.png" 
          alt="3D Animated Team" 
          className="w-full max-w-[900px] object-cover mix-blend-screen opacity-[0.15] group-hover:opacity-40 transition-all duration-700 pointer-events-auto"
          style={{ filter: 'contrast(1.15) brightness(1.1)' }} 
          animate={clicked ? { 
            scale: [1, 1.05, 1], 
            filter: [
              "contrast(1.15) brightness(1.1)", 
              "contrast(1.5) brightness(2.5)", 
              "contrast(1.15) brightness(1.1)"
            ] 
          } : { scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Glitter Frame & Fireworks (Pure Framer Motion) */}
        <AnimatePresence>
          {clicked && (
            <>
              {/* Radiating Glitter Stars */}
              {Array.from({ length: 40 }).map((_, i) => {
                const angle = (Math.PI * 2 * i) / 40;
                // Randomize distance for burst depth
                const distance = 160 + Math.random() * 140; 
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                    animate={{ 
                      opacity: [1, 1, 0], 
                      scale: [0, Math.random() * 2 + 0.5, 0], 
                      x: Math.cos(angle) * distance, 
                      y: Math.sin(angle) * distance,
                      rotate: Math.random() * 360
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 text-yellow-300 z-50 pointer-events-none"
                    style={{ 
                      marginTop: '-12px', 
                      marginLeft: '-12px',
                    }}
                  >
                    <Star className={`w-6 h-6 ${i % 2 === 0 ? 'fill-yellow-200' : 'fill-white'} blur-[1px] shadow-[0_0_15px_rgba(255,255,255,0.8)]`} />
                  </motion.div>
                );
              })}
              
              {/* Center Bright Flash Core */}
              <motion.div
                initial={{ opacity: 1, scale: 0.5 }}
                animate={{ opacity: 0, scale: 5 }}
                transition={{ duration: 0.7 }}
                className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[40px] pointer-events-none z-0"
              />
            </>
          )}
        </AnimatePresence>
        
        {/* Constant Floating Ambient Glow on Hover */}
        <div className="absolute inset-0 bg-primary/40 blur-[90px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full -z-10 pointer-events-none" />
      </motion.div>
    </div>
  );
}
