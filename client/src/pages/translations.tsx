import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Translation {
  key: string;
  uz: string;
  ru: string;
  category: string;
}

export default function Translations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "bot" | "admin" | "messages">("all");
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);

  // Mock translations data
  const translations: Translation[] = [
    {
      key: "welcome_message",
      uz: "Assalomu alaykum! Bizning online do'konimizga xush kelibsiz!",
      ru: "Здравствуйте! Добро пожаловать в наш интернет-магазин!",
      category: "bot"
    },
    {
      key: "catalog_button",
      uz: "📦 Katalog",
      ru: "📦 Каталог",
      category: "bot"
    },
    {
      key: "cart_button",
      uz: "🛒 Savatcha",
      ru: "🛒 Корзина", 
      category: "bot"
    },
    {
      key: "contact_button",
      uz: "📞 Biz bilan aloqa",
      ru: "📞 Связь с нами",
      category: "bot"
    },
    {
      key: "order_success",
      uz: "✅ Buyurtmangiz qabul qilindi!",
      ru: "✅ Ваш заказ принят!",
      category: "messages"
    },
    {
      key: "cart_empty",
      uz: "🛒 Savatingiz bo'sh. Katalogdan mahsulot tanlang!",
      ru: "🛒 Ваша корзина пуста. Выберите товары из каталога!",
      category: "messages"
    },
    {
      key: "products_title",
      uz: "Mahsulotlar",
      ru: "Товары",
      category: "admin"
    },
    {
      key: "orders_title",
      uz: "Buyurtmalar",
      ru: "Заказы",
      category: "admin"
    },
    {
      key: "users_title", 
      uz: "Foydalanuvchilar",
      ru: "Пользователи",
      category: "admin"
    }
  ];

  const categories = [
    { key: "all", label: "Barchasi", count: translations.length },
    { key: "bot", label: "Bot", count: translations.filter(t => t.category === "bot").length },
    { key: "admin", label: "Admin Panel", count: translations.filter(t => t.category === "admin").length },
    { key: "messages", label: "Xabarlar", count: translations.filter(t => t.category === "messages").length }
  ];

  const filteredTranslations = translations.filter(translation => {
    const matchesSearch = translation.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         translation.uz.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         translation.ru.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || translation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-secondary-800">Tarjimalar</h1>
        <Button className="bg-primary-600 hover:bg-primary-700 text-white">
          <i className="fas fa-plus mr-2"></i>
          Yangi Tarjima
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Tarjima qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-secondary-300"
              />
            </div>
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key as any)}
                  className="flex items-center gap-1"
                >
                  {category.label}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translations List */}
      <div className="grid gap-4">
        {filteredTranslations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-secondary-500">
                <i className="fas fa-language text-4xl mb-4"></i>
                <h3 className="text-lg font-medium mb-2">Tarjima topilmadi</h3>
                <p className="text-sm">
                  {searchQuery ? "Qidiruv so'zini o'zgartirib ko'ring" : "Hali tarjimalar qo'shilmagan"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTranslations.map((translation) => (
            <Card key={translation.key} className="border border-secondary-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-base font-medium">
                      {translation.key}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {translation.category}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTranslation(translation)}
                  >
                    <i className="fas fa-edit mr-1"></i>
                    Tahrirlash
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-secondary-600 mb-1 block">
                      🇺🇿 O'zbekcha
                    </Label>
                    <div className="p-3 bg-secondary-50 rounded-md text-sm">
                      {translation.uz}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-secondary-600 mb-1 block">
                      🇷🇺 Ruscha
                    </Label>
                    <div className="p-3 bg-secondary-50 rounded-md text-sm">
                      {translation.ru}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Translation Modal */}
      {editingTranslation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Tarjimani Tahrirlash</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-key">Kalit</Label>
                <Input
                  id="edit-key"
                  value={editingTranslation.key}
                  disabled
                  className="bg-secondary-50"
                />
              </div>
              <div>
                <Label htmlFor="edit-uz">O'zbekcha</Label>
                <Textarea
                  id="edit-uz"
                  value={editingTranslation.uz}
                  rows={3}
                  className="border-secondary-300"
                />
              </div>
              <div>
                <Label htmlFor="edit-ru">Ruscha</Label>
                <Textarea
                  id="edit-ru" 
                  value={editingTranslation.ru}
                  rows={3}
                  className="border-secondary-300"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingTranslation(null)}
                >
                  Bekor qilish
                </Button>
                <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                  Saqlash
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}