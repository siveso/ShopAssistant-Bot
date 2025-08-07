import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductForm } from "@/components/forms/product-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertProduct } from "@shared/schema";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProductModal({ open, onOpenChange }: AddProductModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const productData: InsertProduct = {
        nameUz: data.nameUz,
        nameRu: data.nameRu,
        descriptionUz: data.descriptionUz || "",
        descriptionRu: data.descriptionRu || "",
        price: data.price,
        stockQuantity: parseInt(data.stockQuantity),
        imageUrl: data.imageUrl || null,
        category: data.category || null,
        isActive: true,
      };

      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-secondary-800">
            Add New Product
          </DialogTitle>
        </DialogHeader>
        
        <ProductForm
          onSubmit={(data) => createProductMutation.mutate(data)}
          isLoading={createProductMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
