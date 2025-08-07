import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";

interface Conversation {
  id: string;
  userId: string;
  platformType: "telegram" | "instagram";
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    fullName: string;
    platformUsername: string;
  };
}

export default function Conversations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "telegram" | "instagram">("all");

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.user?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.user?.platformUsername.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === "all" || conv.platformType === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  const getLastMessage = (messages: Array<{role: string; content: string}>) => {
    return messages[messages.length - 1]?.content || "Xabar yo'q";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-secondary-800">Suhbatlar</h1>
        <div className="flex gap-2">
          <Badge variant="outline">
            Jami: {conversations.length}
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Foydalanuvchi qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-secondary-300"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedPlatform === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPlatform("all")}
              >
                Barchasi
              </Button>
              <Button
                variant={selectedPlatform === "telegram" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPlatform("telegram")}
              >
                Telegram
              </Button>
              <Button
                variant={selectedPlatform === "instagram" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPlatform("instagram")}
              >
                Instagram
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversations List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border border-secondary-200">
              <div className="animate-pulse p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                    <div className="h-3 bg-secondary-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-4 bg-secondary-200 rounded w-16"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredConversations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-secondary-500">
              <i className="fas fa-comments text-4xl mb-4"></i>
              <h3 className="text-lg font-medium mb-2">Suhbat topilmadi</h3>
              <p className="text-sm">
                {searchQuery ? "Qidiruv so'zini o'zgartirib ko'ring" : "Hali hech qanday suhbat yo'q"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conversation) => (
            <Card key={conversation.id} className="border border-secondary-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar>
                      <AvatarFallback>
                        {conversation.user?.fullName?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-secondary-800">
                          {conversation.user?.fullName || "Noma'lum foydalanuvchi"}
                        </h3>
                        <Badge variant={conversation.platformType === "telegram" ? "default" : "secondary"}>
                          {conversation.platformType === "telegram" ? "Telegram" : "Instagram"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-secondary-600 mb-1">
                        @{conversation.user?.platformUsername || "noma'lum"}
                      </p>
                      
                      <p className="text-sm text-secondary-700 line-clamp-2">
                        {getLastMessage(conversation.messages)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-secondary-500 mb-2">
                      {formatDistanceToNow(new Date(conversation.updatedAt), { 
                        addSuffix: true, 
                        locale: uz 
                      })}
                    </p>
                    <Badge variant="outline">
                      {conversation.messages.length} xabar
                    </Badge>
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