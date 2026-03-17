import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Sprout, TrendingUp, Info, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { speakMessage } from '@/utils/voiceAssistant';
import api from '@/lib/api';
import { useToast } from "@/hooks/use-toast";

const CropCalendar = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [cropData, setCropData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);

  // Available crops list
  const crops = [
    { id: 'rice', name: language === 'te' ? 'వరి' : language === 'hi' ? 'चावल' : 'Rice' },
    { id: 'wheat', name: language === 'te' ? 'గోధుమ' : language === 'hi' ? 'गेहूं' : 'Wheat' },
    { id: 'maize', name: language === 'te' ? 'మొక్కజొన్న' : language === 'hi' ? 'मक्का' : 'Maize' },
    { id: 'cotton', name: language === 'te' ? 'పత్తి' : language === 'hi' ? 'कपास' : 'Cotton' },
    { id: 'groundnut', name: language === 'te' ? 'పల్లీలు' : language === 'hi' ? 'मूंगफली' : 'Groundnut' },
    { id: 'soybean', name: language === 'te' ? 'సోయాబీన్' : language === 'hi' ? 'सोयाबीन' : 'Soybean' },
    { id: 'sugarcane', name: language === 'te' ? 'చెరకు' : language === 'hi' ? 'गन्ना' : 'Sugarcane' },
    { id: 'tomato', name: language === 'te' ? 'టమాటా' : language === 'hi' ? 'टमाटर' : 'Tomato' }
  ];

  // Fetch crop calendar data
  useEffect(() => {
    fetchCropCalendar(selectedCrop);
  }, [selectedCrop]);

  const fetchCropCalendar = async (crop) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/api/crop-calendar?crop=${crop}`);
      
      if (response.data.success) {
        setCropData(response.data.data);
        
        // Voice announcement
        const message = language === 'te' 
          ? `${response.data.data.crop} పంట క్యాలెండర్ చూపిస్తున్నాము`
          : language === 'hi'
          ? `${response.data.data.crop} फसल कैलेंडर दिखा रहे हैं`
          : `Showing ${response.data.data.crop} crop calendar`;
        
        speakMessage(message, language);
      }
    } catch (err) {
      console.error('Error fetching crop calendar:', err);
      setError('Failed to load crop calendar. Please try again.');
      toast({
        title: language === 'te' ? 'లోడైంగ్ విఫలమైంది' : language === 'hi' ? 'लोडिंग विफल' : 'Loading Failed',
        description: err.response?.data?.message || 'Error loading crop calendar',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate current stage based on a sample planting date (for demo)
  useEffect(() => {
    if (cropData) {
      // Demo: Assume planted 30 days ago
      const plantingDate = new Date();
      plantingDate.setDate(plantingDate.getDate() - 30);
      
      const daysSincePlanting = 30;
      const currentWeek = Math.floor(daysSincePlanting / 7);
      
      const stages = cropData.stages || [];
      const pastStages = stages.filter(s => s.week <= currentWeek);
      const current = pastStages.length > 0 ? pastStages[pastStages.length - 1] : null;
      const next = stages.find(s => s.week > currentWeek) || null;
      
      setCurrentStage({
        current,
        next,
        week: currentWeek,
        days: daysSincePlanting
      });
    }
  }, [cropData]);

  const getStageIcon = (icon) => {
    return icon || '🌾';
  };

  const isStageCompleted = (stageWeek) => {
    if (!currentStage) return false;
    return stageWeek <= currentStage.week;
  };

  const isCurrentStage = (stageWeek) => {
    if (!currentStage) return false;
    return stageWeek === currentStage.week;
  };

  const isFutureStage = (stageWeek) => {
    if (!currentStage) return false;
    return stageWeek > currentStage.week;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Sprout className="h-12 w-12 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-lg font-semibold">
            {language === 'te' ? 'లోడ్ చేస్తోంది...' : language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Calendar className="h-8 w-8 text-green-600" />
          {language === 'te' ? 'పంట క్యాలెండర్' : language === 'hi' ? 'फसल कैलेंडर' : 'Crop Calendar'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'te' 
            ? 'పంట పెంపకంలో వారం వారీ కార్యకలాపాలు' 
            : language === 'hi'
            ? 'फसल विकास में साप्ताहिक गतिविधियाँ'
            : 'Week-by-week farming activities guide'}
        </p>
      </div>

      {/* Crop Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5" />
            {language === 'te' ? 'పంట ఎంచుకోండి' : language === 'hi' ? 'फसल चुनें' : 'Select Crop'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {crops.map((crop) => (
              <Button
                key={crop.id}
                onClick={() => setSelectedCrop(crop.id)}
                variant={selectedCrop === crop.id ? 'default' : 'outline'}
                className={`flex flex-col h-auto py-3 ${
                  selectedCrop === crop.id 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : ''
                }`}
              >
                <span className="text-sm font-semibold">{crop.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Crop Info */}
      {cropData && (
        <>
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <span className="text-2xl">{cropData.crop}</span>
                  <span className="text-sm text-muted-foreground ml-2 italic">
                    ({cropData.scientificName})
                  </span>
                </div>
                <Badge variant="secondary" className="text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  {cropData.duration} {language === 'te' ? 'రోజులు' : language === 'hi' ? 'दिन' : 'days'}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Current Stage Highlight */}
          {currentStage && currentStage.current && (
            <Alert className="mb-6 border-green-500 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription>
                <div className="font-semibold text-green-900">
                  {language === 'te' 
                    ? `ప్రస్తుత దశ (వారం ${currentStage.week}): ${currentStage.current.task}`
                    : language === 'hi'
                    ? `वर्तमान चरण (सप्ताह ${currentStage.week}): ${currentStage.current.task}`
                    : `Current Stage (Week ${currentStage.week}): ${currentStage.current.task}`}
                </div>
                {currentStage.next && (
                  <div className="text-sm text-green-700 mt-1">
                    {language === 'te'
                      ? `తర్వాత: ${currentStage.next.task} (వారం ${currentStage.next.week})`
                      : language === 'hi'
                      ? `अगला: ${currentStage.next.task} (सप्ताह ${currentStage.next.week})`
                      : `Next: ${currentStage.next.task} (Week ${currentStage.next.week})`}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Timeline */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {language === 'te' ? 'పంట పెరుగుదల దశలు' : language === 'hi' ? 'फसल विकास चरण' : 'Growth Stages Timeline'}
            </h2>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

              {/* Stages */}
              {cropData.stages.map((stage, index) => {
                const completed = isStageCompleted(stage.week);
                const current = isCurrentStage(stage.week);
                const future = isFutureStage(stage.week);

                return (
                  <div key={index} className="relative flex items-start gap-4 mb-6 pl-20">
                    {/* Week badge */}
                    <div className={`absolute left-4 flex items-center justify-center w-8 h-8 rounded-full border-2 z-10 ${
                      completed 
                        ? 'bg-green-600 border-green-600 text-white' 
                        : current
                        ? 'bg-yellow-400 border-yellow-400 text-white animate-pulse'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">{stage.week}</span>
                      )}
                    </div>

                    {/* Content card */}
                    <Card className={`flex-1 transition-all ${
                      current 
                        ? 'border-yellow-400 shadow-lg bg-yellow-50' 
                        : completed
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 opacity-75'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="text-2xl">{getStageIcon(stage.icon)}</span>
                            <div>
                              <h3 className={`font-semibold ${
                                current ? 'text-yellow-900' : ''
                              }`}>
                                {stage.task}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {language === 'te' 
                                  ? `వారం ${stage.week}` 
                                  : language === 'hi'
                                  ? `सप्ताह ${stage.week}`
                                  : `Week ${stage.week}`}
                              </p>
                            </div>
                          </div>
                          
                          {current && (
                            <Badge className="bg-yellow-500">
                              {language === 'te' ? 'ప్రస్తుతం' : language === 'hi' ? 'वर्तमान' : 'Current'}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-sm">
                {language === 'te' ? 'లెజెండ్' : language === 'hi' ? 'लीजेंड' : 'Legend'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-600" />
                  <span>{language === 'te' ? 'పూర్తయింది' : language === 'hi' ? 'पूर्ण हुआ' : 'Completed'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400 animate-pulse" />
                  <span>{language === 'te' ? 'ప్రస్తుతం' : language === 'hi' ? 'वर्तमान' : 'Current'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-white border border-gray-300" />
                  <span>{language === 'te' ? 'రాబోయేది' : language === 'hi' ? 'आने वाला' : 'Upcoming'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CropCalendar;
