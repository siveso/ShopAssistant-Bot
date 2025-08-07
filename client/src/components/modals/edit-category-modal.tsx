import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Category } from "@shared/schema";

interface EditCategoryModalProps {
  category: Category;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCategoryModal({ category, isOpen, onClose }: EditCategoryModalProps) {
  const [formData, setFormData] = useState({
    nameUz: "",
    nameRu: "",
    descriptionUz: "",
    descriptionRu: "",
    imageUrl: "",
    sortOrder: "0",
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (category) {
      setFormData({
        nameUz: category.nameUz || "",
        nameRu: category.nameRu || "",
        descriptionUz: category.descriptionUz || "",
        descriptionRu: category.descriptionRu || "",
        imageUrl: category.imageUrl || "",
        sortOrder: (category.sortOrder || 0).toString(),
        isActive: category.isActive ?? true,
      });
    }
  }, [category]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const categoryData = {
        nameUz: data.nameUz,
        nameRu: data.nameRu,
        descriptionUz: data.descriptionUz || null,
        descriptionRu: data.descriptionRu || null,
        imageUrl: data.imageUrl || null,
        sortOrder: parseInt(data.sortOrder) || 0,
        isActive: data.isActive,
      };

      return await apiRequest(`/api/categories/${category.id}`, {
        method: "PUT",
        body: JSON.stringify(categoryData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyat",
        description: "Kategoriya muvaffaqiyatli yangilandi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      onClose();
    },
    onError: (error: any) => {
      console.error("Category update error:", error);
      toast({
        title: "Xato",
        description: "Kategoriyani yangilashda xato yuz berdi",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameUz.trim() || !formData.nameRu.trim()) {
      toast({
        title: "Xato",
        description: "Kategoriya nomini o'zbek va rus tillarida kiriting",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Kategoriyani tahrirlash</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nameUz">Nomi (O'zbek) *</Label>
            <Input
              id="nameUz"
              value={formData.nameUz}
              onChange={(e) => handleInputChange("nameUz", e.target.value)}
              placeholder="Kategoriya nomi o'zbek tilida"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameRu">Nomi (Rus) *</Label>
            <Input
              id="nameRu"
              value={formData.nameRu}
              onChange={(e) => handleInputChange("nameRu", e.target.value)}
              placeholder="Kategoriya nomi rus tilida"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionUz">Tavsifi (O'zbek)</Label>
            <Textarea
              id="descriptionUz"
              value={formData.descriptionUz}
              onChange={(e) => handleInputChange("descriptionUz", e.target.value)}
              placeholder="Kategoriya tavsifi o'zbek tilida"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionRu">Tavsifi (Rus)</Label>
            <Textarea
              id="descriptionRu"
              value={formData.descriptionRu}
              onChange={(e) => handleInputChange("descriptionRu", e.target.value)}
              placeholder="Kategoriya tavsifi rus tilida"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Rasm URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange("imageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">Tartiblash raqami</Label>
            <Input
              id="sortOrder"
              value={formData.sortOrder}
              onChange={(e) => handleInputChange("sortOrder", e.target.value)}
              placeholder="0"
              type="number"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
            <Label htmlFor="isActive">Faol</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Bekor qilish
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              {updateMutation.isPending ? "Yangilanmoqda..." : "Yangilash"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}