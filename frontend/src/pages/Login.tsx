import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Phone, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { loginFarmer, registerFarmer } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { supportedLanguages, type LanguageCode } from "@/i18n/translations";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateMobile = (number: string): boolean => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(number);
  };

  const handleLogin = async () => {
    if (!validateMobile(mobile)) {
      toast({
        title: t.error,
        description: t.validMobileNumber,
        variant: "destructive",
      });
      return;
    }

    const minimumPasswordLength = isRegistering ? 8 : 6;
    if (password.length < minimumPasswordLength) {
      toast({ title: t.error, description: `Use a password with at least ${minimumPasswordLength} characters.`, variant: "destructive" });
      return;
    }
    if (isRegistering && (!name.trim() || !district.trim())) {
      toast({ title: t.error, description: "Enter your name and district to create an account.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) await registerFarmer({ name: name.trim(), mobile, password, district: district.trim(), language });
      const response = await loginFarmer({ mobile, password, language });
      
      // Extract farmer from response
      const farmer = response.farmer;
      
      if (farmer && farmer._id) {
        if (!response.token) throw new Error("The server did not return a secure login token.");
        localStorage.setItem("soil2crop_token", response.token);
        // Store MongoDB _id for API calls
        localStorage.setItem("farmerId", farmer._id.toString());
        // Also store farmer_id for backward compatibility
        localStorage.setItem("farmer_id", farmer.farmer_id.toString());
        if (farmer.name) localStorage.setItem("farmer_name", farmer.name);
        localStorage.setItem("language", language);
        localStorage.setItem("soil2crop_language", language);
        toast({
          title: t.welcome,
          description: `${t.loggedInAs} ${farmer.name || t.farmerName}`,
        });
        navigate("/soil-report");
      } else {
        toast({
          title: t.loginFailed,
          description: t.invalidServerResponse,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: t.error,
        description: error.message || t.failedToConnect,
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
            {t.smartFarming}
          </p>
          <span className="inline-block text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-medium">
            {t.advisory}
          </span>
        </div>

        {/* Login Form */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
          <h2 className="text-xl font-heading font-bold text-foreground text-center">
            {isRegistering ? "Create farmer account" : t.farmerLogin}
          </h2>

          <div className="space-y-2">
            <Label htmlFor="mobile">{t.mobileNumber}</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="mobile"
                type="tel"
                placeholder={t.enterMobile}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="pl-11 h-12"
              />
            </div>
          </div>

          {isRegistering && <>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} />
            </div>
          </>}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete={isRegistering ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            {isRegistering && <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">{t.language}</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="w-full h-12 pl-11 pr-4 rounded-md border bg-background text-base"
              >
                {supportedLanguages.map((item) => <option key={item.code} value={item.code}>{item.native} ({item.name})</option>)}
              </select>
            </div>
          </div>

          <Button onClick={handleLogin} className="w-full h-12" disabled={isLoading}>
            {isLoading ? t.loggingIn : isRegistering ? "Create account" : t.login}
          </Button>
          <button type="button" className="w-full text-sm text-primary underline" onClick={() => setIsRegistering((value) => !value)}>
            {isRegistering ? "Already have an account? Sign in" : "New farmer? Create an account"}
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          {t.advisorySimulation}
        </p>
      </div>
    </div>
  );
};

export default Login;
