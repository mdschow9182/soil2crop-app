import { useState } from "react";
import { API_BASE_URL, healthCheck } from "@/api";

const ApiConfigurationDebug = () => {
  const [healthStatus, setHealthStatus] = useState("Not checked");
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    setHealthStatus("Checking…");

    try {
      const result = await healthCheck();
      setHealthStatus(result?.success ? "Healthy" : "Responded; inspect API result");
    } catch (error) {
      setHealthStatus(error instanceof Error ? `Failed: ${error.message}` : "Health check failed");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl space-y-4 rounded-lg border bg-card p-5 text-card-foreground">
      <h1 className="text-xl font-semibold">API Configuration</h1>
      <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
      <p className="break-all"><strong>API URL:</strong> {API_BASE_URL || "Not configured"}</p>
      <div className="space-y-2">
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60"
          onClick={checkHealth}
          disabled={isChecking || !API_BASE_URL}
        >
          {isChecking ? "Checking…" : "Check API health"}
        </button>
        <p role="status"><strong>Health:</strong> {healthStatus}</p>
      </div>
    </main>
  );
};

export default ApiConfigurationDebug;
