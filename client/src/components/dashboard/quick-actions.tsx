import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AddProductModal } from "@/components/modals/add-product-modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuickActionProps {
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  onClick: () => void;
}

function QuickAction({ title, description, icon, iconBg, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 p-4 ${iconBg.replace('bg-', 'bg-').replace('-600', '-50')} hover:${iconBg.replace('bg-', 'bg-').replace('-600', '-100')} rounded-lg border ${iconBg.replace('bg-', 'border-').replace('-600', '-200')} transition-colors w-full text-left`}
    >
      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
        <i className={`${icon} text-white`}></i>
      </div>
      <div>
        <p className={`font-medium ${iconBg.replace('bg-', 'text-').replace('-600', '-900')}`}>
          {title}
        </p>
        <p className={`text-sm ${iconBg.replace('bg-', 'text-').replace('-600', '-600')}`}>
          {description}
        </p>
      </div>
    </button>
  );
}

export function QuickActions() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const restartBotMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/bot/restart"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bot services restarted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to restart bot services",
        variant: "destructive",
      });
    },
  });

  const actions = [
    {
      title: "Add Product",
      description: "Create new product",
      icon: "fas fa-plus",
      iconBg: "bg-blue-600",
      onClick: () => setShowAddProduct(true),
    },
    {
      title: "Manage Orders",
      description: "Process pending orders",
      icon: "fas fa-shopping-cart",
      iconBg: "bg-green-600",
      onClick: () => {
        // Navigate to orders page
        window.location.href = "/orders";
      },
    },
    {
      title: "Update FAQ",
      description: "Edit bot responses",
      icon: "fas fa-question-circle",
      iconBg: "bg-purple-600",
      onClick: () => {
        toast({
          title: "Coming Soon",
          description: "FAQ management feature is under development",
        });
      },
    },
    {
      title: "Restart Bot",
      description: "Restart bot services",
      icon: "fas fa-redo",
      iconBg: "bg-orange-600",
      onClick: () => restartBotMutation.mutate(),
    },
  ];

  return (
    <>
      <Card className="border border-secondary-200">
        <CardHeader className="p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-800">Quick Actions</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </div>
        </CardContent>
      </Card>

      <AddProductModal 
        open={showAddProduct} 
        onOpenChange={setShowAddProduct}
      />
    </>
  );
}
