import { useNavigate, useLocation } from "react-router-dom";
import { Sprout, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CROP_NAMES: Record<string, string> = {
  paddy: "🌾 Paddy",
  cotton: "🏵️ Cotton",
  groundnut: "🥜 Groundnut",
  soybean: "🫘 Soybean",
};

const STAGES = [
  {
    name: "🌱 Sowing",
    weeks: "Week 1–2",
    organic: "Apply well-decomposed FYM (2–3 tons/acre). Use Rhizobium seed treatment.",
    chemical: "Optional: DAP 25 kg/acre at sowing (advisory only).",
  },
  {
    name: "🌿 Vegetative",
    weeks: "Week 3–8",
    organic: "Foliar spray of Panchagavya. Apply vermicompost top dressing.",
    chemical: "Optional: Urea 15 kg/acre if plants show yellowing.",
  },
  {
    name: "🌸 Flowering",
    weeks: "Week 9–12",
    organic: "Neem cake application (100 kg/acre). Bio-potash spray.",
    chemical: "Optional: MOP 10 kg/acre (advisory only).",
  },
  {
    name: "🌾 Harvest",
    weeks: "Week 13–16",
    organic: "Stop inputs 2 weeks before harvest. Incorporate crop residue back into soil.",
    chemical: "No chemical inputs recommended at this stage.",
  },
];

const CropDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cropId = "paddy" } = (location.state as any) || {};
  const cropName = CROP_NAMES[cropId] || "🌾 Paddy";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Sprout className="w-7 h-7 text-primary" />
          <h1 className="text-xl font-heading font-bold text-foreground">Crop Details & Calendar</h1>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="rounded-xl border bg-card p-5 shadow-sm text-center">
          <p className="text-sm text-muted-foreground">Selected Crop</p>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-1">{cropName}</h2>
        </div>

        {/* Crop Calendar */}
        <section className="space-y-4">
          <h2 className="text-lg font-heading font-bold text-foreground">📅 Crop Calendar</h2>
          {STAGES.map((stage, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-heading font-bold text-foreground">{stage.name}</h3>
                <span className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full font-medium">
                  {stage.weeks}
                </span>
              </div>
              <div className="space-y-2">
                <div className="rounded-lg bg-primary/5 p-3">
                  <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Leaf className="w-3 h-3" /> Organic
                  </p>
                  <p className="text-sm text-foreground">{stage.organic}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">⚗️ Chemical (Advisory)</p>
                  <p className="text-sm text-muted-foreground">{stage.chemical}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="rounded-lg bg-secondary p-3 text-xs text-center text-secondary-foreground">
          🌿 Organic practices are preferred for soil health.
        </div>

        <Button onClick={() => navigate("/crop-monitoring", { state: { cropId } })} className="w-full h-12 text-base font-semibold" size="lg">
          Proceed to Crop Monitoring <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </main>
    </div>
  );
};

export default CropDetails;
