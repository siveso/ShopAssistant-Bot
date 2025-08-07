import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, ArrowLeft, Users, Award, Truck, Shield, Star, MessageCircle } from "lucide-react";
import { CartSidebar } from "@/components/cart/cart-sidebar";

export default function About() {
  const [language, setLanguage] = useState<"uz" | "ru">("uz");
  
  const getText = (uz: string, ru: string) => language === "uz" ? uz : ru;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/catalog">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {getText("Katalog", "Каталог")}
                </Button>
              </Link>
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <h1 className="ml-2 text-2xl font-bold text-gray-900">
                  {getText("Bizning Do'kon", "Наш Магазин")}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/blog">
                <Button variant="ghost" size="sm">
                  {getText("Blog", "Блог")}
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
              {getText("Biz Haqimizda", "О Нас")}
            </h2>
            <p className="text-xl text-blue-100">
              {getText(
                "Zamonaviy texnologiyalar va sifatli xizmat ko'rsatishda yetakchi kompaniya",
                "Ведущая компания в области современных технологий и качественного сервиса"
              )}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* About Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              {getText("Bizning Missiyamiz", "Наша Миссия")}
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              {getText(
                "Biz mijozlarimizga eng sifatli mahsulotlar va professional xizmatlarni taqdim etishga intilamiz. Har bir mijozning ehtiyojlarini tushunish va ularni qondirish bizning asosiy maqsadimizdir.",
                "Мы стремимся предоставить нашим клиентам качественные товары и профессиональные услуги. Понимание и удовлетворение потребностей каждого клиента - наша основная цель."
              )}
            </p>
            <p className="text-lg text-gray-700">
              {getText(
                "2020-yildan beri faoliyat yuritib kelayotgan kompaniyamiz minglab mijozlarning ishonchini qozongan va O'zbekiston bozorida yetakchi o'rinni egallagan.",
                "Работая с 2020 года, наша компания завоевала доверие тысяч клиентов и заняла лидирующие позиции на рынке Узбекистана."
              )}
            </p>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Award className="h-8 w-8 text-blue-600 mr-3" />
                  <h4 className="text-xl font-semibold">
                    {getText("Sifat Kafolati", "Гарантия Качества")}
                  </h4>
                </div>
                <p className="text-gray-600">
                  {getText(
                    "Barcha mahsulotlarimiz xalqaro standartlarga javob beradi va rasmiy kafolat bilan ta'minlanadi.",
                    "Все наши товары соответствуют международным стандартам и предоставляются с официальной гарантией."
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-8 w-8 text-green-600 mr-3" />
                  <h4 className="text-xl font-semibold">
                    {getText("Professional Jamoa", "Профессиональная Команда")}
                  </h4>
                </div>
                <p className="text-gray-600">
                  {getText(
                    "Tajribali mutaxassislar jamoasi sizga eng yaxshi maslahat va xizmatni taqdim etadi.",
                    "Команда опытных специалистов предоставит вам лучшие советы и сервис."
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
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

        {/* Services */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {getText("Bizning Xizmatlarimiz", "Наши Услуги")}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <Truck className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-4">
                  {getText("Tez Yetkazib Berish", "Быстрая Доставка")}
                </h4>
                <p className="text-gray-600">
                  {getText(
                    "Toshkent bo'ylab 24 soat ichida, boshqa hududlarga 2-3 kun ichida yetkazib beramiz.",
                    "По Ташкенту доставляем в течение 24 часов, в другие регионы за 2-3 дня."
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-4">
                  {getText("Xavfsiz To'lov", "Безопасная Оплата")}
                </h4>
                <p className="text-gray-600">
                  {getText(
                    "Barcha to'lov turlari: naqd, plastik karta, online to'lovlar xavfsiz tarzda amalga oshiriladi.",
                    "Все виды оплаты: наличными, картой, онлайн платежи осуществляются безопасно."
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <MessageCircle className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-4">
                  {getText("24/7 Qo'llab-quvvatlash", "24/7 Поддержка")}
                </h4>
                <p className="text-gray-600">
                  {getText(
                    "Telegram bot orqali 24 soat davomida savol-javob va buyurtma berish imkoniyati.",
                    "Возможность задать вопросы и сделать заказ через Telegram бот 24 часа в сутки."
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {getText("Bog'lanish", "Связаться с Нами")}
            </h3>
            <p className="text-lg text-gray-600">
              {getText(
                "Savollaringiz bormi? Biz bilan bog'laning!",
                "Есть вопросы? Свяжитесь с нами!"
              )}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-4">
                {getText("Telegram Bot", "Telegram Бот")}
              </h4>
              <p className="text-gray-600 mb-4">
                {getText(
                  "Eng tez va qulay yo'l - bizning Telegram botimiz orqali buyurtma berish",
                  "Самый быстрый и удобный способ - заказать через наш Telegram бот"
                )}
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                @akramjon0011
              </Button>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold mb-4">
                {getText("Ish Vaqti", "Время Работы")}
              </h4>
              <div className="space-y-2 text-gray-600">
                <p>{getText("Dushanba - Juma: 9:00 - 18:00", "Понедельник - Пятница: 9:00 - 18:00")}</p>
                <p>{getText("Shanba: 9:00 - 15:00", "Суббота: 9:00 - 15:00")}</p>
                <p>{getText("Yakshanba: Dam olish kuni", "Воскресенье: Выходной")}</p>
                <p className="text-blue-600 font-medium">
                  {getText("Telegram bot: 24/7 ishlamoqda", "Telegram бот: работает 24/7")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}