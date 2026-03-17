import { useState } from 'react';
import { HeartHandshake, X, MessageCircle, AlertTriangle, Lightbulb, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { speakMessage } from '@/utils/voiceAssistant';
import { AskQuestionForm } from './AskQuestionForm';
import { ReportProblemForm } from './ReportProblemForm';
import { FarmingTips } from './FarmingTips';
import { ContactSupport } from './ContactSupport';

interface FarmerSupportButtonProps {
  farmerId?: string;
}

type SupportOption = 'ask_question' | 'report_problem' | 'farming_tips' | 'contact_support' | null;

export const FarmerSupportButton = ({ farmerId }: FarmerSupportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SupportOption>(null);
  const { language } = useLanguage();

  const toggleSupport = () => {
    setIsOpen(!isOpen);
    
    if (!isOpen && !selectedOption) {
      // Announce support opening
      const announcement = language === 'te' 
        ? 'రైతు మద్దతు వ్యవస్థ తెరుస్తోంది'
        : language === 'hi'
        ? 'किसान सहायता प्रणाली खुल रही है'
        : 'Farmer support system opening';
      
      speakMessage(announcement, language);
    }
  };

  const handleOptionSelect = (option: SupportOption) => {
    setSelectedOption(option);
    
    // Announce selected option
    const messages = {
      ask_question: language === 'te' ? 'ప్రశ్న అడగండి' : language === 'hi' ? 'प्रश्न पूछें' : 'Ask Question',
      report_problem: language === 'te' ? 'సమస్యను నివేదించండి' : language === 'hi' ? 'समस्या रिपोर्ट करें' : 'Report Problem',
      farming_tips: language === 'te' ? 'వ్యవసాయ చిట్కాలు' : language === 'hi' ? 'खेती टिप्स' : 'Farming Tips',
      contact_support: language === 'te' ? 'సపోర్ట్‌ను సంప్రదించండి' : language === 'hi' ? 'समर्थन से संपर्क करें' : 'Contact Support'
    };
    
    speakMessage(messages[option], language);
  };

  const handleBack = () => {
    setSelectedOption(null);
  };

  const handleSubmitSuccess = () => {
    setIsOpen(false);
    setSelectedOption(null);
  };

  const menuOptions = [
    {
      id: 'ask_question' as SupportOption,
      icon: MessageCircle,
      title: {
        en: 'Ask Farming Question',
        te: 'వ్యవసాయ ప్రశ్న అడగండి',
        hi: 'खेती का प्रश्न पूछें'
      },
      description: {
        en: 'Get expert advice on farming',
        te: 'వ్యవసాయంలో నిపుణుల సలహా పొందండి',
        hi: 'खेती पर विशेषज्ञ सलाह प्राप्त करें'
      },
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'report_problem' as SupportOption,
      icon: AlertTriangle,
      title: {
        en: 'Report Crop Problem',
        te: 'పంట సమస్యను నివేదించండి',
        hi: 'फसल की समस्या रिपोर्ट करें'
      },
      description: {
        en: 'Report crop disease or issues',
        te: 'పంట వ్యాధి లేదా సమస్యలను నివేదించండి',
        hi: 'फसल रोग या समस्याओं की रिपोर्ट करें'
      },
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      id: 'farming_tips' as SupportOption,
      icon: Lightbulb,
      title: {
        en: 'Farming Tips',
        te: 'వ్యవసాయ చిట్కాలు',
        hi: 'खेती टिप्स'
      },
      description: {
        en: 'Learn modern farming techniques',
        te: 'ఆధునిక వ్యవసాయ పద్ధతులు నేర్చుకోండి',
        hi: 'आधुनिक खेती तकनीकें सीखें'
      },
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'contact_support' as SupportOption,
      icon: Phone,
      title: {
        en: 'Contact Support',
        te: 'సపోర్ట్‌ను సంప్రదించండి',
        hi: 'समर्थन से संपर्क करें'
      },
      description: {
        en: 'Get in touch with our team',
        te: 'మా బృందంతో మాట్లాడండి',
        hi: 'हमारी टीम से संपर्क करें'
      },
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <>
      {/* Floating Farmer Support Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <Button
            onClick={toggleSupport}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Farmer Support"
          >
            <HeartHandshake className="h-6 w-6 text-white" />
          </Button>
        ) : (
          <Button
            onClick={toggleSupport}
            variant="destructive"
            className="h-12 w-12 rounded-full shadow-lg"
            aria-label="Close Support"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Support Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-end sm:items-center pointer-events-none">
          <div 
            className="pointer-events-auto bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {language === 'te' ? 'రైతు మద్దతు' : 
                     language === 'hi' ? 'किसान सहायता' :
                     'Farmer Support'}
                  </h3>
                  <p className="text-sm text-green-100 mt-1">
                    {language === 'te' ? 'మీ ప్రశ్నలు మరియు సమస్యలకు పరిష్కారం' : 
                     language === 'hi' ? 'आपके प्रश्नों और समस्याओं का समाधान' :
                     'Solutions for your questions & problems'}
                  </p>
                </div>
                {selectedOption && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="text-white hover:bg-white/20"
                  >
                    ← Back
                  </Button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {!selectedOption ? (
                /* Main Menu */
                <div className="grid grid-cols-1 gap-3">
                  {menuOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id)}
                        className={`${option.color} text-white p-4 rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-105 text-left`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-8 w-8 mt-1" />
                          <div>
                            <h4 className="font-semibold text-lg">
                              {option.title[language] || option.title.en}
                            </h4>
                            <p className="text-sm text-white/90 mt-1">
                              {option.description[language] || option.description.en}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Selected Option Content */
                <>
                  {selectedOption === 'ask_question' && (
                    <AskQuestionForm 
                      farmerId={farmerId}
                      onSubmitSuccess={handleSubmitSuccess}
                    />
                  )}
                  {selectedOption === 'report_problem' && (
                    <ReportProblemForm 
                      farmerId={farmerId}
                      onSubmitSuccess={handleSubmitSuccess}
                    />
                  )}
                  {selectedOption === 'farming_tips' && (
                    <FarmingTips onClose={() => setIsOpen(false)} />
                  )}
                  {selectedOption === 'contact_support' && (
                    <ContactSupport onClose={() => setIsOpen(false)} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
