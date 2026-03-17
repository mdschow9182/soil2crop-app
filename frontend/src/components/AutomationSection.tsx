import { Power } from "lucide-react";

interface AutomationSectionProps {
  motorOn: boolean;
  onToggle: () => void;
}

const AutomationSection = ({ motorOn, onToggle }: AutomationSectionProps) => {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-heading font-bold text-foreground mb-5 flex items-center gap-2">
        <Power className="w-5 h-5 text-primary" />
        Automation
      </h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-foreground">Water Motor</p>
          <p className="text-sm text-muted-foreground">
            {motorOn ? "Irrigating field automatically" : "Motor is idle"}
          </p>
        </div>
        <button
          onClick={onToggle}
          className={`relative inline-flex h-10 w-20 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            motorOn ? "bg-motor-on" : "bg-muted"
          }`}
        >
          <span
            className={`pointer-events-none block h-8 w-8 rounded-full bg-card shadow-lg ring-0 transition-transform ${
              motorOn ? "translate-x-10" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <div className={`mt-4 rounded-lg px-4 py-2.5 text-sm font-semibold text-center ${
        motorOn
          ? "bg-motor-on/15 text-motor-on"
          : "bg-muted text-muted-foreground"
      }`}>
        Status: {motorOn ? "ON" : "OFF"}
      </div>
    </section>
  );
};

export default AutomationSection;
