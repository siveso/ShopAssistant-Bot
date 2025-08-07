import { useSidebar } from "@/hooks/use-sidebar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Menu, Bell, User } from "lucide-react";

export function Topbar() {
  const { toggle } = useSidebar();
  const { admin } = useAuth();

  const { data: botStatus } = useQuery({
    queryKey: ["/api/bot/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Type guard for bot status
  const statusData = botStatus as { status?: string } | undefined;

  return (
    <header className="bg-white border-b border-secondary-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            className="lg:hidden text-gray-600 hover:text-gray-800"
            onClick={toggle}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">Boshqaruv Paneli</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Bot Status Indicator */}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            statusData?.status === "online" 
              ? "bg-green-50" 
              : "bg-red-50"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              statusData?.status === "online" 
                ? "bg-green-500" 
                : "bg-red-500"
            }`}></div>
            <span className={`text-sm font-medium ${
              statusData?.status === "online" 
                ? "text-green-700" 
                : "text-red-700"
            }`}>
              Bot {statusData?.status === "online" ? "Faol" : "O'chiq"}
            </span>
          </div>
          
          {/* Notifications */}
          <div className="flex items-center space-x-2 text-gray-600">
            <Bell className="w-5 h-5" />
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              {admin?.fullName ? (
                <span className="text-white text-sm font-medium">
                  {admin.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-800">
              {admin?.fullName || 'Administrator'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
