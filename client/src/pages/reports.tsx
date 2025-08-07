import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";

interface ReportData {
  orders: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  products: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  users: Array<{
    date: string;
    newUsers: number;
    totalUsers: number;
  }>;
  platforms: Array<{
    platform: string;
    orders: number;
    percentage: number;
  }>;
}

export default function Reports() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [reportType, setReportType] = useState<"orders" | "products" | "users" | "platforms">("orders");

  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ["/api/reports", reportType, dateRange],
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  // Mock data for demonstration
  const mockData: ReportData = {
    orders: [
      { date: "01.01", count: 12, revenue: 1200 },
      { date: "02.01", count: 15, revenue: 1500 },
      { date: "03.01", count: 8, revenue: 800 },
      { date: "04.01", count: 22, revenue: 2200 },
      { date: "05.01", count: 18, revenue: 1800 },
      { date: "06.01", count: 25, revenue: 2500 },
      { date: "07.01", count: 30, revenue: 3000 },
    ],
    products: [
      { name: "Chidamli axlat paketlari", sales: 45, revenue: 2250 },
      { name: "Premium kiyim", sales: 32, revenue: 9600 },
      { name: "Elektronika", sales: 18, revenue: 5400 },
      { name: "Uy buyumlari", sales: 25, revenue: 3750 },
      { name: "Kitoblar", sales: 12, revenue: 600 },
    ],
    users: [
      { date: "01.01", newUsers: 5, totalUsers: 120 },
      { date: "02.01", newUsers: 8, totalUsers: 128 },
      { date: "03.01", newUsers: 3, totalUsers: 131 },
      { date: "04.01", newUsers: 12, totalUsers: 143 },
      { date: "05.01", newUsers: 7, totalUsers: 150 },
      { date: "06.01", newUsers: 10, totalUsers: 160 },
      { date: "07.01", newUsers: 15, totalUsers: 175 },
    ],
    platforms: [
      { platform: "Telegram", orders: 85, percentage: 68 },
      { platform: "Instagram", orders: 40, percentage: 32 },
    ]
  };

  const currentData = reportData || mockData;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const getTotalStats = () => {
    switch (reportType) {
      case "orders":
        const totalOrders = currentData.orders.reduce((sum, item) => sum + item.count, 0);
        const totalRevenue = currentData.orders.reduce((sum, item) => sum + item.revenue, 0);
        return { label1: "Jami buyurtmalar", value1: totalOrders, label2: "Jami daromad", value2: `$${totalRevenue}` };
      case "products":
        const totalSales = currentData.products.reduce((sum, item) => sum + item.sales, 0);
        const avgRevenue = currentData.products.reduce((sum, item) => sum + item.revenue, 0) / currentData.products.length;
        return { label1: "Jami sotuvlar", value1: totalSales, label2: "O'rtacha daromad", value2: `$${avgRevenue.toFixed(0)}` };
      case "users":
        const newUsers = currentData.users.reduce((sum, item) => sum + item.newUsers, 0);
        const totalUsers = currentData.users[currentData.users.length - 1]?.totalUsers || 0;
        return { label1: "Yangi foydalanuvchilar", value1: newUsers, label2: "Jami foydalanuvchilar", value2: totalUsers };
      case "platforms":
        const totalPlatformOrders = currentData.platforms.reduce((sum, item) => sum + item.orders, 0);
        const topPlatform = currentData.platforms[0]?.platform || "N/A";
        return { label1: "Jami buyurtmalar", value1: totalPlatformOrders, label2: "Top platforma", value2: topPlatform };
      default:
        return { label1: "", value1: 0, label2: "", value2: "" };
    }
  };

  const stats = getTotalStats();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-secondary-800">Hisobotlar</h1>
        <div className="flex items-center space-x-3">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
          <Button variant="outline">
            <i className="fas fa-download mr-2"></i>
            Eksport
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Select value={reportType} onValueChange={(value) => setReportType(value as any)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Hisobot turini tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orders">Buyurtmalar</SelectItem>
                <SelectItem value="products">Mahsulotlar</SelectItem>
                <SelectItem value="users">Foydalanuvchilar</SelectItem>
                <SelectItem value="platforms">Platformalar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">{stats.label1}</p>
                <p className="text-2xl font-bold text-secondary-800">{stats.value1}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <i className="fas fa-chart-line text-primary-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">{stats.label2}</p>
                <p className="text-2xl font-bold text-secondary-800">{stats.value2}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Davr</p>
                <p className="text-sm font-medium text-secondary-800">
                  {dateRange?.from && dateRange?.to && 
                    `${format(dateRange.from, 'dd.MM.yyyy')} - ${format(dateRange.to, 'dd.MM.yyyy')}`
                  }
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <i className="fas fa-calendar text-blue-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Status</p>
                <Badge variant="default" className="bg-green-500">Faol</Badge>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <i className="fas fa-activity text-orange-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {reportType === "orders" && "Buyurtmalar Dinamikasi"}
              {reportType === "products" && "Top Mahsulotlar"}
              {reportType === "users" && "Foydalanuvchilar O'sishi"}
              {reportType === "platforms" && "Platformalar bo'yicha Taqsimot"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <i className="fas fa-spinner fa-spin text-2xl text-secondary-400"></i>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {reportType === "orders" && (
                    <LineChart data={currentData.orders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  )}
                  {reportType === "products" && (
                    <BarChart data={currentData.products}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#8884d8" />
                    </BarChart>
                  )}
                  {reportType === "users" && (
                    <LineChart data={currentData.users}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="newUsers" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  )}
                  {reportType === "platforms" && (
                    <PieChart>
                      <Pie
                        data={currentData.platforms}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="orders"
                        label={({ platform, percentage }: any) => `${platform}: ${percentage}%`}
                      >
                        {currentData.platforms.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {reportType === "orders" && "Daromad Dinamikasi"}
              {reportType === "products" && "Mahsulotlar Daromadi"}
              {reportType === "users" && "Jami Foydalanuvchilar"}
              {reportType === "platforms" && "Platform Statistikasi"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportType === "platforms" ? (
              <div className="space-y-4">
                {currentData.platforms.map((platform, index) => (
                  <div key={platform.platform} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full`} style={{backgroundColor: COLORS[index]}}></div>
                      <span className="font-medium">{platform.platform}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{platform.orders}</div>
                      <div className="text-sm text-secondary-600">{platform.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {reportType === "orders" && (
                    <LineChart data={currentData.orders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  )}
                  {reportType === "products" && (
                    <BarChart data={currentData.products}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#82ca9d" />
                    </BarChart>
                  )}
                  {reportType === "users" && (
                    <LineChart data={currentData.users}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="totalUsers" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}