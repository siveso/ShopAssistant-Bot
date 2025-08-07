import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "bot" | "admin" | "setup" | "troubleshooting">("all");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: "1",
      question: "Telegram botni qanday sozlash kerak?",
      answer: "1. Telegram'da @BotFather ga boring\n2. /newbot buyrug'ini yuboring\n3. Bot nomini va username ni kiriting\n4. Olingan tokenni 'Bot Sozlamalari' sahifasiga kiriting\n5. Webhookni sozlang\n6. Bot faol holatga keltiring",
      category: "setup",
      tags: ["telegram", "bot", "sozlash"]
    },
    {
      id: "2", 
      question: "Mahsulot qo'shish va tahrirlash",
      answer: "Mahsulotlar sahifasida 'Mahsulot Qo'shish' tugmasini bosing. Kerakli ma'lumotlarni to'ldiring: nom (o'zbek va rus tillarida), narx, ombordagi soni, kategoriya va rasm URL. Tahrirlash uchun har bir mahsulot kartasidagi 'Tahrirlash' tugmasini ishlatibg.",
      category: "admin",
      tags: ["mahsulot", "qo'shish", "tahrirlash"]
    },
    {
      id: "3",
      question: "Buyurtmalarni boshqarish",
      answer: "Buyurtmalar sahifasida barcha buyurtmalarni ko'rish mumkin. Har bir buyurtma uchun holatni o'zgartirish (kutilmoqda, jarayonda, bajarilgan, bekor qilingan) va batafsil ma'lumotlarni ko'rish imkoniyati mavjud.",
      category: "admin", 
      tags: ["buyurtma", "holat", "boshqarish"]
    },
    {
      id: "4",
      question: "Bot javob bermayapti",
      answer: "1. Bot tokenini tekshiring\n2. Internetga ulanishni tekshiring\n3. Bot holatini 'Bot Sozlamalari'da faol qiling\n4. Webhook sozlamalarini qayta tekshiring\n5. Server loglarini ko'ring",
      category: "troubleshooting",
      tags: ["bot", "muammo", "javob", "token"]
    },
    {
      id: "5",
      question: "AI yordamchini sozlash",
      answer: "Bot Sozlamalari sahifasida 'AI Yordamchi Faol' tugmasini yoqing. Gemini API kalitini kiritganingizga ishonch hosil qiling. AI yordamchi foydalanuvchi savollariga avtomatik javob beradi.",
      category: "bot",
      tags: ["AI", "yordamchi", "gemini", "api"]
    },
    {
      id: "6",
      question: "Foydalanuvchilarni ko'rish",
      answer: "Foydalanuvchilar sahifasida ro'yxatdan o'tgan barcha foydalanuvchilarni ko'rish mumkin. Ular haqida ma'lumot: ism, telefon, platforma (Telegram/Instagram), ro'yxatdan o'tgan sana.",
      category: "admin",
      tags: ["foydalanuvchi", "ro'yxat", "ma'lumot"]
    },
    {
      id: "7",
      question: "Hisobotlarni tushunish",
      answer: "Hisobotlar sahifasida turli statistikalarni ko'rish mumkin: buyurtmalar dinamikasi, mahsulotlar bo'yicha sotuvlar, yangi foydalanuvchilar, platformalar bo'yicha taqsimot. Vaqt oralig'ini tanlash va eksport qilish imkoniyati ham mavjud.",
      category: "admin",
      tags: ["hisobot", "statistika", "analitika"]
    },
    {
      id: "8",
      question: "Rasm yuklanmayapti",
      answer: "1. Rasm URL to'g'ri ekanligini tekshiring\n2. Rasm ochiq serverda joylashganiga ishonch hosil qiling\n3. HTTPS protokolini ishlating\n4. Rasm formatini tekshiring (JPG, PNG, GIF)\n5. Rasm hajmi 20MB dan oshmasin",
      category: "troubleshooting", 
      tags: ["rasm", "url", "yuklanish", "format"]
    }
  ];

  const categories = [
    { key: "all", label: "Barchasi", icon: "fas fa-list" },
    { key: "setup", label: "Sozlash", icon: "fas fa-cog" },
    { key: "admin", label: "Admin Panel", icon: "fas fa-user-shield" },
    { key: "bot", label: "Bot", icon: "fas fa-robot" },
    { key: "troubleshooting", label: "Muammolarni hal qilish", icon: "fas fa-wrench" }
  ];

  const filteredFAQs = faqItems.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-secondary-800">Yordam va Qo'llab-quvvatlash</h1>
        <Button className="bg-primary-600 hover:bg-primary-700 text-white">
          <i className="fas fa-headset mr-2"></i>
          Qo'llab-quvvatlash
        </Button>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Bog'lanish</TabsTrigger>
          <TabsTrigger value="docs">Qo'llanma</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="FAQ qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-secondary-300"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category.key}
                    variant={selectedCategory === category.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.key as any)}
                    className="flex items-center gap-1"
                  >
                    <i className={category.icon}></i>
                    {category.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Items */}
          {filteredFAQs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-secondary-500">
                  <i className="fas fa-search text-4xl mb-4"></i>
                  <h3 className="text-lg font-medium mb-2">Hech narsa topilmadi</h3>
                  <p className="text-sm">Qidiruv so'zini o'zgartirib ko'ring</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredFAQs.map((faq) => (
                <Card key={faq.id} className="border border-secondary-200">
                  <Collapsible
                    open={expandedFAQ === faq.id}
                    onOpenChange={(isOpen) => setExpandedFAQ(isOpen ? faq.id : null)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="hover:bg-secondary-50 transition-colors">
                        <div className="flex items-center justify-between text-left">
                          <div className="flex-1">
                            <CardTitle className="text-base font-medium mb-2">
                              {faq.question}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {faq.category}
                              </Badge>
                              {faq.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <i className={`fas fa-chevron-${expandedFAQ === faq.id ? 'up' : 'down'} text-secondary-400`}></i>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-line text-secondary-700 bg-secondary-50 p-4 rounded-lg">
                            {faq.answer}
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bog'lanish Ma'lumotlari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-full">
                    <i className="fas fa-phone text-primary-600"></i>
                  </div>
                  <div>
                    <p className="font-medium">Telefon</p>
                    <p className="text-secondary-600">+998 90 123 45 67</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <i className="fab fa-telegram text-green-600"></i>
                  </div>
                  <div>
                    <p className="font-medium">Telegram</p>
                    <p className="text-secondary-600">@support_bot</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <i className="fas fa-envelope text-blue-600"></i>
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-secondary-600">support@example.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <i className="fas fa-clock text-orange-600"></i>
                  </div>
                  <div>
                    <p className="font-medium">Ish vaqti</p>
                    <p className="text-secondary-600">9:00 - 18:00 (Dush-Juma)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Xabar Yuborish</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <Input placeholder="Sizning ismingiz" />
                  </div>
                  <div>
                    <Input type="email" placeholder="Email manzil" />
                  </div>
                  <div>
                    <Input placeholder="Mavzu" />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Xabar matni..."
                      rows={5}
                    />
                  </div>
                  <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                    <i className="fas fa-paper-plane mr-2"></i>
                    Xabar Yuborish
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-rocket text-blue-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Boshlash</h3>
                <p className="text-secondary-600 text-sm">Tizimni sozlash va ishga tushirish bo'yicha qo'llanma</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-robot text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Bot Sozlash</h3>
                <p className="text-secondary-600 text-sm">Telegram va Instagram botlarni sozlash</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-box text-purple-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Mahsulotlar</h3>
                <p className="text-secondary-600 text-sm">Mahsulot qo'shish va boshqarish</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-shopping-cart text-orange-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Buyurtmalar</h3>
                <p className="text-secondary-600 text-sm">Buyurtmalarni qayta ishlash va boshqarish</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-chart-bar text-red-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Hisobotlar</h3>
                <p className="text-secondary-600 text-sm">Statistika va hisobotlar bilan ishlash</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-code text-yellow-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">API</h3>
                <p className="text-secondary-600 text-sm">API integratsiya qo'llanmasi</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}