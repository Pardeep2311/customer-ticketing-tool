import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
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

export function MonthlyTicketsChart() {
  return (
    <div className="gradient-card rounded-lg p-6 border border-border/50 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-6">Monthly Ticket Volume</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 25%)" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="hsl(215 20% 65%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(215 20% 65%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(217 33% 17%)",
                border: "1px solid hsl(217 33% 25%)",
                borderRadius: "8px",
                color: "hsl(210 40% 98%)",
              }}
              cursor={{ fill: "hsl(217 33% 22% / 0.5)" }}
            />
            <Bar 
              dataKey="tickets" 
              fill="hsl(174 72% 56%)" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
