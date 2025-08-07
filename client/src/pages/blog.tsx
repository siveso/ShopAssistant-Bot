import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Eye, User, Search, BookOpen, ArrowLeft } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { Blog } from "@/../../shared/schema";

export default function BlogPage() {
  const [language, setLanguage] = useState<"uz" | "ru">("uz");
  const [searchTerm, setSearchTerm] = useState("");
  
  // SEO optimization - using catalog type for now
  useSEO('catalog', undefined, language);

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["/api/blogs"],
    select: (data: Blog[]) => data.filter(blog => blog.isPublished)
  });

  const filteredBlogs = blogs.filter(blog => {
    const title = language === "uz" ? blog.titleUz : blog.titleRu;
    const excerpt = language === "uz" ? blog.excerptUz : blog.excerptRu;
    
    return !searchTerm || 
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (excerpt && excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const getText = (uz: string, ru: string) => language === "uz" ? uz : ru;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{getText("Yuklanmoqda...", "Загрузка...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {getText("Orqaga", "Назад")}
                </Button>
              </Link>
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                {getText("Bizning Blog", "Наш Блог")}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/catalog">
                <Button variant="ghost" size="sm">
                  {getText("Katalog", "Каталог")}
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" size="sm">
                  {getText("Biz haqimizda", "О нас")}
                </Button>
              </Link>
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
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">
              {getText("Eng So'nggi Yangiliklar", "Последние Новости")}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {getText("Texnologiya, mahsulotlar va xizmatlar haqida qiziqarli maqolalar", "Интересные статьи о технологиях, продуктах и услугах")}
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-8">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={getText("Maqola qidirish...", "Поиск статей...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {getText("Hozircha maqolalar yo'q", "Пока нет статей")}
            </h3>
            <p className="text-gray-500">
              {getText("Tez orada qiziqarli maqolalar paydo bo'ladi", "Скоро появятся интересные статьи")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <Card key={blog.id} className="hover:shadow-lg transition-shadow group cursor-pointer">
                <Link href={`/blog/${blog.slug}`}>
                  <div>
                    {blog.imageUrl && (
                      <div className="relative overflow-hidden rounded-t-lg h-48 bg-gray-200">
                        <img 
                          src={blog.imageUrl} 
                          alt={language === "uz" ? blog.titleUz : blog.titleRu}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="group-hover:text-blue-600 transition-colors">
                        {language === "uz" ? blog.titleUz : blog.titleRu}
                      </CardTitle>
                      {(blog.excerptUz || blog.excerptRu) && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {language === "uz" ? blog.excerptUz : blog.excerptRu}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {blog.authorName}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {blog.viewCount || 0}
                        </div>
                      </div>
                      
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {(blog.tags as string[]).slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}