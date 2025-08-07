import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loginSchema, type LoginRequest } from "@shared/schema";
import { Eye, EyeOff, Lock, User } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      return apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      });
    },
    onSuccess: (data) => {
      console.log('Login successful, storing token:', data.sessionToken);
      
      // Clear any existing auth data first
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('admin');
      
      // Store new session token in localStorage
      localStorage.setItem('sessionToken', data.sessionToken);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      
      toast({
        title: "Muvaffaqiyatli kirish",
        description: `Xush kelibsiz, ${data.admin.fullName}!`,
      });
      
      // Small delay to ensure localStorage is updated
      setTimeout(() => {
        setLocation("/");
        window.location.reload(); // Force a refresh to reinitialize auth
      }, 100);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Kirish xatosi",
        description: error.message || "Username yoki parol noto'g'ri",
      });
    }
  });

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Boshqaruv Paneli</CardTitle>
          <CardDescription>
            Admin paneliga kirish uchun login va parolingizni kiriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Username kiriting"
                  className="pl-10"
                  {...form.register("username")}
                />
              </div>
              {form.formState.errors.username && (
                <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Parol kiriting"
                  className="pl-10 pr-10"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Kirilyapti..." : "Kirish"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Login ma'lumotlar:</p>
            <p>Username: <code className="bg-gray-100 px-2 py-1 rounded">Akramjon001</code></p>
            <p>Parol: <code className="bg-gray-100 px-2 py-1 rounded">Hisobot201415</code></p>
            
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="mt-3 text-xs text-blue-600 underline hover:text-blue-800"
            >
              Browser ma'lumotlarini tozalash (agar muammo bo'lsa)
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}