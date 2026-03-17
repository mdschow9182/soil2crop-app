import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, User, Phone, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { loginFarmer } from "@/api";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);

  const validateMobile = (number: string): boolean => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(number);
  };

  const handleLogin = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!validateMobile(mobile)) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginFarmer({ name, mobile, language });
      
      // Extract farmer_id from response (backward compatible)
      const farmerId = response.farmer_id || response.data?.farmer_id;
      
      if (farmerId) {
        localStorage.setItem("farmer_id", farmerId.toString());
        localStorage.setItem("language", language);
        toast({
          title: "Welcome!",
          description: `Logged in as ${name}`,
        });
        navigate("/soil-report");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid response from server",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <Sprout className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Soil2Crop
          </h1>
          <p className="text-muted-foreground">
            Smart Farming Decision Support System
          </p>
          <span className="inline-block text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-medium">
            Advisory Tool - Farmer Decides
          </span>
        </div>

        {/* Login Form */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
          <h2 className="text-xl font-heading font-bold text-foreground text-center">
            Farmer Login
          </h2>

          <div className="space-y-2">
            <Label htmlFor="name">Farmer Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-11 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="mobile"
                type="tel"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="pl-11 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-md border bg-background text-base"
              >
                <option value="en">English</option>
                <option value="te">Telugu</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="kn">Kannada</option>
                <option value="ml">Malayalam</option>
              </select>
            </div>
          </div>

          <Button onClick={handleLogin} className="w-full h-12" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          This is an advisory simulation system - not a replacement for agricultural experts.
          Final decisions remain with the farmer.
        </p>
      </div>
    </div>
  );
};

export default Login;
