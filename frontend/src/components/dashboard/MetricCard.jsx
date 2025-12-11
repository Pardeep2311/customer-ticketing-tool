import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  delay = 0,
  onClick,
  clickable = false
}) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Generate unique ID for each card's wave gradient
  const cardId = `metric-card-${title.replace(/\s+/g, '-').toLowerCase()}`;

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "bg-white rounded-xl p-6 border-2 border-black shadow-sm hover:shadow-lg transition-all duration-500 relative overflow-hidden group",
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        clickable && onClick && 'cursor-pointer hover:border-blue-500 hover:scale-[1.02]'
      )}
    >
      {/* Animated Wave Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50"></div>
        
        {/* Animated waves */}
        <svg 
          className="absolute bottom-0 left-0 w-full" 
          viewBox="0 0 400 200" 
          preserveAspectRatio="none"
          style={{ height: '100%' }}
        >
          <defs>
            <linearGradient id={`waveGradient1-${cardId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id={`waveGradient2-${cardId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#93C5FD" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id={`waveGradient3-${cardId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          
          {/* Wave Layer 1 - Main wave */}
          <path
            d="M0,100 Q100,50 200,100 T400,100 L400,200 L0,200 Z"
            fill={`url(#waveGradient1-${cardId})`}
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -50,0; 0,0"
              dur="10s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Wave Layer 2 - Secondary wave */}
          <path
            d="M0,120 Q125,80 250,120 T400,120 L400,200 L0,200 Z"
            fill={`url(#waveGradient2-${cardId})`}
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 40,0; 0,0"
              dur="12s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Wave Layer 3 - Subtle wave */}
          <path
            d="M0,140 Q150,110 300,140 L400,140 L400,200 L0,200 Z"
            fill={`url(#waveGradient3-${cardId})`}
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -30,0; 0,0"
              dur="14s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
            {value}
          </p>
          {change && (
            <p className={cn(
              "text-xs font-medium",
              changeType === "positive" && "text-green-600",
              changeType === "negative" && "text-red-600",
              changeType === "neutral" && "text-gray-500"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

