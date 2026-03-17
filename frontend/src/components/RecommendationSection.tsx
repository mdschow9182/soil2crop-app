import { Sprout, Leaf } from "lucide-react";

interface Recommendation {
  crop: string;
  fertilizer: string;
  compostQty: string;
  fertilizerQty: string;
}

interface RecommendationSectionProps {
  fertility: string;
  area: string;
}

const getRecommendation = (fertility: string, area: string): Recommendation => {
  const acres = parseFloat(area) || 1;
  
  switch (fertility) {
    case "high":
      return {
        crop: "🌾 Wheat, 🍅 Tomato, 🌽 Corn",
        fertilizer: "Vermicompost + Neem Cake",
        compostQty: `${(acres * 1.5).toFixed(1)} – ${(acres * 2.0).toFixed(1)} tons`,
        fertilizerQty: `${(acres * 0.3).toFixed(1)} – ${(acres * 0.5).toFixed(1)} tons`,
      };
    case "medium":
      return {
        crop: "🥜 Groundnut, 🫘 Soybean, 🌻 Sunflower",
        fertilizer: "Farm Yard Manure + Bone Meal",
        compostQty: `${(acres * 2.0).toFixed(1)} – ${(acres * 3.0).toFixed(1)} tons`,
        fertilizerQty: `${(acres * 0.5).toFixed(1)} – ${(acres * 0.8).toFixed(1)} tons`,
      };
    default:
      return {
        crop: "🫛 Mung Bean, 🌱 Clover, 🥬 Spinach",
        fertilizer: "Green Manure + Bio-fertilizer",
        compostQty: `${(acres * 3.0).toFixed(1)} – ${(acres * 4.0).toFixed(1)} tons`,
        fertilizerQty: `${(acres * 0.8).toFixed(1)} – ${(acres * 1.2).toFixed(1)} tons`,
      };
  }
};

const RecommendationSection = ({ fertility, area }: RecommendationSectionProps) => {
  const rec = getRecommendation(fertility, area);

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-heading font-bold text-foreground mb-5 flex items-center gap-2">
        <Sprout className="w-5 h-5 text-primary" />
        Recommendations
      </h2>
      <div className="space-y-4">
        <div className="rounded-lg bg-secondary p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Recommended Crops</p>
          <p className="text-lg font-heading font-semibold text-secondary-foreground">{rec.crop}</p>
        </div>
        <div className="rounded-lg bg-secondary p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Organic Fertilizer</p>
          <p className="font-semibold text-secondary-foreground flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary" />
            {rec.fertilizer}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Compost Needed</p>
            <p className="font-heading font-bold text-foreground">{rec.compostQty}</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Fertilizer Needed</p>
            <p className="font-heading font-bold text-foreground">{rec.fertilizerQty}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecommendationSection;
