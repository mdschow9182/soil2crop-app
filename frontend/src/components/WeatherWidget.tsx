import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  rainfall_probability: number;
  description: string;
  icon: string;
  irrigation_suggestion?: string;
  timestamp?: string;
  city?: string;
  country?: string;
}

interface WeatherWidgetProps {
  latitude?: number;
  longitude?: number;
  location?: string;
}

export const WeatherWidget = ({ 
  latitude = 16.3067, // Default: Guntur
  longitude = 80.4365, 
  location = 'Your Farm'
}: WeatherWidgetProps) => {
 const [weather, setWeather] = useState<WeatherData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

  useEffect(() => {
   const fetchWeather = async () => {
     try {
        setLoading(true);
        setError(null);
        
       const response = await api.get('/api/weather', {
          params: { lat: latitude, lon: longitude }
        });
        
       if (response.data.success && response.data.data) {
          setWeather(response.data.data);
        } else {
          setError('Failed to fetch weather data');
        }
      } catch (err) {
       console.error('[WeatherWidget] Error fetching weather:', err);
        setError('Unable to load weather. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh weather every 30 minutes
   const interval = setInterval(fetchWeather, 30 * 60 * 1000);
   return () => clearInterval(interval);
  }, [latitude, longitude]);

 const getWeatherIcon = (iconCode: string) => {
  switch (iconCode?.charAt(0)) {
    case '01':
     return <Sun className="w-12 h-12 text-yellow-500" />;
    case '02':
    case '03':
    case '04':
     return <Cloud className="w-12 h-12 text-gray-400" />;
    case '09':
    case '10':
    case '11':
    case '12':
     return <CloudRain className="w-12 h-12 text-blue-500" />;
    default:
     return <Sun className="w-12 h-12 text-yellow-500" />;
  }
};

 const getIrrigationAdvice = (weatherData: WeatherData) => {
   if (weatherData.rainfall_probability > 0.6) {
     return { text: "Rain expected - Delay irrigation", color: "text-blue-600" };
    } else if (weatherData.humidity > 70) {
     return { text: "High humidity - Reduce watering", color: "text-green-600" };
    } else if (weatherData.humidity < 40) {
     return { text: "Low humidity - Increase watering", color: "text-orange-600" };
    } else {
     return { text: "Normal irrigation schedule", color: "text-green-600" };
    }
  };

  if (loading) {
   return(
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-blue-200 rounded w-1/2"></div>
            <div className="h-16 bg-blue-200 rounded"></div>
            <div className="h-4 bg-blue-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
   return(
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <Cloud className="w-12 h-12 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

 const irrigationAdvice = getIrrigationAdvice(weather);

  return(
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-blue-900 flex items-center justify-between">
          <span>🌤️ {location}</span>
          <span className="text-xs font-normal text-blue-700">
            {new Date(weather.timestamp).toLocaleTimeString()}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Main Weather Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {getWeatherIcon(weather.icon)}
            <div>
              <div className="text-4xl font-bold text-blue-900">
                {weather.temperature}°C
              </div>
              <div className="text-sm text-blue-700 capitalize">
                {weather.description}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-blue-700">
              Feels like {weather.feels_like}°C
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {weather.city || location}
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 bg-white/60 rounded-lg p-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-xs text-gray-600">Humidity</div>
              <div className="font-semibold text-blue-900">{weather.humidity}%</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-white/60 rounded-lg p-2">
            <Wind className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-xs text-gray-600">Wind</div>
              <div className="font-semibold text-blue-900">{weather.wind_speed} m/s</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-white/60 rounded-lg p-2">
            <Thermometer className="w-5 h-5 text-red-600" />
            <div>
              <div className="text-xs text-gray-600">Pressure</div>
              <div className="font-semibold text-blue-900">{weather.pressure} hPa</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-white/60 rounded-lg p-2">
            <CloudRain className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="text-xs text-gray-600">Rain Chance</div>
              <div className="font-semibold text-blue-900">
                {Math.round(weather.rainfall_probability* 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Irrigation Suggestion */}
        {weather.irrigation_suggestion && (
          <div className={`border-l-4 ${irrigationAdvice.color.replace('text', 'border')} bg-white/60 rounded-r-lg p-3`}>
            <div className="flex items-start space-x-2">
              <CloudRain className={`w-5 h-5 ${irrigationAdvice.color} mt-0.5`} />
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">
                  💧 Irrigation Advice
                </div>
                <div className={`text-sm ${irrigationAdvice.color}`}>
                  {weather.irrigation_suggestion}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
