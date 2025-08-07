import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Eye, User, ArrowLeft, Share2 } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { apiRequest } from "@/lib/queryClient";
import { Blog } from "@/../../shared/schema";

export default function BlogDetailPage() {
  const [match, params] = useRoute("/blog/:slug");
  const slug = params?.slug;
  const [language, setLanguage] = useState<"uz" | "ru">("uz");
  const queryClient = useQueryClient();

  const { data: blog, isLoading } = useQuery({
    queryKey: [`/api/blogs/${slug}`],
    enabled: !!slug
  });

  // SEO optimization for blog post - using product type for now
  useSEO('product', blog, language);

  // Increment view count
  const viewMutation = useMutation({
    mutationFn: () => apiRequest(`/api/blogs/${slug}/view`, {
      method: "POST"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/blogs/${slug}`] });
    }
  });

  useEffect(() => {
    if (blog && slug) {
      viewMutation.mutate();
    }
  }, [blog, slug]);

  const getText = (uz: string, ru: string) => language === "uz" ? uz : ru;

  const sharePost = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === "uz" ? blog?.titleUz : blog?.titleRu,
          text: language === "uz" ? blog?.excerptUz : blog?.excerptRu,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

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

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">
            {getText("Maqola topilmadi", "Статья не найдена")}
          </h1>
          <Link href="/blog">
            <Button>
              {getText("Blogga qaytish", "Вернуться к блогу")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {getText("Blogga qaytish", "Вернуться к блогу")}
              </Button>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={sharePost}>
                <Share2 className="h-4 w-4 mr-2" />
                {getText("Ulashish", "Поделиться")}
              </Button>
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

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === "uz" ? blog.titleUz : blog.titleRu}
            </h1>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {blog.authorName}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : ''}
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  {blog.viewCount || 0} {getText("ko'rishlar", "просмотров")}
                </div>
              </div>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {(blog.tags as string[]).map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Featured Image */}
            {blog.imageUrl && (
              <div className="mb-8">
                <img 
                  src={blog.imageUrl} 
                  alt={language === "uz" ? blog.titleUz : blog.titleRu}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {language === "uz" ? blog.contentUz : blog.contentRu}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}