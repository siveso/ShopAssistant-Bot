import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { Category } from "@shared/schema";

const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Price is required"),
  stockQuantity: z.string().min(1, "Stock quantity is required"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<ProductFormData>;
  initialData?: any;
}

export function ProductForm({ onSubmit, isLoading, defaultValues, initialData }: ProductFormProps) {
  // Load categories from API
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => apiRequest("/api/categories"),
  });

  // Convert initialData to form format
  const formDefaults = initialData ? {
    nameUz: initialData.nameUz || "",
    nameRu: initialData.nameRu || "",
    descriptionUz: initialData.descriptionUz || "",
    descriptionRu: initialData.descriptionRu || "",
    price: initialData.price?.toString() || "",
    stockQuantity: initialData.stockQuantity?.toString() || "",
    category: initialData.category || "",
    imageUrl: initialData.imageUrl || "",
    isActive: initialData.isActive ?? true,
  } : undefined;
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nameUz: "",
      nameRu: "",
      descriptionUz: "",
      descriptionRu: "",
      price: "",
      stockQuantity: "",
      category: "",
      imageUrl: "",
      isActive: true,
      ...defaultValues,
      ...formDefaults,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nameUz"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-secondary-700">
                  Mahsulot Nomi (O'zbekcha)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Mahsulot nomi"
                    className="border-secondary-300 focus:ring-primary-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nameRu"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-secondary-700">
                  Mahsulot Nomi (Ruscha)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Название товара"
                    className="border-secondary-300 focus:ring-primary-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-secondary-700">
                  Narxi ($)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="border-secondary-300 focus:ring-primary-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-secondary-700">
                  Ombordagi Soni
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    className="border-secondary-300 focus:ring-primary-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-secondary-700">
                Kategoriya
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="border-secondary-300 focus:ring-primary-500">
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>Kategoriyalar yuklanmoqda...</SelectItem>
                  ) : categories && categories.length > 0 ? (
                    categories.map((category: Category) => (
                      <SelectItem key={category.id} value={category.nameUz}>
                        {category.nameUz} ({category.nameRu})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-categories" disabled>Kategoriyalar mavjud emas</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-secondary-700">
                Rasm URL
              </FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="border-secondary-300 focus:ring-primary-500"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descriptionUz"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-secondary-700">
                Ta'rif (O'zbekcha)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mahsulot haqida batafsil ma'lumot"
                  className="border-secondary-300 focus:ring-primary-500"
                  rows={3}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descriptionRu"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-secondary-700">
                Ta'rif (Ruscha)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Подробная информация о товаре"
                  className="border-secondary-300 focus:ring-primary-500"
                  rows={3}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Qo'shilmoqda...
              </>
            ) : (
              <>
                <i className="fas fa-plus mr-2"></i>
                Mahsulot Qo'shish
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
