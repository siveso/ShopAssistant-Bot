import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Rss, Globe, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function BlogGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  // Blog generator status
  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/blog-generator/status"],
    refetchInterval: 5000, // Har 5 soniyada yangilash
  });

  // RSS blog generation
  const generateMutation = useMutation({
    mutationFn: () => apiRequest("/api/blog-generator/generate", {
      method: "POST",
    }),
    onSuccess: () => {
      setIsGenerating(false);
      refetchStatus();
    },
    onError: (error) => {
      setIsGenerating(false);
      console.error("RSS blog generation failed:", error);
    },
  });

  // Business content generation
  const generateBusinessMutation = useMutation({
    mutationFn: () => apiRequest("/api/blog-generator/generate-business", {
      method: "POST",
    }),
    onSuccess: () => {
      setIsGenerating(false);
      refetchStatus();
    },
    onError: (error) => {
      setIsGenerating(false);
      console.error("Business content generation failed:", error);
    },
  });

  // Demo content generation
  const generateDemoMutation = useMutation({
    mutationFn: () => apiRequest("/api/blog-generator/demo", {
      method: "POST",
    }),
    onSuccess: () => {
      setIsGenerating(false);
      refetchStatus();
    },
    onError: (error) => {
      setIsGenerating(false);
      console.error("Demo content generation failed:", error);
    },
  });

  const handleGenerateRSS = () => {
    setIsGenerating(true);
    generateMutation.mutate();
  };

  const handleGenerateBusiness = () => {
    setIsGenerating(true);
    generateBusinessMutation.mutate();
  };

  const handleGenerateDemo = () => {
    setIsGenerating(true);
    generateDemoMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Generator</h1>
          <p className="text-gray-600 mt-2">
            RSS feedlar orqali avtomatik blog kontenti yaratish
          </p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Scheduler Holati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Badge 
                variant={status?.isRunning ? "default" : "destructive"}
                className="mr-2"
              >
                {status?.isRunning ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Faol
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    To'xtatilgan
                  </>
                )}
              </Badge>
            </div>
          </div>

          {status?.nextRuns && status.nextRuns.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Keyingi ishga tushish vaqtlari:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {status.nextRuns.map((time: string, index: number) => (
                  <li key={index}>{time}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RSS Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Rss className="h-5 w-5 mr-2" />
            RSS Manbalari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-3 border rounded-lg">
              <Globe className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h4 className="font-medium">TechCrunch</h4>
                <p className="text-sm text-gray-600">Texnologiya yangiliklari</p>
              </div>
            </div>
            <div className="flex items-center p-3 border rounded-lg">
              <Globe className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h4 className="font-medium">VentureBeat</h4>
                <p className="text-sm text-gray-600">Business yangiliklari</p>
              </div>
            </div>
            <div className="flex items-center p-3 border rounded-lg">
              <Globe className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h4 className="font-medium">CNN</h4>
                <p className="text-sm text-gray-600">Umumiy yangiliklar</p>
              </div>
            </div>
            <div className="flex items-center p-3 border rounded-lg">
              <Globe className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <h4 className="font-medium">BBC News</h4>
                <p className="text-sm text-gray-600">Xalqaro yangiliklar</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Demo Maqolalar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tizimni test qilish uchun tayyor demo maqolalar yaratadi: "AI Biznesda", "E-commerce Platform".
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleGenerateDemo}
              disabled={isGenerating || generateDemoMutation.isPending}
              size="lg"
              className="w-full"
              variant="secondary"
            >
              {isGenerating || generateDemoMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Demo maqolalar yaratilmoqda...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Demo Maqolalar Yaratish
                </>
              )}
            </Button>

            {generateDemoMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Demo maqolalar yaratishda xatolik yuz berdi.
                </AlertDescription>
              </Alert>
            )}

            {generateDemoMutation.isSuccess && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Demo maqolalar muvaffaqiyatli yaratildi! Blog sahifasiga o'ting.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Generation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Rss className="h-5 w-5 mr-2" />
              RSS Blog Yaratish
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  RSS feedlardan (TechCrunch, BBC, CNN) maqolalar olib, o'zbek va rus tillariga tarjima qiladi.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleGenerateRSS}
                disabled={isGenerating || generateMutation.isPending}
                size="lg"
                className="w-full"
              >
                {isGenerating || generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    RSS Blog yaratilmoqda...
                  </>
                ) : (
                  <>
                    <Rss className="h-4 w-4 mr-2" />
                    RSS dan Blog Yaratish
                  </>
                )}
              </Button>

              {generateMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    RSS blog yaratishda xatolik yuz berdi.
                  </AlertDescription>
                </Alert>
              )}

              {generateMutation.isSuccess && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    RSS bloglar muvaffaqiyatli boshlandi!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Biznes AI Blog Yaratish
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Biznesda AI, e-commerce, web texnologiyalar mavzularida professional maqolalar yaratadi.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleGenerateBusiness}
                disabled={isGenerating || generateBusinessMutation.isPending}
                size="lg"
                className="w-full"
                variant="outline"
              >
                {isGenerating || generateBusinessMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Biznes Blog yaratilmoqda...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Biznes AI Blog Yaratish
                  </>
                )}
              </Button>

              {generateBusinessMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Biznes blog yaratishda xatolik yuz berdi.
                  </AlertDescription>
                </Alert>
              )}

              {generateBusinessMutation.isSuccess && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Biznes AI maqolalari muvaffaqiyatli boshlandi!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}