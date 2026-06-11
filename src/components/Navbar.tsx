import { Link, useLocation } from "react-router-dom";
import { Home, PlusCircle, Bell, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "首页", icon: Home },
    { path: "/create", label: "创建", icon: PlusCircle },
    { path: "/reminders", label: "提醒", icon: Bell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto bg-cream-50/90 backdrop-blur-md border-t md:border-t-0 md:border-b border-memorial-200/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-memorial-950 flex items-center justify-center text-cream-100 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="font-serif text-xl text-memorial-950 font-medium hidden sm:block">
              永念
            </span>
          </Link>

          <div className="flex items-center gap-1 md:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-1 px-3 py-2 rounded-lg transition-all",
                    isActive
                      ? "text-memorial-950 bg-memorial-100"
                      : "text-memorial-500 hover:text-memorial-700 hover:bg-memorial-50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs md:text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
