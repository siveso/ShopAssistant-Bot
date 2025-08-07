import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Price is required"),
  stockQuantity: z.string().min(1, "Stock quantity is required"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<ProductFormData>;
}

export function ProductForm({ onSubmit, isLoading, defaultValues }: ProductFormProps) {
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-secondary-300 focus:ring-primary-500">
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="electronics">Elektronika</SelectItem>
                  <SelectItem value="clothing">Kiyim</SelectItem>
                  <SelectItem value="home-garden">Uy va Bog'</SelectItem>
                  <SelectItem value="sports-outdoors">Sport va Dam Olish</SelectItem>
                  <SelectItem value="books">Kitoblar</SelectItem>
                  <SelectItem value="toys">O'yinchoqlar</SelectItem>
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
