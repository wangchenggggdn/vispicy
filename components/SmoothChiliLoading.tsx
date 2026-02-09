'use client';

import React, { useEffect, useRef } from 'react';

interface SmoothChiliLoadingProps {
  size?: number;
  className?: string;
  showText?: boolean;
  text?: string;
}

export default function SmoothChiliLoading({
  size = 96,
  className = '',
  showText = true,
  text = 'AI is generating...'
}: SmoothChiliLoadingProps) {
  const chiliRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const svg = chiliRef.current;
    if (!svg) return;

    let startTime: number | null = null;
    const duration = 2000; // 2秒一个循环

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;

      const elapsed = currentTime - startTime;
      const progress = (elapsed % duration) / duration;

      // 从绿色到红色的颜色渐变
      const colorProgress = (Math.sin(progress * Math.PI * 2) + 1) / 2;
      const bodyElement = svg.querySelector('[data-chili="body"]') as SVGPathElement;
      if (bodyElement) {
        // 绿色 #16a34a (22, 163, 74) -> 红色 #dc2626 (220, 38, 38)
        const r = Math.floor(22 + colorProgress * (220 - 22));
        const g = Math.floor(163 + colorProgress * (38 - 163));
        const b = Math.floor(74 + colorProgress * (38 - 74));
        bodyElement.setAttribute('fill', `rgb(${r}, ${g}, ${b})`);
      }

      // 高光动画
      const shineElement = svg.querySelector('[data-chili="shine"]') as SVGEllipseElement;
      if (shineElement) {
        const shineProgress = (elapsed % 1500) / 1500;
        const newCx = 10 + Math.sin(shineProgress * Math.PI * 2) * 1;
        shineElement.setAttribute('cx', newCx.toString());

        const opacity = 0.5 + Math.sin(shineProgress * Math.PI * 2) * 0.5;
        shineElement.setAttribute('opacity', opacity.toString());
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* 背景光晕 */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-40"
          style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #dc2626 100%)',
            animation: 'glow-pulse 2s ease-in-out infinite'
          }}
        ></div>

        <style>
          {`
            @keyframes glow-pulse {
              0%, 100% {
                opacity: 0.2;
                transform: scale(1);
              }
              50% {
                opacity: 0.4;
                transform: scale(1.1);
              }
            }
          `}
        </style>

        {/* SVG 图标 */}
        <svg
          ref={chiliRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className="relative z-10 w-full h-full"
        >
          {/* Green stem */}
          <path
            d="M11 4 L11 1.5"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Green calyx */}
          <path d="M11 4 L9 5 L8 3.5 L11 4 Z" fill="#16a34a" />
          <path d="M11 4 L13 5 L14 3.5 L11 4 Z" fill="#16a34a" />
          <path d="M11 4 L11 6" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />

          {/* Chili pepper body with dynamic fill */}
          <path
            data-chili="body"
            d="M11 6 C9.5 6 8.5 7 8 8.5 C7 11 7.5 14 9 17 C10 19 12 21 13.5 21 C15 21 16.5 19 17 16 C18 12 17.5 9 16 7 C15 6 13 6 11 6Z"
            fill="#16a34a"
            stroke="#b91c1c"
            strokeWidth="0.5"
          />

          {/* Highlight curve */}
          <path
            d="M9.5 9 C9 11 9.5 13 10.5 15"
            stroke="#fca5a5"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />

          {/* Small shine spot */}
          <ellipse
            data-chili="shine"
            cx="10"
            cy="11"
            rx="0.8"
            ry="1.2"
            fill="#fecaca"
            opacity="0.7"
          />
        </svg>

        {/* 底部阴影 */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 rounded-full blur-sm"
          style={{
            background: 'rgba(0,0,0,0.2)',
            animation: 'shadow-scale 2s ease-in-out infinite'
          }}
        ></div>

        <style>
          {`
            @keyframes shadow-scale {
              0%, 100% {
                transform: translateX(-50%) scale(1);
                opacity: 0.3;
              }
              50% {
                transform: translateX(-50%) scale(1.2);
                opacity: 0.5;
              }
            }
          `}
        </style>
      </div>

      {/* 加载文字 */}
      {showText && (
        <p className="mt-4 text-sm font-medium bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent">
          {text}
        </p>
      )}
    </div>
  );
}
