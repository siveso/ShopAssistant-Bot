import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@shared/schema";

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "default"; // green
    case "processing":
      return "secondary"; // blue
    case "pending":
      return "outline"; // yellow
    case "cancelled":
      return "destructive"; // red
    default:
      return "outline";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function RecentOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <Card className="border border-secondary-200">
      <CardHeader className="p-6 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-800">So'ngi Buyurtmalar</h3>
          <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
            Barchasini Ko'rish
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="w-8 h-8 bg-secondary-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary-200 rounded w-32"></div>
                    <div className="h-3 bg-secondary-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-secondary-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-secondary-500">
              <i className="fas fa-shopping-cart text-2xl mb-2"></i>
              <p>Buyurtmalar topilmadi</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Buyurtma ID
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Mijoz
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Holati
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Jami
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {recentOrders.map((order: Order) => (
                  <tr key={order.id}>
                    <td className="py-4 px-6 text-sm font-medium text-secondary-800">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-primary-700">
                            {order.userId.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-secondary-800">
                          Foydalanuvchi {order.userId.slice(-8)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-secondary-800">
                      ${order.totalPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
