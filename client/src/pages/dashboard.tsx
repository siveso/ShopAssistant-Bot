import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { BotActivity } from "@/components/dashboard/bot-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function Dashboard() {
  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="mb-8">
        <StatsCards />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders - Takes 2/3 of the width */}
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>

        {/* Bot Activity - Takes 1/3 of the width */}
        <div className="lg:col-span-1">
          <BotActivity />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions />
      </div>

      {/* Language and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary-800">Tillar Taqsimoti</h3>
              <select className="text-sm border border-secondary-300 rounded-lg px-3 py-1">
                <option>Oxirgi 7 kun</option>
                <option>Oxirgi 30 kun</option>
                <option>Oxirgi 90 kun</option>
              </select>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-secondary-800">O'zbekcha (Uzbek)</span>
                </div>
                <span className="text-sm font-medium text-secondary-800">67%</span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "67%" }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-secondary-800">Русский (Russian)</span>
                </div>
                <span className="text-sm font-medium text-secondary-800">33%</span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: "33%" }}></div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-secondary-200">
              <p className="text-xs text-secondary-500">Til tanlagan foydalanuvchilar: 1,089</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary-800">Tizim Holati</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Barcha Tizimlar Faol</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">Telegram Bot API</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-600">Faol</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">Instagram Graph API</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-600">Faol</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">Gemini 1.5 Flash API</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-600">Faol</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">PostgreSQL Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-600">Faol</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">Core Bot Logic</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-600">Faol</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
