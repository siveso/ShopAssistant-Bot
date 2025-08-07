import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { insertBlogSchema, type Blog, type InsertBlog } from "@/../../shared/schema";
import { useToast } from "@/hooks/use-toast";

interface BlogFormProps {
  blog?: Blog | null;
  onClose: () => void;
}

export function BlogForm({ blog, onClose }: BlogFormProps) {
  const [isPublishing, setIsPublishing] = useState(blog?.isPublished || false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<InsertBlog>({
    resolver: zodResolver(insertBlogSchema),
    defaultValues: {
      titleUz: blog?.titleUz || "",
      titleRu: blog?.titleRu || "",
      contentUz: blog?.contentUz || "",
      contentRu: blog?.contentRu || "",
      excerptUz: blog?.excerptUz || "",
      excerptRu: blog?.excerptRu || "",
      imageUrl: blog?.imageUrl || "",
      slug: blog?.slug || "",
      authorName: blog?.authorName || "Admin",
      tags: blog?.tags || [],
      isPublished: blog?.isPublished || false,
      publishedAt: blog?.publishedAt || null,
    }
  });

  const createBlogMutation = useMutation({
    mutationFn: (data: InsertBlog) => apiRequest("/api/blogs", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({
        title: "Muvaffaqiyat",
        description: "Blog maqolasi yaratildi"
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Blog maqolasini yaratishda xatolik yuz berdi",
        variant: "destructive"
      });
    }
  });

  const updateBlogMutation = useMutation({
    mutationFn: (data: InsertBlog) => apiRequest(`/api/blogs/${blog?.id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      if (blog?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/blogs/${blog.id}`] });
      }
      toast({
        title: "Muvaffaqiyat",
        description: "Blog maqolasi tahrirlandi"
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Blog maqolasini tahrirlashda xatolik yuz berdi",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: InsertBlog) => {
    const blogData = {
      ...data,
      isPublished: isPublishing,
      publishedAt: isPublishing && !blog?.publishedAt ? new Date().toISOString() : blog?.publishedAt || null,
      tags: typeof data.tags === 'string' ? (data.tags as string).split(',').map(t => t.trim()).filter(Boolean) : data.tags || []
    };

    if (blog) {
      updateBlogMutation.mutate(blogData);
    } else {
      createBlogMutation.mutate(blogData);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleTitleUzChange = (value: string) => {
    form.setValue('titleUz', value);
    if (!blog && !form.getValues('slug')) {
      form.setValue('slug', generateSlug(value));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="titleUz"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sarlavha (O'zbekcha)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      handleTitleUzChange(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="titleRu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sarlavha (Ruscha)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <Input {...field} placeholder="blog-maqola-slug" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Excerpt Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="excerptUz"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Qisqa mazmun (O'zbekcha)</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="excerptRu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Qisqa mazmun (Ruscha)</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Content Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contentUz"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matn (O'zbekcha)</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={10} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="contentRu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matn (Ruscha)</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={10} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image URL and Author */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rasm URL</FormLabel>
                <FormControl>
                  <Input {...field} type="url" placeholder="https://example.com/image.jpg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="authorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Muallif</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teglar (vergul bilan ajrating)</FormLabel>
              <FormControl>
                <Input 
                  value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="texnologiya, yangilik, mahsulot"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Publish Switch */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Chop etish</h3>
            <p className="text-sm text-gray-600">Maqolani darhol chop etish</p>
          </div>
          <Switch
            checked={isPublishing}
            onCheckedChange={setIsPublishing}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button 
            type="submit" 
            disabled={createBlogMutation.isPending || updateBlogMutation.isPending}
          >
            {createBlogMutation.isPending || updateBlogMutation.isPending 
              ? "Saqlanmoqda..." 
              : blog 
                ? "Tahrirlash" 
                : "Yaratish"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}