import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Droplets, FlaskConical, Sprout, Wheat } from "lucide-react";
import { VoiceButton } from "@/components/VoiceButton";
import { useLanguage } from "@/context/LanguageContext";

const Dashboard = () => {
  const [farmerName] = useState(() => localStorage.getItem("farmer_name") || "");
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const welcome = farmerName ? `${t.welcome}, ${farmerName}` : t.welcome;

  const actions = [
    { title: t.soilHealthSummary, description: t.uploadSoil, path: "/soil-report", icon: FlaskConical, tone: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    { title: t.navCropAdvice, description: t.generate, path: "/crop-suggestion", icon: Wheat, tone: "bg-amber-50 text-amber-900 border-amber-200" },
    { title: t.irrigationAdvisory, description: t.irrigationCategoryCaveat, path: "/crop-suggestion", icon: Droplets, tone: "bg-sky-50 text-sky-900 border-sky-200" },
    { title: t.fertilizerAdvisory, description: t.fertilizerCalculationNotPerformed, path: "/crop-suggestion", icon: Sprout, tone: "bg-lime-50 text-lime-900 border-lime-200" },
    { title: t.cropCalendarTitle, description: t.homeCalendarDescription, path: "/crop-calendar", icon: CalendarDays, tone: "bg-violet-50 text-violet-900 border-violet-200" },
  ];

  return (
    <main className="mx-auto min-h-[calc(100dvh-8rem)] w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
      <section className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-emerald-50 p-5 shadow-sm sm:p-7">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Soil2Crop</p>
          <h1 className="mt-1 break-words text-2xl font-bold leading-tight text-foreground sm:text-3xl">{welcome}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t.smartFarming}</p>
        </div>
        <VoiceButton language={language} message={`${welcome}. ${t.smartFarming}`} variant="outline" size="sm" />
      </section>

      <section aria-label={t.dashboard} className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {actions.map(({ title, description, path, icon: Icon, tone }) => (
          <button
            key={title}
            type="button"
            onClick={() => navigate(path)}
            className="group flex min-h-28 w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-36 sm:p-5"
          >
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${tone}`}>
              <Icon aria-hidden="true" className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold leading-snug text-foreground">{title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{description}</span>
            </span>
            <span aria-hidden="true" className="text-xl text-muted-foreground transition-transform group-hover:translate-x-1">›</span>
          </button>
        ))}
      </section>

      <p className="mt-6 rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">{t.advisory}</p>
    </main>
  );
};

export default Dashboard;
