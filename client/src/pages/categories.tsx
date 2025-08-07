import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AddCategoryModal } from "../components/modals/add-category-modal";
import { EditCategoryModal } from "../components/modals/edit-category-modal";
import type { Category } from "@shared/schema";

export default function CategoriesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => apiRequest("/api/categories"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/categories/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyat",
        description: "Kategoriya o'chirildi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: () => {
      toast({
        title: "Xato",
        description: "Kategoriyani o'chirishda xato yuz berdi",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCategory = (id: string) => {
    if (window.confirm("Bu kategoriyani o'chirishni xohlaysizmi?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Kategoriyalar</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Kategoriya qo'shish
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kategoriyalar</h1>
          <p className="text-gray-600 mt-1">
            Mahsulotlar kategoriyalarini boshqaring
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Kategoriya qo'shish
        </Button>
      </div>

      {categories && categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Kategoriyalar mavjud emas
            </h3>
            <p className="text-gray-600 mb-4">
              Birinchi kategoriyangizni qo'shishdan boshlang
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Kategoriya qo'shish
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories?.map((category: Category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {category.nameUz}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Faol" : "Nofaol"}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{category.nameRu}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.descriptionUz && (
                    <div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {category.descriptionUz}
                      </p>
                    </div>
                  )}
                  
                  {category.sortOrder !== null && (
                    <div className="text-xs text-gray-500">
                      Tartib: {category.sortOrder}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddCategoryModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
}