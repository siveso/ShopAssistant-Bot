import { Link, useLocation } from "wouter";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Boshqaruv Paneli", path: "/", icon: "fas fa-chart-line" },
  { name: "Mahsulotlar", path: "/products", icon: "fas fa-box" },
  { name: "Buyurtmalar", path: "/orders", icon: "fas fa-shopping-cart" },
  { name: "Blog", path: "/admin/blogs", icon: "fas fa-blog" },
  { name: "Blog Generator", path: "/blog-generator", icon: "fas fa-rss" },
  { name: "Foydalanuvchilar", path: "/users", icon: "fas fa-users" },
  { name: "Suhbatlar", path: "/conversations", icon: "fas fa-comments" },
  { name: "Bot Sozlamalari", path: "/bot-settings", icon: "fas fa-cogs" },
  { name: "Tarjimalar", path: "/translations", icon: "fas fa-language" },
  { name: "Kategoriyalar", path: "/categories", icon: "fas fa-tags" },
  { name: "Marketing", path: "/marketing", icon: "fas fa-bullhorn" },
  { name: "Hisobotlar", path: "/analytics", icon: "fas fa-chart-bar" },
];

const supportItems = [
  { name: "Yordam va Qo'llab-quvvatlash", path: "/help", icon: "fas fa-question-circle" },
  { name: "Chiqish", path: "/logout", icon: "fas fa-sign-out-alt" },
];

export function Sidebar() {
  const { isOpen, close } = useSidebar();
  const [location] = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-secondary-200 w-64 flex-shrink-0 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-robot text-white text-sm"></i>
            </div>
            <span className="text-lg font-semibold text-secondary-800">Savdo Yordamchisi</span>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                    location === item.path
                      ? "bg-primary-50 text-primary-700"
                      : "text-secondary-700 hover:bg-secondary-100"
                  )}
                  onClick={close}
                >
                  <i className={`${item.icon} w-5`}></i>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-8 pt-4 border-t border-secondary-200">
            <ul className="space-y-2">
              {supportItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-secondary-100 font-medium transition-colors"
                    onClick={close}
                  >
                    <i className={`${item.icon} w-5`}></i>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}
