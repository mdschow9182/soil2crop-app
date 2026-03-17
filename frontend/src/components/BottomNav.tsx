import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Wheat, BarChart3, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const NAV_ITEMS = [
  { 
    path: "/dashboard", 
    labelKey: "navDashboard", 
    defaultLabel: "Dashboard", 
    icon: LayoutDashboard 
  },
  { 
    path: "/soil-report", 
    labelKey: "navSoilReport", 
    defaultLabel: "Soil Report", 
    icon: FileText 
  },
  { 
    path: "/crop-suggestion", 
    labelKey: "navCropAdvice", 
    defaultLabel: "Crop Advice", 
    icon: Wheat 
  },
  { 
    path: "/market-prices", 
    labelKey: "navMarketSchemes", 
    defaultLabel: "Market & Schemes", 
    icon: BarChart3 
  },
  { 
    path: "/alerts", 
    labelKey: "navAlerts", 
    defaultLabel: "Alerts", 
    icon: Bell 
  },
  { 
    path: "/settings", 
    labelKey: "navSettings", 
    defaultLabel: "Settings", 
    icon: Settings 
  },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const label = (t as any)[item.labelKey] ?? item.defaultLabel;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 min-w-0 flex-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span className={cn("text-xs leading-tight truncate max-w-full text-center", isActive && "font-bold")}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
