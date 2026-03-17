import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers, Ruler } from "lucide-react";

interface SoilInputSectionProps {
  fertility: string;
  area: string;
  onFertilityChange: (value: string) => void;
  onAreaChange: (value: string) => void;
}

const SoilInputSection = ({ fertility, area, onFertilityChange, onAreaChange }: SoilInputSectionProps) => {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-heading font-bold text-foreground mb-5 flex items-center gap-2">
        <Layers className="w-5 h-5 text-primary" />
        Soil Input
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="fertility" className="text-sm font-medium text-muted-foreground">
            Soil Fertility
          </Label>
          <Select value={fertility} onValueChange={onFertilityChange}>
            <SelectTrigger id="fertility" className="bg-background">
              <SelectValue placeholder="Select fertility level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">🟤 Low</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="high">🟢 High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="area" className="text-sm font-medium text-muted-foreground">
            Land Area (acres)
          </Label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="area"
              type="number"
              min="0"
              placeholder="e.g. 5"
              value={area}
              onChange={(e) => onAreaChange(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SoilInputSection;
