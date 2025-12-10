import { cn } from "@/lib/utils";

const customers = [
  { name: "Acme Corporation", tickets: 87, colorClass: "bg-chart-1" },
  { name: "TechStart Inc", tickets: 64, colorClass: "bg-chart-2" },
  { name: "Global Solutions", tickets: 52, colorClass: "bg-chart-3" },
  { name: "DataFlow Systems", tickets: 45, colorClass: "bg-chart-4" },
  { name: "CloudNine Services", tickets: 38, colorClass: "bg-chart-5" },
  { name: "Innovate Labs", tickets: 31, colorClass: "bg-chart-1" },
  { name: "Digital Dynamics", tickets: 28, colorClass: "bg-chart-2" },
  { name: "Smart Systems Co", tickets: 24, colorClass: "bg-chart-3" },
];

const maxTickets = Math.max(...customers.map(c => c.tickets));

export function CustomerTicketsTable() {
  return (
    <div className="gradient-card rounded-lg p-6 border border-border/50 opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-6">Tickets by Customer</h3>
      <div className="space-y-4">
        {customers.map((customer) => (
          <div key={customer.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{customer.name}</span>
              <span className="text-sm font-semibold text-primary">{customer.tickets}</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div 
                className={cn("h-full rounded-full transition-all", customer.colorClass)}
                style={{ width: `${(customer.tickets / maxTickets) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
