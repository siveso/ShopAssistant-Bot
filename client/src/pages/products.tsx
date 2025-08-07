import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddProductModal } from "@/components/modals/add-product-modal";
import { EditProductModal } from "@/components/modals/edit-product-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest(`/api/products/${productId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyat",
        description: "Mahsulot o'chirildi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Mahsulotni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products.filter((product: Product) =>
    product.nameUz.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.nameRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-secondary-800">Mahsulotlar</h1>
        <Button
          onClick={() => setShowAddProduct(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          <i className="fas fa-plus mr-2"></i>
          Mahsulot Qo'shish
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Mahsulot qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-secondary-300"
              />
            </div>
            <Button variant="outline" className="border-secondary-300">
              <i className="fas fa-filter mr-2"></i>
              Filtr
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="border border-secondary-200">
              <div className="animate-pulse">
                <div className="h-48 bg-secondary-200 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                  <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                  <div className="h-8 bg-secondary-200 rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-secondary-500">
              <i className="fas fa-box-open text-4xl mb-4"></i>
              <h3 className="text-lg font-medium mb-2">Mahsulot topilmadi</h3>
              <p className="text-sm">
                {searchQuery ? "Qidiruv so'zini o'zgartirib ko'ring" : "Birinchi mahsulotingizni qo'shish bilan boshlang"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowAddProduct(true)}
                  className="mt-4 bg-primary-600 hover:bg-primary-700 text-white"
                >
                  Mahsulot Qo'shish
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: Product) => (
            <Card key={product.id} className="border border-secondary-200 hover:shadow-lg transition-shadow">
              {product.imageUrl && (
                <div className="aspect-square bg-secondary-100 rounded-t-lg overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.nameUz}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-secondary-800 line-clamp-2">
                      {product.nameUz}
                    </h3>
                    <p className="text-sm text-secondary-600 line-clamp-2">
                      {product.nameRu}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-secondary-800">
                      ${product.price}
                    </span>
                    <Badge variant={(product.stockQuantity || 0) > 0 ? "default" : "destructive"}>
                      {(product.stockQuantity || 0) > 0 ? `${product.stockQuantity || 0} dona` : "Tugagan"}
                    </Badge>
                  </div>

                  {product.category && (
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setEditingProduct(product)}
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Tahrirlash
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        if (confirm("Bu mahsulotni o'chirishni tasdiqlaysizmi?")) {
                          deleteProductMutation.mutate(product.id);
                        }
                      }}
                      disabled={deleteProductMutation.isPending}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddProductModal 
        open={showAddProduct} 
        onOpenChange={setShowAddProduct}
      />
      
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open: boolean) => !open && setEditingProduct(null)}
        />
      )}
    </div>
  );
}
