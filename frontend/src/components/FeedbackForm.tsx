import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { speakMessage } from '@/utils/voiceAssistant';
import { toast } from 'sonner';

interface FeedbackFormProps {
  farmerId?: string;
  onSubmitSuccess?: () => void;
}

type Category = 
  | 'technical_issue'
  | 'feature_request'
  | 'bug_report'
  | 'general_feedback'
  | 'account_issue'
  | 'data_issue'
  | 'other';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

export const FeedbackForm = ({ farmerId, onSubmitSuccess }: FeedbackFormProps) => {
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
      category: 'general_feedback',
      priority: 'medium',
      subject: '',
      description: '',
      contactPreference: 'none',
      phoneNumber: '',
      email: ''
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      if (!farmerId) {
        toast.error('Please login to submit feedback');
        return;
      }

      await api.post('/api/help', {
        ...data,
        farmerId
      });

      setSubmitSuccess(true);
      
      // Voice announcement
      const successMessage = language === 'te' 
        ? 'మీ అభిప్రాయం విజయవంతంగా సమర్పించబడింది'
        : language === 'hi'
        ? 'आपकी प्रतिक्रिया सफलतापूर्वक जमा कर दी गई'
        : 'Your feedback has been submitted successfully';
      
      speakMessage(successMessage, language);
      toast.success(submitSuccess ? 'Feedback submitted!' : successMessage);

      reset();
      
      setTimeout(() => {
        setSubmitSuccess(false);
        onSubmitSuccess?.();
      }, 2000);
    } catch (error: any) {
      console.error('[FeedbackForm] Error submitting:', error);
      toast.error(
        language === 'te' 
          ? 'సమస్య ఏర్పడింది. మళ్లీ ప్రయత్నించండి'
          : language === 'hi'
          ? 'त्रुटि हुई। पुनः प्रयास करें'
          : 'Failed to submit feedback. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { value: Category; label: string }[] = [
    { value: 'technical_issue', label: language === 'te' ? 'సాంకేతిక సమస్య' : language === 'hi' ? 'तकनीकी समस्या' : 'Technical Issue' },
    { value: 'feature_request', label: language === 'te' ? 'కొత్త ఫీచర్ అభ్యర్థన' : language === 'hi' ? 'नई सुविधा अनुरोध' : 'Feature Request' },
    { value: 'bug_report', label: language === 'te' ? 'బగ్ నివేదిక' : language === 'hi' ? 'बग रिपोर्ट' : 'Bug Report' },
    { value: 'general_feedback', label: language === 'te' ? 'సాధారణ అభిప్రాయం' : language === 'hi' ? 'सामान्य प्रतिक्रिया' : 'General Feedback' },
    { value: 'account_issue', label: language === 'te' ? 'ఖాతా సమస్య' : language === 'hi' ? 'खाता समस्या' : 'Account Issue' },
    { value: 'data_issue', label: language === 'te' ? 'డేటా సమస్య' : language === 'hi' ? 'डेटा समस्या' : 'Data Issue' },
    { value: 'other', label: language === 'te' ? 'ఇతర' : language === 'hi' ? 'अन्य' : 'Other' }
  ];

  const priorities: { value: Priority; label: string }[] = [
    { value: 'low', label: language === 'te' ? 'తక్కువ' : language === 'hi' ? 'कम' : 'Low' },
    { value: 'medium', label: language === 'te' ? 'మధ్యస్థం' : language === 'hi' ? 'मध्यम' : 'Medium' },
    { value: 'high', label: language === 'te' ? 'అధిక' : language === 'hi' ? 'उच्च' : 'High' },
    { value: 'urgent', label: language === 'te' ? 'అత్యవసరం' : language === 'hi' ? 'तत्काल' : 'Urgent' }
  ];

  const contactPrefs: { value: string; label: string }[] = [
    { value: 'none', label: language === 'te' ? 'లేదు' : language === 'hi' ? 'कोई नहीं' : 'None' },
    { value: 'email', label: language === 'te' ? 'ఇమెయిల్' : language === 'hi' ? 'ईमेल' : 'Email' },
    { value: 'phone', label: language === 'te' ? 'ఫోన్' : language === 'hi' ? 'फोन' : 'Phone' },
    { value: 'sms', label: language === 'te' ? 'SMS' : language === 'hi' ? 'SMS' : 'SMS' }
  ];

  return (
    <Card className="p-4">
      {submitSuccess ? (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {language === 'te' 
              ? '✅ మీ అభిప్రాయం విజయవంతంగా సమర్పించబడింది! మేము త్వరలోనే స్పందిస్తాము.'
              : language === 'hi'
              ? '✅ आपकी प्रतिक्रिया सफलतापूर्वक जमा कर दी गई! हम जल्द ही जवाब देंगे।'
              : '✅ Your feedback has been submitted successfully! We\'ll respond soon.'}
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label>
              {language === 'te' ? 'వర్గం' : language === 'hi' ? 'श्रेणी' : 'Category'}
            </Label>
            <Select onValueChange={(value: Category) => register('category').onChange({ target: { value } })}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'te' ? 'ఎంచుకోండి' : language === 'hi' ? 'चयन करें' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{String(errors.category.message)}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>
              {language === 'te' ? 'ప్రాధాన్యత' : language === 'hi' ? 'प्राथमिकता' : 'Priority'}
            </Label>
            <Select onValueChange={(value: Priority) => register('priority').onChange({ target: { value } })}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'te' ? 'ఎంచుకోండి' : language === 'hi' ? 'चयन करें' : 'Select priority'} />
              </SelectTrigger>
              <SelectContent>
                {priorities.map(pref => (
                  <SelectItem key={pref.value} value={pref.value}>{pref.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>
              {language === 'te' ? 'విషయం' : language === 'hi' ? 'विषय' : 'Subject'}
            </Label>
            <Input
              {...register('subject', { 
                required: language === 'te' ? 'విషయం అవసరం' : language === 'hi' ? 'विषय आवश्यक है' : 'Subject is required' 
              })}
              placeholder={language === 'te' ? 'సంక్షిప్త విషయం' : language === 'hi' ? 'संक्षिप्त विषय' : 'Brief subject'}
            />
            {errors.subject && (
              <p className="text-sm text-red-600">{String(errors.subject.message)}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>
              {language === 'te' ? 'వివరణ' : language === 'hi' ? 'विवरण' : 'Description'}
            </Label>
            <Textarea
              {...register('description', { 
                required: language === 'te' ? 'వివరణ అవసరం' : language === 'hi' ? 'विवरण आवश्यक है' : 'Description is required',
                minLength: { value: 10, message: language === 'te' ? 'కనీసం 10 అక్షరాలు' : language === 'hi' ? 'कम से कम 10 अक्षर' : 'Minimum 10 characters' }
              })}
              rows={5}
              placeholder={language === 'te' ? 'మీ సమస్య లేదా అభిప్రాయం వివరించండి...' : language === 'hi' ? 'अपनी समस्या या प्रतिक्रिया का वर्णन करें...' : 'Describe your issue or feedback...'}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{String(errors.description.message)}</p>
            )}
          </div>

          {/* Contact Preference */}
          <div className="space-y-2">
            <Label>
              {language === 'te' ? 'సంప్రదింపు ప్రాధాన్యత' : language === 'hi' ? 'संपर्क प्राथमिकता' : 'Contact Preference'}
            </Label>
            <Select onValueChange={(value: string) => register('contactPreference').onChange({ target: { value } })}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'te' ? 'ఎంచుకోండి' : language === 'hi' ? 'चयन करें' : 'How should we contact you?'} />
              </SelectTrigger>
              <SelectContent>
                {contactPrefs.map(pref => (
                  <SelectItem key={pref.value} value={pref.value}>{pref.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone Number */}
          {(true) && (
            <div className="space-y-2">
              <Label>
                {language === 'te' ? 'ఫోన్ నంబర్' : language === 'hi' ? 'फोन नंबर' : 'Phone Number'}
              </Label>
              <Input
                {...register('phoneNumber', {
                  pattern: {
                    value: /^\d{10}$/,
                    message: language === 'te' ? 'సరైన 10 అంకెల నంబర్' : language === 'hi' ? 'मान्य 10 अंकों का नंबर' : 'Valid 10-digit number'
                  }
                })}
                placeholder="9876543210"
                type="tel"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-600">{String(errors.phoneNumber.message)}</p>
              )}
            </div>
          )}

          {/* Email */}
          {(true) && (
            <div className="space-y-2">
              <Label>
                {language === 'te' ? 'ఇమెయిల్' : language === 'hi' ? 'ईमेल' : 'Email'}
              </Label>
              <Input
                {...register('email', {
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: language === 'te' ? 'సరైన ఇమెయిల్' : language === 'hi' ? 'मान्य ईमेल' : 'Valid email'
                  }
                })}
                placeholder="example@email.com"
                type="email"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{String(errors.email.message)}</p>
              )}
            </div>
          )}

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
                {language === 'te' ? 'సమర్పించు' : language === 'hi' ? 'जमा करें' : 'Submit Feedback'}
              </>
            )}
          </Button>
        </form>
      )}
    </Card>
  );
};
