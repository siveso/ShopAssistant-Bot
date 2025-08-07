import { useSidebar } from "@/hooks/use-sidebar";
import { useQuery } from "@tanstack/react-query";

export function Topbar() {
  const { toggle } = useSidebar();

  const { data: botStatus } = useQuery({
    queryKey: ["/api/bot/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <header className="bg-white border-b border-secondary-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            className="lg:hidden text-secondary-600 hover:text-secondary-800"
            onClick={toggle}
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <h1 className="text-2xl font-semibold text-secondary-800">Boshqaruv Paneli</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Bot Status Indicator */}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            botStatus?.status === "online" 
              ? "bg-green-50" 
              : "bg-red-50"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              botStatus?.status === "online" 
                ? "bg-green-500" 
                : "bg-red-500"
            }`}></div>
            <span className={`text-sm font-medium ${
              botStatus?.status === "online" 
                ? "text-green-700" 
                : "text-red-700"
            }`}>
              Bot {botStatus?.status === "online" ? "Faol" : "O'chiq"}
            </span>
          </div>
          
          {/* Notifications */}
          <div className="flex items-center space-x-2 text-secondary-600">
            <i className="fas fa-bell"></i>
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">AD</span>
            </div>
            <span className="text-sm font-medium text-secondary-800">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
