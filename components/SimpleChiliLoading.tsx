'use client';

import React from 'react';

interface SimpleChiliLoadingProps {
  size?: number;
  className?: string;
  showText?: boolean;
  text?: string;
}

export default function SimpleChiliLoading({
  size = 48,
  className = '',
  showText = false,
  text = 'Loading...'
}: SimpleChiliLoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* 动画容器 */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className="w-full h-full"
          style={{
            animation: 'bounce 1s ease-in-out infinite, rotate 3s ease-in-out infinite'
          }}
        >
          <style>
            {`
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
              }
              @keyframes rotate {
                0%, 100% { transform: rotate(-8deg); }
                50% { transform: rotate(8deg); }
              }
              @keyframes pulse-scale {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
              }
            `}
          </style>

          {/* Green stem */}
          <path d="M11 4 L11 1.5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>

          {/* Green calyx */}
          <path d="M11 4 L9 5 L8 3.5 L11 4 Z" fill="#16a34a" style={{ animation: 'pulse-scale 2s ease-in-out infinite' }}/>
          <path d="M11 4 L13 5 L14 3.5 L11 4 Z" fill="#16a34a" style={{ animation: 'pulse-scale 2s ease-in-out infinite 0.1s' }}/>
          <path d="M11 4 L11 6" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>

          {/* Chili pepper body */}
          <path
            d="M11 6 C9.5 6 8.5 7 8 8.5 C7 11 7.5 14 9 17 C10 19 12 21 13.5 21 C15 21 16.5 19 17 16 C18 12 17.5 9 16 7 C15 6 13 6 11 6Z"
            fill="#dc2626"
            stroke="#b91c1c"
            strokeWidth="0.5"
          >
            <animate
              attributeName="fill"
              values="#dc2626;#ef4444;#f87171;#ef4444;#dc2626"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>

          {/* Highlight */}
          <path
            d="M9.5 9 C9 11 9.5 13 10.5 15"
            stroke="#fca5a5"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />

          {/* Shine spot */}
          <ellipse
            cx="10"
            cy="11"
            rx="0.8"
            ry="1.2"
            fill="#fecaca"
            opacity="0.7"
          >
            <animate
              attributeName="cx"
              values="10;10.5;10.5;10"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.7;1;0.5;0.7"
              dur="2s"
              repeatCount="indefinite"
            />
          </ellipse>
        </svg>
      </div>

      {/* 可选的加载文字 */}
      {showText && (
        <p className="mt-3 text-sm font-medium text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
