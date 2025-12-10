import { Button } from "@/components/ui/button";
import { Calendar, Download, RefreshCw } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ticket Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor your support ticket metrics</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span>Last 12 months</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
        <Button size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>
    </div>
  );
}
