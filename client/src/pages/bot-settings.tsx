import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BotSettings {
  id?: string;
  telegramBotToken?: string;
  instagramAccessToken?: string;
  geminiApiKey?: string;
  // Company Information
  companyName?: string;
  companyDescriptionUz?: string;
  companyDescriptionRu?: string;
  companyAddress?: string;
  workingHours?: string;
  website?: string;
  email?: string;
  // Bot Messages
  welcomeMessageUz?: string;
  welcomeMessageRu?: string;
  contactInfo?: string;
  operatorPhone?: string;
  isActive?: boolean;
  aiEnabled?: boolean;
  mainMenuKeyboardUz?: string[];
  mainMenuKeyboardRu?: string[];
}

export default function BotSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: settings, isLoading } = useQuery<BotSettings>({
    queryKey: ["/api/bot/settings"],
  });

  const [formData, setFormData] = useState<BotSettings>({
    telegramBotToken: "",
    instagramAccessToken: "",
    geminiApiKey: "",
    // Company Information
    companyName: "",
    companyDescriptionUz: "",
    companyDescriptionRu: "",
    companyAddress: "",
    workingHours: "09:00 - 18:00 (Dush-Juma)",
    website: "",
    email: "",
    // Bot Messages
    welcomeMessageUz: "Assalomu alaykum! Bizning online do'konimizga xush kelibsiz!",
    welcomeMessageRu: "Здравствуйте! Добро пожаловать в наш интернет-магазин!",
    contactInfo: "+998 90 123 45 67",
    operatorPhone: "+998 90 123 45 67",
    isActive: true,
    aiEnabled: true,
    mainMenuKeyboardUz: ["📦 Katalog", "🛒 Savatcha", "📞 Biz bilan aloqa", "👤 Operator"],
    mainMenuKeyboardRu: ["📦 Каталог", "🛒 Корзина", "📞 Связь с нами", "👤 Оператор"],
    ...settings
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: BotSettings) => {
      return await apiRequest("/api/bot/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyat",
        description: "Bot sozlamalari saqlandi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bot/settings"] });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Sozlamalarni saqlashda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof BotSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse p-6">
                <div className="h-6 bg-secondary-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-secondary-200 rounded"></div>
                  <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-secondary-800">Bot Sozlamalari</h1>
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => handleInputChange("isActive", checked)}
          />
          <Label>Bot faol</Label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Umumiy</TabsTrigger>
            <TabsTrigger value="company">Kompaniya</TabsTrigger>
            <TabsTrigger value="messages">Xabarlar</TabsTrigger>
            <TabsTrigger value="api">API Kalitlari</TabsTrigger>
            <TabsTrigger value="menu">Menyu</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asosiy Sozlamalar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactInfo">Aloqa Ma'lumotlari</Label>
                    <Input
                      id="contactInfo"
                      value={formData.contactInfo}
                      onChange={(e) => handleInputChange("contactInfo", e.target.value)}
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                  <div>
                    <Label htmlFor="operatorPhone">Operator Telefoni</Label>
                    <Input
                      id="operatorPhone"
                      value={formData.operatorPhone}
                      onChange={(e) => handleInputChange("operatorPhone", e.target.value)}
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.aiEnabled}
                    onCheckedChange={(checked) => handleInputChange("aiEnabled", checked)}
                  />
                  <Label>AI Yordamchi Faol</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kompaniya Ma'lumotlari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Kompaniya Nomi</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      placeholder="Kompaniya nomini kiriting"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Manzil</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="info@company.uz"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Veb-sayt</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://company.uz"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workingHours">Ish Vaqti</Label>
                    <Input
                      id="workingHours"
                      value={formData.workingHours}
                      onChange={(e) => handleInputChange("workingHours", e.target.value)}
                      placeholder="09:00 - 18:00 (Dush-Juma)"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="companyAddress">Manzil</Label>
                  <Textarea
                    id="companyAddress"
                    value={formData.companyAddress}
                    onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                    rows={2}
                    placeholder="Kompaniya manzilini kiriting"
                  />
                </div>
                
                <div>
                  <Label htmlFor="companyDescUz">Kompaniya Tavsifi (O'zbekcha)</Label>
                  <Textarea
                    id="companyDescUz"
                    value={formData.companyDescriptionUz}
                    onChange={(e) => handleInputChange("companyDescriptionUz", e.target.value)}
                    rows={3}
                    placeholder="Kompaniyangiz haqida qisqa ma'lumot o'zbekcha"
                  />
                </div>
                
                <div>
                  <Label htmlFor="companyDescRu">Компания Описание (Русский)</Label>
                  <Textarea
                    id="companyDescRu"
                    value={formData.companyDescriptionRu}
                    onChange={(e) => handleInputChange("companyDescriptionRu", e.target.value)}
                    rows={3}
                    placeholder="Краткая информация о компании на русском языке"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Xush Kelibsiz Xabarlari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="welcomeUz">O'zbekcha Xabar</Label>
                  <Textarea
                    id="welcomeUz"
                    value={formData.welcomeMessageUz}
                    onChange={(e) => handleInputChange("welcomeMessageUz", e.target.value)}
                    rows={3}
                    placeholder="Assalomu alaykum! Bizning online do'konimizga xush kelibsiz!"
                  />
                </div>
                <div>
                  <Label htmlFor="welcomeRu">Ruscha Xabar</Label>
                  <Textarea
                    id="welcomeRu"
                    value={formData.welcomeMessageRu}
                    onChange={(e) => handleInputChange("welcomeMessageRu", e.target.value)}
                    rows={3}
                    placeholder="Здравствуйте! Добро пожаловать в наш интернет-магазин!"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Kalitlari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="telegramToken">Telegram Bot Token</Label>
                  <Input
                    id="telegramToken"
                    type="password"
                    value={formData.telegramBotToken}
                    onChange={(e) => handleInputChange("telegramBotToken", e.target.value)}
                    placeholder="1234567890:AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPqq"
                  />
                </div>
                <div>
                  <Label htmlFor="instagramToken">Instagram Access Token</Label>
                  <Input
                    id="instagramToken"
                    type="password"
                    value={formData.instagramAccessToken}
                    onChange={(e) => handleInputChange("instagramAccessToken", e.target.value)}
                    placeholder="IGQVJ..."
                  />
                </div>
                <div>
                  <Label htmlFor="geminiApiKey">Gemini API Kaliti</Label>
                  <Input
                    id="geminiApiKey"
                    type="password"
                    value={formData.geminiApiKey}
                    onChange={(e) => handleInputChange("geminiApiKey", e.target.value)}
                    placeholder="AIzaSyC..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asosiy Menyu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>O'zbekcha Tugmalar</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {formData.mainMenuKeyboardUz?.map((button, index) => (
                      <Input
                        key={index}
                        value={button}
                        onChange={(e) => {
                          const newButtons = [...(formData.mainMenuKeyboardUz || [])];
                          newButtons[index] = e.target.value;
                          handleInputChange("mainMenuKeyboardUz", newButtons);
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Ruscha Tugmalar</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {formData.mainMenuKeyboardRu?.map((button, index) => (
                      <Input
                        key={index}
                        value={button}
                        onChange={(e) => {
                          const newButtons = [...(formData.mainMenuKeyboardRu || [])];
                          newButtons[index] = e.target.value;
                          handleInputChange("mainMenuKeyboardRu", newButtons);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3">
          <Button type="submit" disabled={updateSettingsMutation.isPending}>
            {updateSettingsMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saqlanmoqda...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Sozlamalarni Saqlash
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}