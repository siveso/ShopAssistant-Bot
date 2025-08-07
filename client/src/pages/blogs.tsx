import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BlogForm } from "@/components/forms/blog-form";
import { Modal } from "@/components/modals/modal";
import { Plus, Edit, Trash2, Eye, Calendar, User, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Blog } from "@/../../shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function BlogsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["/api/blogs"]
  });

  const deleteBlogMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/blogs/${id}`, {
      method: "DELETE"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({
        title: "Muvaffaqiyat",
        description: "Blog maqolasi o'chirildi"
      });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Blog maqolasini o'chirishda xatolik yuz berdi",
        variant: "destructive"
      });
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) => 
      apiRequest(`/api/blogs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPublished, publishedAt: isPublished ? new Date().toISOString() : null })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({
        title: "Muvaffaqiyat",
        description: "Blog holati o'zgartirildi"
      });
    }
  });

  const filteredBlogs = (blogs as Blog[]).filter((blog: Blog) => {
    const matchesSearch = !searchTerm || 
      blog.titleUz.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.titleRu.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "published" && blog.isPublished) ||
      (statusFilter === "draft" && !blog.isPublished);
    
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Rostdan ham bu blog maqolasini o'chirmoqchimisiz?")) {
      deleteBlogMutation.mutate(id);
    }
  };

  const handleTogglePublish = (blog: Blog) => {
    togglePublishMutation.mutate({ 
      id: blog.id, 
      isPublished: !blog.isPublished 
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Boshqaruvi</h1>
          <p className="text-gray-600">Blog maqolalarini boshqaring</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yangi Maqola
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Maqola qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "published" | "draft")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Holat bo'yicha filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha maqolalar</SelectItem>
            <SelectItem value="published">Chop etilganlar</SelectItem>
            <SelectItem value="draft">Qoralamar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Blog Posts */}
      {filteredBlogs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Blog maqolalar yo'q
              </h3>
              <p className="text-gray-500 mb-4">
                Birinchi blog maqolangizni yarating
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Yangi Maqola Yaratish
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog: Blog) => (
            <Card key={blog.id} className="hover:shadow-lg transition-shadow">
              {blog.imageUrl && (
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img 
                    src={blog.imageUrl} 
                    alt={blog.titleUz}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={blog.isPublished ? "default" : "secondary"}>
                      {blog.isPublished ? "Chop etilgan" : "Qoralama"}
                    </Badge>
                  </div>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="line-clamp-2">
                  {blog.titleUz}
                </CardTitle>
                {blog.excerptUz && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {blog.excerptUz}
                  </p>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {blog.authorName}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {blog.viewCount || 0}
                  </div>
                </div>

                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(blog.tags as string[]).slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <Button
                    variant={blog.isPublished ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleTogglePublish(blog)}
                  >
                    {blog.isPublished ? "Yashirish" : "Chop etish"}
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(blog)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(blog.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Blog Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={editingBlog ? "Blog maqolasini tahrirlash" : "Yangi blog maqolasi"}
      >
        <BlogForm 
          blog={editingBlog} 
          onClose={closeModal} 
        />
      </Modal>
    </div>
  );
}