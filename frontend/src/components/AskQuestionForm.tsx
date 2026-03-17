import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, Loader2 } from 'lucide-react';
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

interface AskQuestionFormProps {
  farmerId?: string;
  onSubmitSuccess?: () => void;
}

export const AskQuestionForm = ({ farmerId, onSubmitSuccess }: AskQuestionFormProps) => {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      message: ''
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      if (!farmerId) {
        toast.error('Please login to ask questions');
        return;
      }

      await api.post('/api/farmer-support', {
        farmerId,
        type: 'question',
        title: data.title,
        message: data.message,
        priority: 'medium',
        language
      });

      setSubmitSuccess(true);
      
      // Voice announcement
      const successMessage = language === 'te' 
        ? 'మీ ప్రశ్న విజయవంతంగా సమర్పించబడింది. మా నిపుణులు త్వరలోనే స్పందిస్తారు'
        : language === 'hi'
        ? 'आपका प्रश्न सफलतापूर्वक जमा कर दिया गया। हमारे विशेषज्ञ जल्द ही जवाब देंगे'
        : 'Your question has been submitted successfully. Our experts will respond soon.';
      
      speakMessage(successMessage, language);
      toast.success('Question submitted! We\'ll respond soon.');

      reset();
      
      setTimeout(() => {
        setSubmitSuccess(false);
        onSubmitSuccess?.();
      }, 2000);
    } catch (error: any) {
      console.error('[AskQuestion] Error submitting:', error);
      toast.error(
        language === 'te' 
          ? 'సమస్య ఏర్పడింది. మళ్లీ ప్రయత్నించండి'
          : language === 'hi'
          ? 'त्रुटि हुई। पुनः प्रयास करें'
          : 'Failed to submit question. Please try again.'
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
              ? '✅ మీ ప్రశ్న విజయవంతంగా సమర్పించబడింది! మా నిపుణులు త్వరలోనే స్పందిస్తారు.'
              : language === 'hi'
              ? '✅ आपका प्रश्न सफलतापूर्वक जमा कर दिया गया! हमारे विशेषज्ञ जल्द ही जवाब देंगे।'
              : '✅ Your question has been submitted successfully! Our experts will respond soon.'}
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Question Title */}
          <div className="space-y-2">
            <Label>
              {language === 'te' ? 'ప్రశ్న శీర్షిక' : language === 'hi' ? 'प्रश्न शीर्षक' : 'Question Title'}
            </Label>
            <Input
              {...register('title', { 
                required: language === 'te' ? 'శీర్షిక అవసరం' : language === 'hi' ? 'शीर्षक आवश्यक है' : 'Title is required',
                maxLength: { value: 200, message: 'Maximum 200 characters' }
              })}
              placeholder={language === 'te' ? 'మీ ప్రశ్నను సంక్షిప్తంగా వ్రాయండి...' : language === 'hi' ? 'अपना प्रश्न संक्षेप में लिखें...' : 'Brief description of your question...'}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{String(errors.title.message)}</p>
            )}
          </div>

          {/* Question Description */}
          <div className="space-y-2">
            <Label>
              {language === 'te' ? 'వివరణ' : language === 'hi' ? 'विवरण' : 'Description'}
            </Label>
            <Textarea
              {...register('message', { 
                required: language === 'te' ? 'వివరణ అవసరం' : language === 'hi' ? 'विवरण आवश्यक है' : 'Description is required',
                minLength: { value: 10, message: language === 'te' ? 'కనీసం 10 అక్షరాలు' : language === 'hi' ? 'कम से कम 10 अक्षर' : 'Minimum 10 characters' },
                maxLength: { value: 2000, message: 'Maximum 2000 characters' }
              })}
              rows={6}
              placeholder={language === 'te' ? 'మీ ప్రశ్నను వివరించండి...' : language === 'hi' ? 'अपने प्रश्न का वर्णन करें...' : 'Describe your question in detail...'}
            />
            {errors.message && (
              <p className="text-sm text-red-600">{String(errors.message.message)}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
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
                {language === 'te' ? 'ప్రశ్న సమర్పించు' : language === 'hi' ? 'प्रश्न जमा करें' : 'Submit Question'}
              </>
            )}
          </Button>
        </form>
      )}
    </Card>
  );
};
