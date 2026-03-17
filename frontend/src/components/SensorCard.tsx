import { type ReactNode } from "react";

interface SensorCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  unit: string;
  colorClass: string;
}

const SensorCard = ({ icon, label, value, unit, colorClass }: SensorCardProps) => {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`rounded-lg p-2.5 ${colorClass}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-heading font-bold text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
};

export default SensorCard;
