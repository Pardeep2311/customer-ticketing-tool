import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tickets = [
  { id: "TKT-1234", customer: "Acme Corporation", subject: "Login issue with SSO", status: "open", priority: "high", time: "2h ago" },
  { id: "TKT-1233", customer: "TechStart Inc", subject: "API rate limiting concerns", status: "in-progress", priority: "medium", time: "4h ago" },
  { id: "TKT-1232", customer: "Global Solutions", subject: "Dashboard loading slowly", status: "open", priority: "low", time: "5h ago" },
  { id: "TKT-1231", customer: "DataFlow Systems", subject: "Export feature not working", status: "resolved", priority: "high", time: "6h ago" },
  { id: "TKT-1230", customer: "CloudNine Services", subject: "Billing discrepancy", status: "in-progress", priority: "medium", time: "8h ago" },
];

const statusStyles = {
  open: "bg-warning/20 text-warning border-warning/30",
  "in-progress": "bg-primary/20 text-primary border-primary/30",
  resolved: "bg-success/20 text-success border-success/30",
};

const priorityStyles = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground border-border",
};

export function RecentTickets() {
  return (
    <div className="gradient-card rounded-lg p-6 border border-border/50 opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-6">Recent Tickets</h3>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div 
            key={ticket.id} 
            className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-mono text-primary">{ticket.id}</span>
                <Badge variant="outline" className={cn("text-xs", statusStyles[ticket.status as keyof typeof statusStyles])}>
                  {ticket.status}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", priorityStyles[ticket.priority as keyof typeof priorityStyles])}>
                  {ticket.priority}
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
              <p className="text-xs text-muted-foreground mt-1">{ticket.customer}</p>
            </div>
            <span className="text-xs text-muted-foreground ml-4">{ticket.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
