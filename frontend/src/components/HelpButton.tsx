import { useState } from 'react';
import { MessageCircle, X, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackForm } from './FeedbackForm';
import { HelpHistory } from './HelpHistory';
import { useLanguage } from '@/context/LanguageContext';
import { speakMessage } from '@/utils/voiceAssistant';
import { getHelpVoiceMessages } from '@/utils/voiceMessages';

interface HelpButtonProps {
  farmerId?: string;
}

export const HelpButton = ({ farmerId }: HelpButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { language } = useLanguage();

  const toggleHelp = () => {
    setIsOpen(!isOpen);
    
    if (!isOpen) {
      // Announce help opening
      const messages = getHelpVoiceMessages(language);
      speakMessage(messages.openHelp, language);
    }
  };

  const handleSubmitSuccess = () => {
    setIsOpen(false);
    // Success message already shown by form
  };

  return (
    <>
      {/* Floating Farmer Support Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <Button
            onClick={toggleHelp}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Farmer Support"
          >
            <Sprout className="h-6 w-6 text-white" />
          </Button>
        ) : (
          <Button
            onClick={toggleHelp}
            variant="destructive"
            className="h-12 w-12 rounded-full shadow-lg"
            aria-label="Close Farmer Support"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Help Panel */}
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
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Sprout className="h-5 w-5" />
                    {language === 'te' ? 'రైతు సహాయం' : 
                     language === 'hi' ? 'किसान सहायता' :
                     'Farmer Support'}
                  </h3>
                  <p className="text-sm text-green-100 mt-1">
                    {language === 'te' ? 'మీ వ్యవసాయ ప్రశ్నలు మరియు సమస్యలకు పరిష్కారం' : 
                     language === 'hi' ? 'आपके कृषि प्रश्नों और समस्याओं का समाधान' :
                     'Solutions for your farming questions & problems'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-white hover:bg-white/20"
                >
                  {language === 'te' ? 'చరిత్ర' : 
                   language === 'hi' ? 'इतिहास' :
                   showHistory ? 'New Request' : 'History'}
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {showHistory ? (
                <HelpHistory 
                  farmerId={farmerId} 
                  onBack={() => setShowHistory(false)}
                />
              ) : (
                <FeedbackForm 
                  farmerId={farmerId}
                  onSubmitSuccess={handleSubmitSuccess}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
