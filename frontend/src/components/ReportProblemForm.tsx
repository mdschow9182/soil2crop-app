import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { speakMessage } from '@/utils/voiceAssistant';
import { toast } from 'sonner';

interface ReportProblemFormProps {
  farmerId?: string;
  onSubmitSuccess?: () => void;
}

export const ReportProblemForm = ({ farmerId, onSubmitSuccess }: ReportProblemFormProps) => {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      message: '',
      cropType: ''
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      if (!farmerId) {
        toast.error('Please login to report problems');
        return;
      }

      // Create FormData for potential file upload
      const formData = new FormData();
      formData.append('farmerId', farmerId);
      formData.append('type', 'problem');
      formData.append('message', data.message);
      formData.append('cropType', data.cropType || '');
      formData.append('priority', 'high');
      formData.append('language', language);

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await api.post('/api/farmer-support', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSubmitSuccess(true);
      
      // Voice announcement
      const successMessage = language === 'te' 
        ? 'మీ సమస్య విజయవంతంగా నమోదు చేయబడింది. మా నిపుణులు త్వరలోనే పరిష్కరిస్తారు'
        : language === 'hi'
        ? 'आपकी समस्या सफलतापूर्वक दर्ज कर ली गई। हमारे विशेषज्ञ जल्द ही हल करेंगे'
        : 'Your problem has been reported successfully. Our experts will resolve it soon.';
      
      speakMessage(successMessage, language);
      toast.success('Problem reported! We\'ll respond soon.');

      reset();
      setSelectedImage(null);
      
      setTimeout(() => {
        setSubmitSuccess(false);
        onSubmitSuccess?.();
      }, 2000);
    } catch (error: any) {
      console.error('[ReportProblem] Error submitting:', error);
      toast.error(
        language === 'te' 
          ? 'సమస్య ఏర్పడింది. మళ్లీ ప్రయత్నించండి'
          : language === 'hi'
          ? 'त्रुटि हुई। पुनः प्रयास करें'
          : 'Failed to report problem. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      {submitSuccess ? (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {language === 'te' 
              ? '✅ మీ సమస్య విజయవంతంగా నమోదు చేయబడింది! మా నిపుణులు త్వరలోనే పరిష్కరిస్తారు.'
              : language === 'hi'
              ? '✅ आपकी समस्या सफलतापूर्वक दर्ज कर ली गई! हमारे विशेषज्ञ जल्द ही हल करेंगे।'
              : '✅ Your problem has been reported successfully! Our experts will resolve it soon.'}
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Crop Type */}
          <div className="space-y-2">
            <Label>
              {language === 'te' ? 'పంట రకం (ఐచ్ఛిక)' : language === 'hi' ? 'फसल का प्रकार (वैकल्पिक)' : 'Crop Type (Optional)'}
            </Label>
            <Input
              {...register('cropType')}
              placeholder={language === 'te' ? 'ఉదా: వరి, మొక్కజొన్న...' : language === 'hi' ? 'उदाहरण: चावल, मक्का...' : 'e.g., Rice, Maize...'}
            />
          </div>

          {/* Problem Description */}
          <div className="space-y-2">
            <Label>
              {language === 'te' ? 'సమస్య వివరణ' : language === 'hi' ? 'समस्या का विवरण' : 'Problem Description'}
            </Label>
            <Textarea
              {...register('message', { 
                required: language === 'te' ? 'వివరణ అవసరం' : language === 'hi' ? 'विवरण आवश्यक है' : 'Description is required',
                minLength: { value: 10, message: language === 'te' ? 'కనీసం 10 అక్షరాలు' : language === 'hi' ? 'कम से कम 10 अक्षर' : 'Minimum 10 characters' }
              })}
              rows={6}
              placeholder={language === 'te' ? 'మీ సమస్యను వివరించండి...' : language === 'hi' ? 'अपनी समस्या का वर्णन करें...' : 'Describe your problem in detail...'}
            />
            {errors.message && (
              <p className="text-sm text-red-600">{String(errors.message.message)}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>
              {language === 'te' ? 'పంట ఫోటో (ఐచ్ఛిక)' : language === 'hi' ? 'फसल की तस्वीर (वैकल्पिक)' : 'Crop Photo (Optional)'}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
              {selectedImage && (
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </div>
            {selectedImage && (
              <p className="text-xs text-green-600">
                ✓ {selectedImage.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-red-600 to-orange-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === 'te' ? 'సమర్పిస్తున్నాము...' : language === 'hi' ? 'जमा कर रहे हैं...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {language === 'te' ? 'సమస్య నివేదించు' : language === 'hi' ? 'समस्या रिपोर्ट करें' : 'Report Problem'}
              </>
            )}
          </Button>
        </form>
      )}
    </Card>
  );
};
