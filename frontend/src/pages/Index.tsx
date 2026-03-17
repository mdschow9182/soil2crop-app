import { useState } from "react";
import { Droplets, Thermometer, CloudRain, FlaskConical, Sprout } from "lucide-react";
import SensorCard from "@/components/SensorCard";
import SoilInputSection from "@/components/SoilInputSection";
import AutomationSection from "@/components/AutomationSection";
import RecommendationSection from "@/components/RecommendationSection";

/* Simulated sensor data */
const SENSOR_DATA = {
  moisture: 42,
  ph: 6.5,
  temperature: 28,
  humidity: 65,
};

const Index = () => {
  const [fertility, setFertility] = useState("medium");
  const [area, setArea] = useState("5");
  const [motorOn, setMotorOn] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-6 flex items-center gap-3">
          <Sprout className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              Soil2Crop
            </h1>
            <p className="text-sm text-muted-foreground">
              Virtual Smart Farm Planning System
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Soil Inputs */}
        <SoilInputSection
          fertility={fertility}
          area={area}
          onFertilityChange={setFertility}
          onAreaChange={setArea}
        />

        {/* Sensor Dashboard */}
        <section>
          <h2 className="text-xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            📡 Sensor Dashboard
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SensorCard
              icon={<Droplets className="w-5 h-5 text-sensor-moisture" />}
              label="Soil Moisture"
              value={SENSOR_DATA.moisture}
              unit="%"
              colorClass="bg-sensor-moisture/10"
            />
            <SensorCard
              icon={<FlaskConical className="w-5 h-5 text-sensor-ph" />}
              label="Soil pH"
              value={SENSOR_DATA.ph}
              unit="pH"
              colorClass="bg-sensor-ph/10"
            />
            <SensorCard
              icon={<Thermometer className="w-5 h-5 text-sensor-temp" />}
              label="Temperature"
              value={SENSOR_DATA.temperature}
              unit="°C"
              colorClass="bg-sensor-temp/10"
            />
            <SensorCard
              icon={<CloudRain className="w-5 h-5 text-sensor-humidity" />}
              label="Humidity"
              value={SENSOR_DATA.humidity}
              unit="%"
              colorClass="bg-sensor-humidity/10"
            />
          </div>
        </section>

        {/* Bottom Grid: Automation + Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AutomationSection motorOn={motorOn} onToggle={() => setMotorOn(!motorOn)} />
          <RecommendationSection fertility={fertility} area={area} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-8">
        <div className="container max-w-5xl mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          Soil2Crop © 2026 — Smart Farm Planning for Modern Farmers
        </div>
      </footer>
    </div>
  );
};

export default Index;
