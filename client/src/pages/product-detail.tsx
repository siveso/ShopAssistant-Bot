import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, Headphones } from "lucide-react";

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

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [language, setLanguage] = useState<"uz" | "ru">("uz");
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${params?.id}`],
    enabled: !!params?.id
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {getText("Mahsulot topilmadi", "Товар не найден")}
          </h2>
          <Link href="/catalog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {getText("Katalogga qaytish", "Вернуться к каталогу")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const name = language === "uz" ? product.nameUz : product.nameRu;
  const description = language === "uz" ? product.descriptionUz : product.descriptionRu;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/catalog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {getText("Katalog", "Каталог")}
              </Button>
            </Link>
            
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
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={name}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/600x600/f3f4f6/6b7280?text=${encodeURIComponent(name)}`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
                {product.category && (
                  <Badge variant="secondary">{product.category}</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600">
                  {getText("(5.0 - 127 baho)", "(5.0 - 127 отзывов)")}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-4xl font-bold text-blue-600">${product.price}</span>
                <p className="text-gray-600 mt-1">
                  {getText(`${product.stockQuantity} ta mavjud`, `${product.stockQuantity} шт в наличии`)}
                </p>
              </div>

              {description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {getText("Tavsif", "Описание")}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{description}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getText("Miqdor", "Количество")}
                  </label>
                  <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(Math.min(10, product.stockQuantity))].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={product.stockQuantity === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stockQuantity === 0 
                    ? getText("Tugab qolgan", "Нет в наличии")
                    : getText("Savatga qo'shish", "Добавить в корзину")
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {getText("Bizning afzalliklarimiz", "Наши преимущества")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Truck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  {getText("Tez yetkazib berish", "Быстрая доставка")}
                </h3>
                <p className="text-gray-600">
                  {getText("24 soat ichida yetkazib beramiz", "Доставляем в течение 24 часов")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  {getText("Sifat kafolati", "Гарантия качества")}
                </h3>
                <p className="text-gray-600">
                  {getText("100% original mahsulotlar", "100% оригинальные товары")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Headphones className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  {getText("24/7 qo'llab-quvvatlash", "24/7 поддержка")}
                </h3>
                <p className="text-gray-600">
                  {getText("Har doim sizning xizmatingizdamiz", "Всегда к вашим услугам")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}