'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const BeatFlowLogo = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-150" />
      
      <svg
        viewBox="0 0 100 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full"
      >
        <defs>
          <linearGradient id="waveformGradient" x1="0" y1="30" x2="100" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff00ff" /> {/* Pink */}
            <stop offset="30%" stopColor="#ff8c00" /> {/* Orange */}
            <stop offset="60%" stopColor="#00d2ff" /> {/* Cyan/Blue */}
            <stop offset="100%" stopColor="#0072ff" /> {/* Deep Blue */}
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* The Waveform Path */}
        <motion.path
          d="M5 35 Q15 35 20 20 T35 30 T50 10 T65 30 T80 20 T95 35"
          stroke="url(#waveformGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Small stars/glimmer as per the photo */}
        {[
          { x: 15, y: 15, s: 1 },
          { x: 45, y: 25, s: 1.2 },
          { x: 75, y: 10, s: 0.8 },
          { x: 85, y: 40, s: 1.1 },
          { x: 10, y: 45, s: 0.9 },
        ].map((star, i) => (
          <motion.circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.s}
            fill="white"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1]
            }}
            transition={{ 
                duration: 2 + i, 
                repeat: Infinity,
                delay: i * 0.5 
            }}
          />
        ))}

        {/* Bottom Arc like in the photo */}
        <path
          d="M10 50 Q50 60 90 50"
          stroke="url(#waveformGradient)"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
