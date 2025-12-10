import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp } from 'lucide-react';

export function MonthlyTicketsChart({ data = [] }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Default data if none provided
  const chartData = data.length > 0 ? data : [
    { month: "Jan", tickets: 124 },
    { month: "Feb", tickets: 156 },
    { month: "Mar", tickets: 189 },
    { month: "Apr", tickets: 210 },
    { month: "May", tickets: 178 },
    { month: "Jun", tickets: 245 },
    { month: "Jul", tickets: 267 },
    { month: "Aug", tickets: 234 },
    { month: "Sep", tickets: 289 },
    { month: "Oct", tickets: 312 },
    { month: "Nov", tickets: 278 },
    { month: "Dec", tickets: 345 },
  ];

  const maxTickets = Math.max(...chartData.map(d => d.tickets || 0));
  const minTickets = Math.min(...chartData.map(d => d.tickets || 0));
  const totalTickets = chartData.reduce((sum, d) => sum + (d.tickets || 0), 0);
  const avgTickets = Math.round(totalTickets / chartData.length);

  // Calculate Y-axis scale (rounded to nearest 50 or 100)
  const getYAxisScale = (max) => {
    if (max <= 50) return 50;
    if (max <= 100) return 100;
    if (max <= 200) return 200;
    if (max <= 500) return Math.ceil(max / 100) * 100;
    return Math.ceil(max / 200) * 200;
  };

  const yAxisMax = getYAxisScale(maxTickets);
  const yAxisSteps = 5;
  const yAxisStep = yAxisMax / yAxisSteps;

  return (
    <div 
      className={cn(
        "bg-white rounded-xl p-6 border-2 border-black shadow-sm hover:shadow-lg transition-all duration-500 relative overflow-hidden",
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      {/* Animated Wave Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50"></div>
        
        {/* Animated waves */}
        <svg 
          className="absolute bottom-0 left-0 w-full" 
          viewBox="0 0 1200 300" 
          preserveAspectRatio="none"
          style={{ height: '100%' }}
        >
          <defs>
            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#93C5FD" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          
          {/* Wave Layer 1 - Main wave */}
          <path
            d="M0,150 Q200,100 400,150 T800,150 T1200,150 L1200,300 L0,300 Z"
            fill="url(#waveGradient1)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -100,0; 0,0"
              dur="12s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Wave Layer 2 - Secondary wave */}
          <path
            d="M0,180 Q250,120 500,180 T1000,180 L1200,180 L1200,300 L0,300 Z"
            fill="url(#waveGradient2)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 80,0; 0,0"
              dur="15s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Wave Layer 3 - Subtle wave */}
          <path
            d="M0,200 Q300,160 600,200 T1200,200 L1200,300 L0,300 Z"
            fill="url(#waveGradient3)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -60,0; 0,0"
              dur="18s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Monthly Ticket Volume</h3>
          <p className="text-xs text-gray-500">Total: {totalTickets.toLocaleString()} tickets • Avg: {avgTickets.toLocaleString()}/month</p>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-medium">+12%</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative z-10">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-10 flex flex-col justify-between pr-2">
          {Array.from({ length: yAxisSteps + 1 }).map((_, i) => {
            const value = yAxisMax - (i * yAxisStep);
            return (
              <span key={i} className="text-[10px] text-gray-500 font-medium text-right">
                {value.toLocaleString()}
              </span>
            );
          })}
        </div>

        {/* Grid lines */}
        <div className="absolute left-10 right-0 top-0 bottom-8 flex flex-col justify-between">
          {Array.from({ length: yAxisSteps }).map((_, i) => (
            <div key={i} className="border-t border-gray-100" />
          ))}
        </div>

        {/* Chart bars */}
        <div className="h-[280px] ml-10 flex items-end justify-between gap-1.5 relative">
          {chartData.map((item, index) => {
            const height = maxTickets > 0 ? (item.tickets / yAxisMax) * 100 : 0;
            const isHovered = hoveredIndex === index;
            const isHighest = item.tickets === maxTickets;
            
            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center justify-end gap-2 group relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                <div 
                  className={cn(
                    "absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-gradient-to-br from-gray-900 to-gray-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 pointer-events-none",
                    isHovered && 'opacity-100'
                  )}
                  style={{ 
                    transform: isHovered ? 'translateX(-50%) translateY(-4px)' : 'translateX(-50%)',
                  }}
                >
                  <div className="font-semibold">{item.tickets.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-300 mt-0.5">tickets in {item.month}</div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>

                {/* Bar */}
                <div 
                  className={cn(
                    "w-full rounded-t-lg transition-all duration-500 relative overflow-hidden",
                    isHovered ? 'shadow-lg scale-105' : 'shadow-md',
                    isHighest && 'ring-2 ring-blue-400 ring-opacity-50'
                  )}
                  style={{ 
                    height: `${height}%`, 
                    minHeight: height > 0 ? '6px' : '0',
                    transitionDelay: `${index * 30}ms`
                  }}
                >
                  {/* Gradient background */}
                  <div 
                    className={cn(
                      "w-full h-full bg-gradient-to-t transition-all duration-300",
                      isHovered 
                        ? "from-blue-600 via-blue-500 to-blue-400" 
                        : "from-blue-500 via-blue-400 to-blue-300"
                    )}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                  
                  {/* Highlight indicator for highest bar */}
                  {isHighest && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
                  )}
                </div>

                {/* Month label */}
                <span 
                  className={cn(
                    "text-[11px] font-medium transition-colors",
                    isHovered ? 'text-blue-600 font-semibold' : 'text-gray-600'
                  )}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

