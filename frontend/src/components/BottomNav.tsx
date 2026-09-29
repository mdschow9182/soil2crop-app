import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, Ellipsis, FileText, House, Wheat } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRIMARY_ITEMS = [
  { path: "/dashboard", label: "dashboard", icon: House },
  { path: "/soil-report", label: "soil", icon: FileText },
  { path: "/crop-suggestion", label: "navCropAdvice", icon: Wheat },
  { path: "/crop-calendar", label: "calendar", icon: CalendarDays },
] as const;

const MORE_ITEMS = [
  ["/alerts", "navAlerts"],
  ["/market-prices", "marketPricesTitle"],
  ["/government-schemes", "governmentSchemesTitle"],
  ["/tutorials", "tutorialsTitle"],
  ["/crop-monitoring", "cropHealthCheck"],
  ["/iot", "navIoT"],
  ["/settings", "settingsTitle"],
] as const;

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const moreIsActive = MORE_ITEMS.some(([path]) => location.pathname === path);

  if (location.pathname === "/") return null;

  return (
    <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex min-h-16 max-w-xl items-stretch justify-around px-1">
        {PRIMARY_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => navigate(path)}
              className={cn(
                "flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active && "font-semibold text-primary",
              )}
            >
              <Icon aria-hidden="true" className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span className="max-w-full truncate text-[11px] leading-tight">{t[label]}</span>
            </button>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t.more}
              aria-current={moreIsActive ? "page" : undefined}
              className={cn(
                "flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                moreIsActive && "font-semibold text-primary",
              )}
            >
              <Ellipsis aria-hidden="true" className="h-5 w-5" />
              <span className="max-w-full truncate text-[11px] leading-tight">{t.more}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" sideOffset={8} className="mb-2 max-h-[65vh] w-64 overflow-y-auto">
            {MORE_ITEMS.map(([path, label]) => (
              <DropdownMenuItem key={path} onSelect={() => navigate(path)} className="min-h-11 cursor-pointer text-base">
                {t[label]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onSelect={() => window.dispatchEvent(new Event("soil2crop:open-ai-assistant"))} className="min-h-11 cursor-pointer text-base">
              {t.openAiAssistant}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => window.dispatchEvent(new Event("soil2crop:open-farmer-support"))} className="min-h-11 cursor-pointer text-base">
              {t.farmerSupport}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default BottomNav;
