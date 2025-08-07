import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ActivityBarProps {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

function ActivityBar({ label, value, color, percentage }: ActivityBarProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm text-secondary-600">{label}</span>
        <span className="text-sm font-medium text-secondary-800">{value}</span>
      </div>
      <div className="w-full bg-secondary-200 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </>
  );
}

export function BotActivity() {
  const { data: botStatus } = useQuery({
    queryKey: ["/api/bot/status"],
    refetchInterval: 30000,
  });

  // Mock activity data - in real app this would come from analytics API
  const activityData = [
    { label: "Telegram Messages", value: 245, color: "bg-blue-600", percentage: 72 },
    { label: "Instagram Messages", value: 97, color: "bg-pink-600", percentage: 28 },
    { label: "AI Responses", value: 189, color: "bg-green-600", percentage: 55 },
    { label: "Rule-based Responses", value: 153, color: "bg-orange-600", percentage: 45 },
  ];

  const connections = [
    { name: "Gemini API", status: "Ulangan", color: "green" },
    { name: "Ma'lumotlar Bazasi", status: "Ulangan", color: "green" },
    { name: "Telegram Bot", status: botStatus?.telegram ? "Ulangan" : "Ulanmagan", color: botStatus?.telegram ? "green" : "red" },
  ];

  return (
    <Card className="border border-secondary-200">
      <CardHeader className="p-6 border-b border-secondary-200">
        <h3 className="text-lg font-semibold text-secondary-800">Bot Faoliyati</h3>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activityData.map((item, index) => (
            <div key={index} className="space-y-2">
              <ActivityBar {...item} />
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-secondary-200">
          {connections.map((connection, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm mt-2">
              <div className={`w-2 h-2 rounded-full ${
                connection.color === "green" ? "bg-green-500" : "bg-red-500"
              }`}></div>
              <span className="text-secondary-600">{connection.name}:</span>
              <span className={`font-medium ${
                connection.color === "green" ? "text-green-600" : "text-red-600"
              }`}>
                {connection.status}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
