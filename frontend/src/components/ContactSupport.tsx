import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { speakMessage } from '@/utils/voiceAssistant';

interface ContactSupportProps {
  onClose?: () => void;
}

export const ContactSupport = ({ onClose }: ContactSupportProps) => {
  const { language } = useLanguage();

  const contactInfo = [
    {
      icon: Phone,
      title: { en: 'Phone', te: 'ఫోన్', hi: 'फोन' },
      value: { en: '+91 8096227024', te: '+91 8096227024', hi: '+91 8096227024' },
      action: 'tel:+918096227024',
      color: 'text-green-600'
    },
    {
      icon: Mail,
      title: { en: 'Email', te: 'ఇమెయిల్', hi: 'ईमेल' },
      value: { en: 'mdchowdary736@gmail.com', te: 'mdchowdary736@gmail.com', hi: 'mdchowdary736@gmail.com' },
      action: 'mailto:mdchowdary736@gmail.com',
      color: 'text-blue-600'
    },
    {
      icon: MapPin,
      title: { en: 'Location', te: 'స్థానం', hi: 'स्थान' },
      value: { 
        en: 'Chittoor, Andhra Pradesh', 
        te: 'చిత్తూరు, ఆంధ్ర ప్రదేశ్', 
        hi: 'चित्तूर, आंध्र प्रदेश' 
      },
      action: null,
      color: 'text-red-600'
    },
    {
      icon: Clock,
      title: { en: 'Hours', te: 'సమయం', hi: 'समय' },
      value: { 
        en: 'Mon-Sat: 9AM-6PM', 
        te: 'సోమ్-శని: 9AM-6PM', 
        hi: 'सोम-शनि: 9AM-6PM' 
      },
      action: null,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="font-semibold text-lg">
          {language === 'te' ? 'మమ్మల్ని సంప్రదించండి' : 
           language === 'hi' ? 'हमसे संपर्क करें' : 
           'Contact Us'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {language === 'te' ? 'మా బృందం మీ సహాయానికి సిద్ధంగా ఉంది' : 
           language === 'hi' ? 'हमारी टीम आपकी सहायता के लिए तैयार है' : 
           'Our team is ready to help you'}
        </p>
      </div>

      {contactInfo.map((info, index) => {
        const Icon = info.icon;
        return (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-3">
              <Icon className={`h-6 w-6 ${info.color} mt-1`} />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {info.title[language] || info.title.en}
                </p>
                <p className="text-base mt-1">
                  {info.value[language] || info.value.en}
                </p>
                {info.action && (
                  <Button
                    variant="link"
                    className="p-0 h-auto mt-1"
                    onClick={() => {
                      if (info.action.startsWith('tel:')) {
                        speakMessage(
                          language === 'te' ? 'ఫోన్ నంబర్ డయల్ చేస్తోంది' :
                          language === 'hi' ? 'फोन नंबर डायल कर रहा है' :
                          'Dialing phone number',
                          language
                        );
                        window.location.href = info.action;
                      } else if (info.action.startsWith('mailto:')) {
                        speakMessage(
                          language === 'te' ? 'ఇమెయిల్ యాప్ తెరుస్తోంది' :
                          language === 'hi' ? 'ईमेल ऐप खुल रहा है' :
                          'Opening email app',
                          language
                        );
                        window.location.href = info.action;
                      }
                    }}
                  >
                    {language === 'te' ? 'సంప్రదించు' : language === 'hi' ? 'संपर्क करें' : 'Contact Now'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-800">
          {language === 'te' 
            ? '📞 అత్యవసర సహాయం కోసం పై ఫోన్ నంబర్‌కు కాల్ చేయండి'
            : language === 'hi'
            ? '📞 तत्काल सहायता के लिए ऊपर दिए गए फोन नंबर पर कॉल करें'
            : '📞 Call the phone number above for immediate assistance'}
        </p>
      </div>

      <Button 
        variant="outline" 
        className="w-full mt-4"
        onClick={() => onClose?.()}
      >
        {language === 'te' ? 'మూసివేయి' : language === 'hi' ? 'बंद करें' : 'Close'}
      </Button>
    </div>
  );
};
