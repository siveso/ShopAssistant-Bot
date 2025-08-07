import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Translation, InsertTranslation } from "@shared/schema";

export default function Translations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "bot" | "admin" | "messages">("all");
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [showNewTranslationForm, setShowNewTranslationForm] = useState(false);
  const [newTranslation, setNewTranslation] = useState<InsertTranslation>({
    key: "",
    uz: "",
    ru: "",
    category: "bot"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch translations
  const { data: translations = [], isLoading } = useQuery({
    queryKey: ["/api/translations"],
    queryFn: async () => {
      const response = await fetch("/api/translations", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch translations');
      return response.json() as Promise<Translation[]>;
    }
  });

  // Update translation mutation
  const updateTranslationMutation = useMutation({
    mutationFn: async (data: { id: string; translation: Partial<InsertTranslation> }) => {
      const response = await fetch(`/api/translations/${data.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data.translation)
      });
      if (!response.ok) throw new Error('Failed to update translation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/translations"] });
      setEditingTranslation(null);
      toast({ title: "Muvaffaqiyat", description: "Tarjima yangilandi" });
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Tarjimani yangilashda xatolik yuz berdi", variant: "destructive" });
    }
  });

  // Create translation mutation
  const createTranslationMutation = useMutation({
    mutationFn: async (translation: InsertTranslation) => {
      const response = await fetch("/api/translations", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(translation)
      });
      if (!response.ok) throw new Error('Failed to create translation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/translations"] });
      setShowNewTranslationForm(false);
      setNewTranslation({ key: "", uz: "", ru: "", category: "bot" });
      toast({ title: "Muvaffaqiyat", description: "Yangi tarjima qo'shildi" });
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Tarjimani yaratishda xatolik yuz berdi", variant: "destructive" });
    }
  });

  // Delete translation mutation
  const deleteTranslationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/translations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to delete translation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/translations"] });
      toast({ title: "Muvaffaqiyat", description: "Tarjima o'chirildi" });
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Tarjimani o'chirishda xatolik yuz berdi", variant: "destructive" });
    }
  });

  // Mock translations for demo if no data
  const mockTranslations: Translation[] = [
    {
      id: "mock-1",
      key: "welcome_message",
      uz: "Assalomu alaykum! Bizning online do'konimizga xush kelibsiz!",
      ru: "Здравствуйте! Добро пожаловать в наш интернет-магазин!",
      category: "bot",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "mock-2",
      key: "catalog_button",
      uz: "📦 Katalog",
      ru: "📦 Каталог",
      category: "bot",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "mock-3",
      key: "cart_button",
      uz: "🛒 Savatcha",
      ru: "🛒 Корзина", 
      category: "bot",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "mock-4",
      key: "contact_button",
      uz: "📞 Biz bilan aloqa",
      ru: "📞 Связь с нами",
      category: "bot",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "mock-5",
      key: "order_success",
      uz: "✅ Buyurtmangiz qabul qilindi!",
      ru: "✅ Ваш заказ принят!",
      category: "messages",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "mock-6",
      key: "cart_empty",
      uz: "🛒 Savatingiz bo'sh. Katalogdan mahsulot tanlang!",
      ru: "🛒 Ваша корзина пуста. Выберите товары из каталога!",
      category: "messages",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "mock-7",
      key: "products_title",
      uz: "Mahsulotlar",
      ru: "Товары",
      category: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "mock-8",
      key: "orders_title",
      uz: "Buyurtmalar",
      ru: "Заказы",
      category: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "mock-9",
      key: "users_title", 
      uz: "Foydalanuvchilar",
      ru: "Пользователи",
      category: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Use real data if available, otherwise fallback to mock
  const currentTranslations = translations.length > 0 ? translations : mockTranslations;

  const categories = [
    { key: "all", label: "Barchasi", count: currentTranslations.length },
    { key: "bot", label: "Bot", count: currentTranslations.filter(t => t.category === "bot").length },
    { key: "admin", label: "Admin Panel", count: currentTranslations.filter(t => t.category === "admin").length },
    { key: "messages", label: "Xabarlar", count: currentTranslations.filter(t => t.category === "messages").length }
  ];

  const filteredTranslations = currentTranslations.filter(translation => {
    const matchesSearch = translation.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         translation.uz.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         translation.ru.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || translation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveTranslation = () => {
    if (!editingTranslation) return;
    
    updateTranslationMutation.mutate({
      id: editingTranslation.id,
      translation: {
        key: editingTranslation.key,
        uz: editingTranslation.uz,
        ru: editingTranslation.ru,
        category: editingTranslation.category
      }
    });
  };

  const handleCreateTranslation = () => {
    if (!newTranslation.key || !newTranslation.uz || !newTranslation.ru) {
      toast({ title: "Xatolik", description: "Barcha maydonlar to'ldirilishi kerak", variant: "destructive" });
      return;
    }
    
    createTranslationMutation.mutate(newTranslation);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-secondary-800">Tarjimalar</h1>
        <Button 
          onClick={() => setShowNewTranslationForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
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
                  onChange={(e) => setEditingTranslation({
                    ...editingTranslation,
                    uz: e.target.value
                  })}
                  rows={3}
                  className="border-secondary-300"
                />
              </div>
              <div>
                <Label htmlFor="edit-ru">Ruscha</Label>
                <Textarea
                  id="edit-ru" 
                  value={editingTranslation.ru}
                  onChange={(e) => setEditingTranslation({
                    ...editingTranslation,
                    ru: e.target.value
                  })}
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
                <Button 
                  onClick={handleSaveTranslation}
                  disabled={updateTranslationMutation.isPending}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {updateTranslationMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}