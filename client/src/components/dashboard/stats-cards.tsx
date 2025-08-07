import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative";
  icon: string;
  iconBg: string;
}

function StatsCard({ title, value, change, changeType, icon, iconBg }: StatsCardProps) {
  return (
    <Card className="p-6 border border-secondary-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="text-2xl font-bold text-secondary-800">{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          <i className={`${icon} text-xl`}></i>
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${
          changeType === "positive" ? "text-green-600" : "text-red-600"
        }`}>
          {changeType === "positive" ? "+" : ""}{change}
        </span>
        <span className="text-secondary-500 text-sm ml-2">o'tgan oyga nisbatan</span>
      </div>
    </Card>
  );
}

export function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 border border-secondary-200">
            <div className="animate-pulse">
              <div className="h-4 bg-secondary-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-secondary-200 rounded w-16 mb-4"></div>
              <div className="h-4 bg-secondary-200 rounded w-32"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Jami Foydalanuvchilar",
      value: stats?.totalUsers || 0,
      change: "12.5%",
      changeType: "positive" as const,
      icon: "fas fa-users text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      title: "Faol Buyurtmalar", 
      value: stats?.activeOrders || 0,
      change: "5.2%",
      changeType: "positive" as const,
      icon: "fas fa-shopping-cart text-orange-600",
      iconBg: "bg-orange-50",
    },
    {
      title: "Bugungi Xabarlar",
      value: stats?.messagesCount || 0,
      change: "18.1%",
      changeType: "positive" as const,
      icon: "fas fa-comments text-green-600",
      iconBg: "bg-green-50",
    },
    {
      title: "Daromad",
      value: `$${stats?.totalRevenue?.toLocaleString() || 0}`,
      change: "23.5%",
      changeType: "positive" as const,
      icon: "fas fa-dollar-sign text-purple-600",
      iconBg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  );
}
