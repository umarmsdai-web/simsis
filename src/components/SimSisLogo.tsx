import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'light' | 'dark' | 'brand';
}

export const SimSisLogo: React.FC<LogoProps> = ({
  className = '',
  size = 48,
  variant = 'brand',
}) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl shadow-sm overflow-hidden select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="simsisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Background shield/squircle */}
        <rect width="100" height="100" rx="24" fill="url(#simsisGrad)" />

        {/* Academic Cap / Toga top edge */}
        <path
          d="M50 20L78 32L50 44L22 32L50 20Z"
          fill="#ffffff"
          opacity="0.95"
        />
        {/* Toga Cap Base */}
        <path
          d="M32 37V48C32 54 40 59 50 59C60 59 68 54 68 48V37L50 45L32 37Z"
          fill="#dbeafe"
          opacity="0.9"
        />
        {/* Tassel */}
        <path
          d="M75 33V47C75 49 72 50 72 50"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Golden Savings Coin */}
        <circle cx="50" cy="72" r="18" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="50" cy="72" r="14" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="2 2" />

        {/* Currency symbol 'Rp' / 'S' monogram */}
        <text
          x="50"
          y="77"
          fill="#78350f"
          fontSize="13"
          fontWeight="900"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          S
        </text>
      </svg>
    </div>
  );
};
