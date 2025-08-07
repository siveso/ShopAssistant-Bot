import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LogOut, ArrowLeft } from "lucide-react";

export default function Logout() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Tizimdan chiqildi",
      description: "Siz muvaffaqiyatli tizimdan chiqdingiz.",
    });
    setLocation("/");
  };

  const handleCancel = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="p-4 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <LogOut className="text-orange-600 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Tizimdan chiqish
            </h1>
            <p className="text-gray-600">
              Haqiqatan ham tizimdan chiqishni xohlaysizmi?
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Ha, chiqish
            </Button>
            <Button 
              variant="outline"
              onClick={handleCancel}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Bekor qilish
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}