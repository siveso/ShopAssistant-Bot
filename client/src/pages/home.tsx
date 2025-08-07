import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Star, ArrowRight, MessageCircle, Truck, Shield, Award } from "lucide-react";
import { CartSidebar } from "@/components/cart/cart-sidebar";

export default function Home() {
  const [language, setLanguage] = useState<"uz" | "ru">("uz");
  
  const getText = (uz: string, ru: string) => language === "uz" ? uz : ru;

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
              <Link href="/catalog">
                <Button variant="ghost" size="sm">
                  {getText("Katalog", "Каталог")}
                </Button>
              </Link>
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
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-6">
              {getText("Sifatli Mahsulotlar", "Качественные Товары")}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {getText(
                "Zamonaviy texnologiyalar, eng yaxshi narxlar va professional xizmat. O'zbekistonning eng ishonchli do'konidan xarid qiling!",
                "Современные технологии, лучшие цены и профессиональный сервис. Покупайте в самом надежном магазине Узбекистана!"
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalog">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {getText("Katalogni ko'rish", "Посмотреть каталог")}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <MessageCircle className="h-5 w-5 mr-2" />
                {getText("Telegram bot", "Telegram бот")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {getText("Nima uchun bizni tanlashadi?", "Почему выбирают нас?")}
            </h3>
            <p className="text-lg text-gray-600">
              {getText("Mijozlarimizning ishonchini qozongan sabablar", "Причины, завоевавшие доверие наших клиентов")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold mb-4">
                  {getText("Tez Yetkazib Berish", "Быстрая Доставка")}
                </h4>
                <p className="text-gray-600">
                  {getText(
                    "Toshkent bo'ylab 24 soat ichida, boshqa hududlarga 2-3 kun ichida mahsulotlarni yetkazib beramiz.",
                    "Доставляем товары по Ташкенту в течение 24 часов, в другие регионы за 2-3 дня."
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold mb-4">
                  {getText("Sifat Kafolati", "Гарантия Качества")}
                </h4>
                <p className="text-gray-600">
                  {getText(
                    "Barcha mahsulotlarimiz original va rasmiy kafolat bilan ta'minlanadi. 100% sifat kafolati.",
                    "Все наши товары оригинальные и предоставляются с официальной гарантией. 100% гарантия качества."
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold mb-4">
                  {getText("24/7 Qo'llab-quvvatlash", "24/7 Поддержка")}
                </h4>
                <p className="text-gray-600">
                  {getText(
                    "Telegram bot orqali 24 soat davomida buyurtma berish va maslahat olish imkoniyati mavjud.",
                    "Возможность заказать товары и получить консультацию через Telegram бот 24 часа в сутки."
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Products Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {getText("Mashhur Mahsulotlar", "Популярные Товары")}
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              {getText("Eng ko'p sotilayotgan va mijozlar sevimli mahsulotlar", "Самые продаваемые и любимые клиентами товары")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { name: "Samsung Galaxy S24", price: "$899", image: "https://via.placeholder.com/300x300/f3f4f6/6b7280?text=Samsung+Galaxy+S24" },
              { name: "iPhone 15 Pro", price: "$999", image: "https://via.placeholder.com/300x300/f3f4f6/6b7280?text=iPhone+15+Pro" },
              { name: "MacBook Air M3", price: "$1099", image: "https://via.placeholder.com/300x300/f3f4f6/6b7280?text=MacBook+Air+M3" },
              { name: "AirPods Pro 2", price: "$199", image: "https://via.placeholder.com/300x300/f3f4f6/6b7280?text=AirPods+Pro+2" }
            ].map((product, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="aspect-square mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-600">{product.price}</span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/catalog">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                {getText("Barcha mahsulotlarni ko'rish", "Посмотреть все товары")}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <p className="text-gray-600">
                {getText("Mamnun mijozlar", "Довольных клиентов")}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
              <p className="text-gray-600">
                {getText("Mahsulot turlari", "Видов товаров")}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <p className="text-gray-600">
                {getText("Qo'llab-quvvatlash", "Поддержка")}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">99%</div>
              <p className="text-gray-600">
                {getText("Mijoz mamnuniyati", "Удовлетворенность клиентов")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">
            {getText("Buyurtma berishga tayyormisiz?", "Готовы сделать заказ?")}
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            {getText(
              "Telegram botimiz orqali oson va tez buyurtma bering yoki katalogimizni ko'rib chiqing",
              "Легко и быстро сделайте заказ через наш Telegram бот или просмотрите наш каталог"
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <MessageCircle className="h-5 w-5 mr-2" />
              @akramjon0011
            </Button>
            <Link href="/catalog">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <ShoppingCart className="h-5 w-5 mr-2" />
                {getText("Katalogni ko'rish", "Посмотреть каталог")}
              </Button>
            </Link>
          </div>
        </div>
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