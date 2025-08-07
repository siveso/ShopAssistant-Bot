import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Logout() {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    // Clear any session data here if needed
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to login page or show confirmation
    alert("Tizimdan muvaffaqiyatli chiqildi!");
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
              <i className="fas fa-sign-out-alt text-orange-600 text-2xl"></i>
            </div>
            <h1 className="text-2xl font-semibold text-secondary-800 mb-2">
              Tizimdan chiqish
            </h1>
            <p className="text-secondary-600">
              Haqiqatan ham tizimdan chiqishni xohlaysizmi?
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Ha, chiqish
            </Button>
            <Button 
              variant="outline"
              onClick={handleCancel}
              className="w-full"
            >
              Bekor qilish
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}