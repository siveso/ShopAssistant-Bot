import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const filteredOrders = orders?.filter((order: Order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-secondary-800">Buyurtmalar</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            Jami: {orders?.length || 0}
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800">
            Kutilayotgan: {orders?.filter((o: Order) => o.orderStatus === "pending").length || 0}
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Buyurtma ID yoki Foydalanuvchi ID bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-secondary-300"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 border-secondary-300">
                <SelectValue placeholder="Holat bo'yicha filtr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha Holatlar</SelectItem>
                <SelectItem value="pending">Kutilayotgan</SelectItem>
                <SelectItem value="processing">Qayta Ishlanayotgan</SelectItem>
                <SelectItem value="completed">Tugallangan</SelectItem>
                <SelectItem value="cancelled">Bekor Qilingan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border border-secondary-200">
        <CardHeader className="p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-800">Buyurtmalarni Boshqarish</h3>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border-b border-secondary-200">
                    <div className="w-24 h-4 bg-secondary-200 rounded"></div>
                    <div className="w-32 h-4 bg-secondary-200 rounded"></div>
                    <div className="w-24 h-4 bg-secondary-200 rounded"></div>
                    <div className="w-20 h-6 bg-secondary-200 rounded-full"></div>
                    <div className="w-16 h-4 bg-secondary-200 rounded"></div>
                    <div className="w-32 h-8 bg-secondary-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-secondary-500">
                <i className="fas fa-shopping-cart text-4xl mb-4"></i>
                <h3 className="text-lg font-medium mb-2">Buyurtma topilmadi</h3>
                <p className="text-sm">
                  {searchQuery || statusFilter !== "all" 
                    ? "Qidiruv yoki filtrni o'zgartirib ko'ring" 
                    : "Mijozlar buyurtma berishni boshlagandan keyin bu yerda ko'rinadi"}
                </p>
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
                      Mahsulot
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Soni
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Jami
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Holati
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Sana
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {filteredOrders.map((order: Order) => (
                    <tr key={order.id} className="hover:bg-secondary-50">
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
                      <td className="py-4 px-6 text-sm text-secondary-600">
                        Mahsulot {order.productId.slice(-8)}
                      </td>
                      <td className="py-4 px-6 text-sm text-secondary-800">
                        {order.quantity}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-secondary-800">
                        ${order.totalPrice}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-secondary-600">
                        {formatDate(order.createdAt || "")}
                      </td>
                      <td className="py-4 px-6">
                        <Select 
                          value={order.orderStatus} 
                          onValueChange={(value) => handleStatusUpdate(order.id, value)}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs border-secondary-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Kutilayotgan</SelectItem>
                            <SelectItem value="processing">Qayta ishlanayotgan</SelectItem>
                            <SelectItem value="completed">Tugallangan</SelectItem>
                            <SelectItem value="cancelled">Bekor qilingan</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
