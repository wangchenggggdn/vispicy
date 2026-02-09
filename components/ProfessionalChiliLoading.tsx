'use client';

import React from 'react';

interface ProfessionalChiliLoadingProps {
  size?: number;
  className?: string;
  showText?: boolean;
  text?: string;
}

export default function ProfessionalChiliLoading({
  size = 80,
  className = '',
  showText = true,
  text = 'AI is generating...'
}: ProfessionalChiliLoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* 背景光晕效果 */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-orange-500 blur-xl opacity-30"
          style={{
            animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        ></div>

        {/* 旋转圆环 */}
        <svg className="absolute inset-0" style={{ animation: 'spin 2s linear infinite' }}>
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.3"
          />
        </svg>

        {/* 主辣椒图标 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className="absolute inset-2"
          style={{
            animation: 'float 3s ease-in-out infinite'
          }}
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="1" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="1" />
            </linearGradient>
          </defs>

          <style>
            {`
              @keyframes float {
                0%, 100% {
                  transform: translateY(0) rotate(0deg);
                }
                25% {
                  transform: translateY(-3px) rotate(2deg);
                }
                75% {
                  transform: translateY(-5px) rotate(-2deg);
                }
              }
              @keyframes pulse-ring {
                0% {
                  transform: scale(0.8);
                  opacity: 0.5;
                }
                50% {
                  transform: scale(1);
                  opacity: 0.2;
                }
                100% {
                  transform: scale(0.8);
                  opacity: 0.5;
                }
              }
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}
          </style>

          {/* Green stem */}
          <path
            d="M11 4 L11 1.5"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke"
              values="#16a34a;#22c55e;#16a34a"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>

          {/* Green calyx */}
          <path
            d="M11 4 L9 5 L8 3.5 L11 4 Z"
            fill="#16a34a"
          >
            <animate
              attributeName="fill"
              values="#16a34a;#22c55e;#16a34a"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M11 4 L13 5 L14 3.5 L11 4 Z"
            fill="#16a34a"
          >
            <animate
              attributeName="fill"
              values="#16a34a;#22c55e;#16a34a"
              dur="1.5s"
              repeatCount="indefinite"
              begin="0.75s"
            />
          </path>
          <path
            d="M11 4 L11 6"
            stroke="#16a34a"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Chili body */}
          <path
            d="M11 6 C9.5 6 8.5 7 8 8.5 C7 11 7.5 14 9 17 C10 19 12 21 13.5 21 C15 21 16.5 19 17 16 C18 12 17.5 9 16 7 C15 6 13 6 11 6Z"
            fill="url(#gradient)"
            stroke="#b91c1c"
            strokeWidth="0.5"
          >
            <animate
              attributeName="fill"
              values="#dc2626;#ef4444;#f97316;#ef4444;#dc2626"
              dur="4s"
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
              attributeName="opacity"
              values="0.7;1;0.4;0.7"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              values="10;11;10.5;10"
              dur="3s"
              repeatCount="indefinite"
            />
          </ellipse>
        </svg>
      </div>

      {/* 加载文字 */}
      {showText && (
        <p
          className="mt-4 text-sm font-medium bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent animate-pulse"
          style={{
            animationDuration: '2s'
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
}
