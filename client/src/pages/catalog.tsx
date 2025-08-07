import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Search, Filter, Star } from "lucide-react";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { useCart } from "@/hooks/useCart";
import { useSEO } from "@/hooks/useSEO";

interface Product {
  id: string;
  nameUz: string;
  nameRu: string;
  descriptionUz?: string;
  descriptionRu?: string;
  price: string;
  stockQuantity: number;
  imageUrl?: string;
  category?: string;
  isActive: boolean;
}

export default function Catalog() {
  const [language, setLanguage] = useState<"uz" | "ru">("uz");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { addToCart } = useCart();
  
  // SEO optimization
  useSEO('catalog', undefined, language);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
    select: (data: Product[]) => data.filter(product => product.isActive)
  });

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const filteredProducts = products.filter(product => {
    const name = language === "uz" ? product.nameUz : product.nameRu;
    const description = language === "uz" ? product.descriptionUz : product.descriptionRu;
    
    const matchesSearch = !searchTerm || 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (description && description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getText = (uz: string, ru: string) => language === "uz" ? uz : ru;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{getText("Yuklanmoqda...", "Загрузка...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                {getText("Bizning Do'kon", "Наш Магазин")}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/about">
                <Button variant="ghost" size="sm">
                  {getText("Biz haqimizda", "О нас")}
                </Button>
              </Link>
              <CartSidebar language={language} />
              <Select value={language} onValueChange={(value: "uz" | "ru") => setLanguage(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uz">🇺🇿 O'zbekcha</SelectItem>
                  <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">
              {getText("Sifatli Mahsulotlar", "Качественные Товары")}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {getText("Eng yaxshi narxlarda zamonaviy texnologiyalar", "Современные технологии по лучшим ценам")}
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={getText("Mahsulot qidirish...", "Поиск товаров...")}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="md:w-48">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{getText("Barcha kategoriyalar", "Все категории")}</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category || ""}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const name = language === "uz" ? product.nameUz : product.nameRu;
            const description = language === "uz" ? product.descriptionUz : product.descriptionRu;
            
            return (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
                  <CardHeader className="p-0">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={name}
                        className="w-full h-48 object-cover rounded-t-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/400x300/f3f4f6/6b7280?text=${encodeURIComponent(name)}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <ShoppingCart className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg font-semibold line-clamp-2">{name}</CardTitle>
                      {product.category && (
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                    
                    {description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">{description}</p>
                    )}
                    
                    <div className="flex justify-between items-center mt-auto">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                        <p className="text-xs text-gray-500">
                          {getText(`${product.stockQuantity} ta mavjud`, `${product.stockQuantity} шт в наличии`)}
                        </p>
                      </div>
                      
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={product.stockQuantity === 0}
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product, 1);
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        {getText("Savatga", "В корзину")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {getText("Mahsulot topilmadi", "Товары не найдены")}
            </h3>
            <p className="text-gray-500">
              {getText("Qidiruv shartlarini o'zgartiring", "Измените условия поиска")}
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {getText("Aloqa", "Контакты")}
              </h3>
              <p className="text-gray-300">
                {getText("Telegram: @akramjon0011", "Telegram: @akramjon0011")}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {getText("Xizmatlar", "Услуги")}
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>{getText("Tez yetkazib berish", "Быстрая доставка")}</li>
                <li>{getText("24/7 qo'llab-quvvatlash", "24/7 поддержка")}</li>
                <li>{getText("Sifat kafolati", "Гарантия качества")}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {getText("Haqida", "О нас")}
              </h3>
              <p className="text-gray-300">
                {getText(
                  "Biz sifatli mahsulotlar va mukammal xizmat ko'rsatishga ixtisoslashgan zamonaviy do'konmiz.",
                  "Мы современный магазин, специализирующийся на качественных товарах и отличном сервисе."
                )}
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 {getText("Bizning Do'kon", "Наш Магазин")}. {getText("Barcha huquqlar himoyalangan.", "Все права защищены.")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}