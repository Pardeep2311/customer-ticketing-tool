import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { MonthlyTicketsChart } from "@/components/dashboard/MonthlyTicketsChart";
import { CustomerTicketsTable } from "@/components/dashboard/CustomerTicketsTable";
import { RecentTickets } from "@/components/dashboard/RecentTickets";
import { Ticket, CheckCircle, Clock, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Tickets"
            value="2,847"
            change="+12.5% from last month"
            changeType="positive"
            icon={Ticket}
            delay={0}
          />
          <MetricCard
            title="Resolved"
            value="2,156"
            change="75.7% resolution rate"
            changeType="positive"
            icon={CheckCircle}
            delay={50}
          />
          <MetricCard
            title="Pending"
            value="691"
            change="24.3% of total"
            changeType="neutral"
            icon={Clock}
            delay={100}
          />
          <MetricCard
            title="Avg Response"
            value="2.4h"
            change="-18% improvement"
            changeType="positive"
            icon={TrendingUp}
            delay={150}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MonthlyTicketsChart />
          <CustomerTicketsTable />
        </div>

        {/* Recent Tickets */}
        <RecentTickets />
      </div>
    </div>
  );
};

export default Index;
