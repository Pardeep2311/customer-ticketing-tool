import React from 'react';
import Button from '../ui/button';
import { Calendar, Download, RefreshCw } from 'lucide-react';

export function DashboardHeader({ onRefresh, onExport, dateRange = 'Last 12 months' }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ticket Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitor your support ticket metrics</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 btn-daterange-gradient text-sm">
          <Calendar className="h-4 w-4" />
          <span>{dateRange}</span>
        </button>
        <button 
          className="flex items-center gap-2 btn-refresh-gradient text-sm"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
        <button className="flex items-center gap-2 btn-export-gradient text-sm" onClick={onExport}>
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
}

