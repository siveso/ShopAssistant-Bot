import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MarketingMessage {
  id: string;
  titleUz: string;
  titleRu: string;
  contentUz: string;
  contentRu: string;
  imageUrl?: string;
  isActive: boolean;
  intervalDays: number;
  createdAt: Date;
  lastSentAt?: Date;
}

export default function Marketing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState<Partial<MarketingMessage>>({
    titleUz: "",
    titleRu: "",
    contentUz: "",
    contentRu: "",
    imageUrl: "",
    isActive: true,
    intervalDays: 2
  });

  const { data: messages = [], isLoading } = useQuery<MarketingMessage[]>({
    queryKey: ["/api/marketing/messages"],
  });

  const createMessageMutation = useMutation({
    mutationFn: async (data: Partial<MarketingMessage>) => {
      const response = await apiRequest("POST", "/api/marketing/messages", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Muvaffaqiyat", description: "Marketing xabari yaratildi" });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/messages"] });
      setShowAddForm(false);
      setFormData({ titleUz: "", titleRu: "", contentUz: "", contentRu: "", imageUrl: "", isActive: true, intervalDays: 2 });
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Marketing xabarini yaratishda xatolik", variant: "destructive" });
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<MarketingMessage>) => {
      const response = await apiRequest("PUT", `/api/marketing/messages/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Muvaffaqiyat", description: "Marketing xabari yangilandi" });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/messages"] });
    },
  });

  const sendNowMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest("POST", `/api/marketing/send-now/${messageId}`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Muvaffaqiyat", 
        description: `Marketing xabari ${data.sentCount} ta foydalanuvchiga yuborildi` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/messages"] });
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Xabarni yuborishda xatolik", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleUz || !formData.titleRu || !formData.contentUz || !formData.contentRu) {
      toast({ title: "Xatolik", description: "Barcha majburiy maydonlarni to'ldiring", variant: "destructive" });
      return;
    }
    createMessageMutation.mutate(formData);
  };

  const toggleMessageStatus = (message: MarketingMessage) => {
    updateMessageMutation.mutate({ id: message.id, isActive: !message.isActive });
  };

  const sendMessageNow = (messageId: string) => {
    sendNowMutation.mutate(messageId);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-secondary-800">Marketing Xabarlari</h1>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          <i className="fas fa-plus mr-2"></i>
          Yangi Xabar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Jami Xabarlar</p>
                <p className="text-2xl font-bold text-secondary-800">{messages.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <i className="fas fa-envelope text-blue-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Faol Xabarlar</p>
                <p className="text-2xl font-bold text-secondary-800">
                  {messages.filter(m => m.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Keyingi Yuborish</p>
                <p className="text-sm font-medium text-secondary-800">2 kun ichida</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <i className="fas fa-clock text-orange-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Message Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Yangi Marketing Xabari</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titleUz">Sarlavha (O'zbekcha)</Label>
                  <Input
                    id="titleUz"
                    value={formData.titleUz}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleUz: e.target.value }))}
                    placeholder="🎉 Yangi Chegirmalar!"
                  />
                </div>
                <div>
                  <Label htmlFor="titleRu">Sarlavha (Ruscha)</Label>
                  <Input
                    id="titleRu"
                    value={formData.titleRu}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleRu: e.target.value }))}
                    placeholder="🎉 Новые Скидки!"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contentUz">Xabar Matni (O'zbekcha)</Label>
                  <Textarea
                    id="contentUz"
                    value={formData.contentUz}
                    onChange={(e) => setFormData(prev => ({ ...prev, contentUz: e.target.value }))}
                    rows={4}
                    placeholder="Marketing xabari matni..."
                  />
                </div>
                <div>
                  <Label htmlFor="contentRu">Xabar Matni (Ruscha)</Label>
                  <Textarea
                    id="contentRu"
                    value={formData.contentRu}
                    onChange={(e) => setFormData(prev => ({ ...prev, contentRu: e.target.value }))}
                    rows={4}
                    placeholder="Текст маркетингового сообщения..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="imageUrl">Rasm URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="intervalDays">Interval (kun)</Label>
                  <Input
                    id="intervalDays"
                    type="number"
                    value={formData.intervalDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, intervalDays: parseInt(e.target.value) || 2 }))}
                    min="1"
                    max="30"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label>Faol</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={createMessageMutation.isPending}>
                  {createMessageMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Saqlash
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Messages List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border border-secondary-200">
              <div className="animate-pulse p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-secondary-200 rounded w-1/3"></div>
                  <div className="h-6 bg-secondary-200 rounded w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-secondary-200 rounded"></div>
                  <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-secondary-500">
              <i className="fas fa-envelope-open text-4xl mb-4"></i>
              <h3 className="text-lg font-medium mb-2">Marketing xabarlari yo'q</h3>
              <p className="text-sm mb-4">Birinchi marketing xabaringizni yarating</p>
              <Button onClick={() => setShowAddForm(true)}>
                <i className="fas fa-plus mr-2"></i>
                Yangi Xabar Yaratish
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className="border border-secondary-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-secondary-800">
                        {message.titleUz}
                      </h3>
                      <Badge variant={message.isActive ? "default" : "secondary"}>
                        {message.isActive ? "Faol" : "Nofaol"}
                      </Badge>
                      <Badge variant="outline">
                        {message.intervalDays} kun interval
                      </Badge>
                    </div>
                    <p className="text-sm text-secondary-600 mb-4">
                      {message.contentUz.substring(0, 150)}...
                    </p>
                    
                    {message.lastSentAt && (
                      <p className="text-xs text-secondary-500">
                        Oxirgi yuborilgan: {new Date(message.lastSentAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleMessageStatus(message)}
                      disabled={updateMessageMutation.isPending}
                    >
                      <i className={`fas fa-${message.isActive ? 'pause' : 'play'} mr-1`}></i>
                      {message.isActive ? 'To\'xtatish' : 'Faollashtirish'}
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => sendMessageNow(message.id)}
                      disabled={sendNowMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {sendNowMutation.isPending ? (
                        <i className="fas fa-spinner fa-spin mr-1"></i>
                      ) : (
                        <i className="fas fa-paper-plane mr-1"></i>
                      )}
                      Hozir Yuborish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}