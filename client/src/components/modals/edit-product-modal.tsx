import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductForm } from "@/components/forms/product-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, InsertProduct } from "@shared/schema";

interface EditProductModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductModal({ product, open, onOpenChange }: EditProductModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const productData: Partial<InsertProduct> = {
        nameUz: data.nameUz,
        nameRu: data.nameRu,
        descriptionUz: data.descriptionUz || "",
        descriptionRu: data.descriptionRu || "",
        price: parseFloat(data.price),
        stockQuantity: parseInt(data.stockQuantity),
        imageUrl: data.imageUrl || null,
        category: data.category || null,
        isActive: data.isActive ?? true,
      };

      return await apiRequest(`/api/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyat",
        description: "Mahsulot yangilandi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description: error.message || "Mahsulotni yangilashda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-secondary-800">
            Mahsulotni Tahrirlash
          </DialogTitle>
        </DialogHeader>
        
        <ProductForm
          initialData={product}
          onSubmit={(data) => updateProductMutation.mutate(data)}
          isLoading={updateProductMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}