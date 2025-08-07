import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@shared/schema";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "telegram":
      return "fab fa-telegram";
    case "instagram":
      return "fab fa-instagram";
    default:
      return "fas fa-user";
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case "telegram":
      return "bg-blue-100 text-blue-800";
    case "instagram":
      return "bg-pink-100 text-pink-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getLanguageFlag = (language: string) => {
  switch (language) {
    case "uz":
      return "🇺🇿";
    case "ru":
      return "🇷🇺";
    default:
      return "🌐";
  }
};

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const filteredUsers = users?.filter((user: User) => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber?.includes(searchQuery) ||
      user.platformId.includes(searchQuery);
    
    const matchesPlatform = platformFilter === "all" || user.platformType === platformFilter;
    const matchesLanguage = languageFilter === "all" || user.languageCode === languageFilter;
    
    return matchesSearch && matchesPlatform && matchesLanguage;
  }) || [];

  const stats = {
    total: users?.length || 0,
    telegram: users?.filter((u: User) => u.platformType === "telegram").length || 0,
    instagram: users?.filter((u: User) => u.platformType === "instagram").length || 0,
    uzbek: users?.filter((u: User) => u.languageCode === "uz").length || 0,
    russian: users?.filter((u: User) => u.languageCode === "ru").length || 0,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-secondary-800">Foydalanuvchilar</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            Jami: {stats.total}
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            <i className="fab fa-telegram mr-1"></i>
            {stats.telegram}
          </Badge>
          <Badge className="bg-pink-100 text-pink-800">
            <i className="fab fa-instagram mr-1"></i>
            {stats.instagram}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border border-secondary-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Jami Foydalanuvchilar</p>
                <p className="text-2xl font-bold text-secondary-800">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-blue-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-secondary-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Telegram Foydalanuvchilari</p>
                <p className="text-2xl font-bold text-secondary-800">{stats.telegram}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <i className="fab fa-telegram text-blue-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-secondary-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">O'zbekcha</p>
                <p className="text-2xl font-bold text-secondary-800">{stats.uzbek}</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <span className="text-lg">🇺🇿</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-secondary-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Русский</p>
                <p className="text-2xl font-bold text-secondary-800">{stats.russian}</p>
              </div>
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <span className="text-lg">🇷🇺</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Ism, telefon yoki platforma ID bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-secondary-300"
              />
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-48 border-secondary-300">
                <SelectValue placeholder="Platforma bo'yicha filtr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha Platformalar</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-48 border-secondary-300">
                <SelectValue placeholder="Til bo'yicha filtr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha Tillar</SelectItem>
                <SelectItem value="uz">O'zbekcha</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border border-secondary-200">
        <CardHeader className="p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-800">Foydalanuvchilarni Boshqarish</h3>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border-b border-secondary-200">
                    <div className="w-10 h-10 bg-secondary-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="w-32 h-4 bg-secondary-200 rounded"></div>
                      <div className="w-24 h-3 bg-secondary-200 rounded"></div>
                    </div>
                    <div className="w-20 h-6 bg-secondary-200 rounded-full"></div>
                    <div className="w-16 h-6 bg-secondary-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-secondary-500">
                <i className="fas fa-users text-4xl mb-4"></i>
                <h3 className="text-lg font-medium mb-2">Foydalanuvchi topilmadi</h3>
                <p className="text-sm">
                  {searchQuery || platformFilter !== "all" || languageFilter !== "all"
                    ? "Qidiruv yoki filtrni o'zgartirib ko'ring"
                    : "Foydalanuvchilar botdan foydalanishni boshlaganda bu yerda ko'rinadi"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Foydalanuvchi
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Platforma
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Platforma ID
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Til
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Telefon
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Qo'shilgan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {filteredUsers.map((user: User) => (
                    <tr key={user.id} className="hover:bg-secondary-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-primary-700">
                              {user.fullName 
                                ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
                                : user.platformId.slice(0, 2).toUpperCase()
                              }
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-secondary-800">
                              {user.fullName || "Noma'lum Foydalanuvchi"}
                            </div>
                            <div className="text-xs text-secondary-500">
                              ID: {user.id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(user.platformType)}`}>
                          <i className={`${getPlatformIcon(user.platformType)} mr-1`}></i>
                          {user.platformType.charAt(0).toUpperCase() + user.platformType.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-secondary-600">
                        {user.platformId}
                      </td>
                      <td className="py-4 px-6">
                        <span className="flex items-center text-sm text-secondary-800">
                          <span className="mr-2">{getLanguageFlag(user.languageCode || "")}</span>
                          {user.languageCode === "uz" ? "O'zbekcha" : user.languageCode === "ru" ? "Русский" : "Unknown"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-secondary-600">
                        {user.phoneNumber || "Ko'rsatilmagan"}
                      </td>
                      <td className="py-4 px-6 text-sm text-secondary-600">
                        {formatDate(user.createdAt || "")}
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
