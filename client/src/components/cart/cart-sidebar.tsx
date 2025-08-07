import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";

interface CartSidebarProps {
  language: "uz" | "ru";
}

export function CartSidebar({ language }: CartSidebarProps) {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    getTotalPrice,
    isOpen,
    setIsOpen
  } = useCart();

  const getText = (uz: string, ru: string) => language === "uz" ? uz : ru;

  const handleCheckout = () => {
    // Telegram bot orqali buyurtma berish
    const orderText = items.map(item => {
      const name = language === "uz" ? item.nameUz : item.nameRu;
      return `${name} - ${item.quantity} ta - $${(parseFloat(item.price) * item.quantity).toFixed(2)}`;
    }).join('\n');
    
    const totalPrice = getTotalPrice().toFixed(2);
    const message = encodeURIComponent(
      `${getText("Yangi buyurtma:", "Новый заказ:")}\n\n${orderText}\n\n${getText("Jami:", "Итого:")} $${totalPrice}`
    );
    
    window.open(`https://t.me/akramjon0011?text=${message}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {getTotalItems() > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{getText("Savat", "Корзина")}</span>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {getText("Tozalash", "Очистить")}
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <ShoppingCart className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium mb-2">
              {getText("Savat bo'sh", "Корзина пуста")}
            </p>
            <p className="text-sm text-center">
              {getText("Mahsulot qo'shish uchun katalogga o'ting", "Перейдите в каталог, чтобы добавить товары")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {items.map((item) => {
                  const name = language === "uz" ? item.nameUz : item.nameRu;
                  const itemTotal = parseFloat(item.price) * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-3 border-b pb-4">
                      <div className="flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={name}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://via.placeholder.com/48x48/f3f4f6/6b7280?text=${encodeURIComponent(name.slice(0, 2))}`;
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          ${item.price} × {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          ${itemTotal.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="text-sm font-medium px-2">{item.quantity}</span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>{getText("Jami:", "Итого:")}</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              
              <Button 
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {getText("Telegram orqali buyurtma berish", "Заказать через Telegram")}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                {getText(
                  "Buyurtma Telegram bot orqali yakunlanadi",
                  "Заказ будет завершен через Telegram бот"
                )}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}