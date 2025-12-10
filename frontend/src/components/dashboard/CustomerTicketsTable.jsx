import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

export function CustomerTicketsTable({ customers = [], title = 'Tickets by Customer' }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Default data if none provided
  const customerData = customers.length > 0 ? customers : [
    { name: "Acme Corporation", tickets: 87 },
    { name: "TechStart Inc", tickets: 64 },
    { name: "Global Solutions", tickets: 52 },
    { name: "DataFlow Systems", tickets: 45 },
    { name: "CloudNine Services", tickets: 38 },
    { name: "Innovate Labs", tickets: 31 },
    { name: "Digital Dynamics", tickets: 28 },
    { name: "Smart Systems Co", tickets: 24 },
  ];

  const maxTickets = Math.max(...customerData.map(c => c.tickets || 0));

  return (
    <div 
      className={cn(
        "bg-white rounded-xl p-6 border-2 border-black shadow-sm hover:shadow-lg transition-all duration-500 relative overflow-hidden",
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      {/* Animated Wave Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50"></div>
        <svg 
          className="absolute bottom-0 left-0 w-full" 
          viewBox="0 0 1200 300" 
          preserveAspectRatio="none"
          style={{ height: '100%' }}
        >
          <defs>
            <linearGradient id="companyTicketsWave1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="companyTicketsWave2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#93C5FD" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M0,150 Q200,100 400,150 T800,150 T1200,150 L1200,300 L0,300 Z"
            fill="url(#companyTicketsWave1)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -100,0; 0,0"
              dur="12s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M0,180 Q250,120 500,180 T1000,180 L1200,180 L1200,300 L0,300 Z"
            fill="url(#companyTicketsWave2)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 80,0; 0,0"
              dur="15s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-6 relative z-10">{title}</h3>
      <div className="space-y-4 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {customerData.map((customer, index) => {
          const percentage = maxTickets > 0 ? (customer.tickets / maxTickets) * 100 : 0;
          
          return (
            <div 
              key={customer.name || index} 
              className="group space-y-2 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:border-blue-300 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              {/* Blue gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-blue-400/15 group-hover:to-blue-500/10 transition-all duration-300"></div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <div className="flex items-center justify-between relative z-10">
                <span className="text-sm font-medium text-gray-700 truncate pr-2 group-hover:text-blue-700 transition-colors">
                  {customer.name}
                </span>
                <span className="text-sm font-semibold text-blue-600 whitespace-nowrap group-hover:text-blue-700 transition-colors">
                  {customer.tickets}
                </span>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200 relative z-10">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 transition-all duration-500 relative overflow-hidden group-hover:from-blue-600 group-hover:via-blue-500 group-hover:to-blue-600"
                  style={{ width: `${percentage}%` }}
                >
                  {/* Shimmer effect on progress bar */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

