import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { speakMessage } from '@/utils/voiceAssistant';

interface FarmingTipsProps {
  onClose?: () => void;
}

export const FarmingTips = ({ onClose }: FarmingTipsProps) => {
  const { language } = useLanguage();
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  const tips = [
    {
      id: 1,
      title: {
        en: 'Soil Health Management',
        te: 'నేల ఆరోగ్య నిర్వహణ',
        hi: 'मिट्टी स्वास्थ्य प्रबंधन'
      },
      content: {
        en: 'Test your soil every 2-3 years. Add organic matter like compost or manure to improve soil fertility. Practice crop rotation to maintain soil nutrients.',
        te: 'మీ నేలను ప్రతి 2-3 సంవత్సరాలకు పరీక్షించండి. నేల సారాన్ని మెరుగుపరచడానికి ఎరువు లేదా వ్యర్థాలను కలపండి. నేల పోషకాలను నిర్వహించడానికి పంట మార్పిడి పద్ధతిని పాటించండి.',
        hi: 'अपनी मिट्टी का परीक्षण हर 2-3 साल में करें। मिट्टी की उर्वरता बढ़ाने के लिए जैविक पदार्थ जैसे खाद या गोबर मिलाएं। मिट्टी के पोषक तत्वों को बनाए रखने के लिए फसल चक्र अपनाएं।'
      }
    },
    {
      id: 2,
      title: {
        en: 'Water Conservation',
        te: 'నీటి పరిరక్షణ',
        hi: 'जल संरक्षण'
      },
      content: {
        en: 'Use drip irrigation to save water. Mulch around plants to retain moisture. Collect rainwater for irrigation during dry periods.',
        te: 'నీటిని ఆదా చేయడానికి డ్రిప్ సాగు విధానాన్ని ఉపయోగించండి. తేమను నిలుపుకోవడానికి మొక్కల చుట్టూ మల్చింగ్ చేయండి. పొడి కాలంలో సాగు కోసం వర్షపు నీటిని సేకరించండి.',
        hi: 'पानी बचाने के लिए ड्रिप सिंचाई का उपयोग करें। नमी बनाए रखने के लिए पौधों के चारों ओर मल्चिंग करें। शुष्क अवधि के दौरान सिंचाई के लिए वर्षा जल एकत्र करें।'
      }
    },
    {
      id: 3,
      title: {
        en: 'Natural Pest Control',
        te: 'సహజ తెగులు నియంత్రణ',
        hi: 'प्राकृतिक कीट नियंत्रण'
      },
      content: {
        en: 'Use neem oil spray to control pests. Plant marigold as a trap crop. Encourage beneficial insects like ladybugs and lacewings.',
        te: 'తెగుళ్లను నియంత్రించడానికి వేప నూనె స్ప్రేను ఉపయోగించండి. ట్రాప్ పంటగా బంతిని నాటండి. లేడీబగ్స్ మరియు లేస్వింగ్స్ వంటి లాభదాయకమైన కీటకాలను ప్రోత్సహించండి.',
        hi: 'कीटों को नियंत्रित करने के लिए नीम के तेल का छिड़काव करें। ट्रैप फसल के रूप में गेंदा लगाएं। लेडीबग्स और लेसविंग्स जैसे लाभकारी कीड़ों को प्रोत्साहित करें।'
      }
    },
    {
      id: 4,
      title: {
        en: 'Organic Fertilizers',
        te: 'సేంద్రియ ఎరువులు',
        hi: 'जैविक उर्वरक'
      },
      content: {
        en: 'Prepare compost from farm waste. Use vermicompost for better yields. Apply green manure crops like sunn hemp before main season.',
        te: 'వ్యవసాయ వ్యర్థాల నుండి కంపోస్ట్ తయారు చేయండి. మంచి దిగుబడి కోసం వర్మికంపోస్ట్‌ను ఉపయోగించండి. ప్రధాన సీజన్‌కు ముందు సన్న గంజాయి వంటి గ్రీన్ మ్యానూర్ పంటలను వేయండి.',
        hi: 'खेत के कचरे से कंपोस्ट तैयार करें। बेहतर उपज के लिए वर्मीकंपोस्ट का उपयोग करें। मुख्य सीजन से पहले सन हंप जैसे हरी खाद फसलें लगाएं।'
      }
    }
  ];

  const toggleTip = (id: number) => {
    setExpandedTip(expandedTip === id ? null : id);
    
    if (expandedTip !== id) {
      const tip = tips.find(t => t.id === id);
      if (tip) {
        speakMessage(tip.title[language] || tip.title.en, language);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <Lightbulb className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
        <h3 className="font-semibold text-lg">
          {language === 'te' ? 'ఆధునిక వ్యవసాయ చిట్కాలు' : 
           language === 'hi' ? 'आधुनिक खेती टिप्स' : 
           'Modern Farming Tips'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'te' ? 'మంచి దిగుబడి కోసం నిపుణుల సలహాలు' : 
           language === 'hi' ? 'बेहतर उपज के लिए विशेषज्ञ सलाह' : 
           'Expert advice for better yields'}
        </p>
      </div>

      {tips.map((tip) => (
        <Card key={tip.id} className="overflow-hidden">
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto text-left"
            onClick={() => toggleTip(tip.id)}
          >
            <div className="flex items-start gap-3 flex-1">
              <Lightbulb className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
              <span className="font-medium">
                {tip.title[language] || tip.title.en}
              </span>
            </div>
            {expandedTip === tip.id ? (
              <ChevronUp className="h-5 w-5 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 flex-shrink-0" />
            )}
          </Button>
          
          {expandedTip === tip.id && (
            <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground">
              {tip.content[language] || tip.content.en}
            </div>
          )}
        </Card>
      ))}

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
