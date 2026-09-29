import { useNavigate } from "react-router-dom";
import { Bell, Sprout } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Header = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b bg-card/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <button type="button" onClick={() => navigate("/dashboard")} className="flex min-h-11 items-center gap-2 rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Sprout aria-hidden="true" className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Soil2Crop</span>
        </button>
        <button
          type="button"
          onClick={() => navigate("/alerts")}
          aria-label={t.navAlerts}
          title={t.navAlerts}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
