import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = 'w-6 h-6' }: LogoProps) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="washops-grad-logo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        <mask id="droplet-mask-logo">
          <rect width="100" height="100" fill="white" />
          <circle cx="50" cy="62" r="18" fill="black" />
        </mask>
      </defs>
      <path 
        d="M50 10C50 10 82 45 82 65C82 82.67 67.67 97 50 97C32.33 97 18 82.67 18 65C18 45 50 10 50 10Z" 
        fill="url(#washops-grad-logo)" 
        mask="url(#droplet-mask-logo)" 
      />
      <path 
        d="M38 58C41 55 45 55 48 58C51 61 55 61 58 58C61 55 65 55 68 58" 
        stroke="url(#washops-grad-logo)" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M38 66C41 63 45 63 48 66C51 69 55 69 58 66C61 63 65 63 68 66" 
        stroke="url(#washops-grad-logo)" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
