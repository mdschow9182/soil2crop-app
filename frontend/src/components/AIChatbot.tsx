import { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, 
  X, 
  Send, 
  Volume2, 
  VolumeX,
  Sparkles,
  HelpCircle,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { fetchFarmerAssistant, getSuggestedQuestions } from "@/api";
import { useLanguage } from "@/context/LanguageContext";
import { speakMessage } from "@/utils/voiceAssistant";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  voicePlayed?: boolean;
}

const AIChatbot = () => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && suggestedQuestions.length === 0) {
      loadSuggestedQuestions();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSuggestedQuestions = async () => {
    try {
      const response = await getSuggestedQuestions();
      setSuggestedQuestions(response.data);
    } catch (error) {
      console.error('Failed to load suggested questions:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (question?: string) => {
    const queryToSend = question || inputValue.trim();
    if (!queryToSend) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: queryToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetchFarmerAssistant(queryToSend, language);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Voice output if enabled
      if (voiceEnabled) {
        speakMessage(response.response, language, undefined, (err) => {
          console.error('Voice error:', err);
        });
      }
    } catch (error: any) {
      console.error('AI Assistant error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: language === 'te' 
          ? 'క్షమించండి, ప్రశ్నను ప్రాసెస్ చేయలేకపోయాను. దయచేసి మళ్లీ ప్రయత్నించండి.'
          : language === 'hi'
          ? 'क्षमा करें, प्रश्न को संसाधित नहीं कर सका। कृपया पुनः प्रयास करें।'
          : 'Sorry, I could not process your question. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] flex flex-col shadow-2xl z-50 animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Farming Assistant</h3>
                  <p className="text-xs text-blue-100">Ask anything about farming!</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoice}
                  className="h-8 w-8 p-0 hover:bg-white/20"
                >
                  {voiceEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Badge className="mt-2 bg-green-500 hover:bg-green-600">
              <Sparkles className="h-3 w-3 mr-1" />
              Online
            </Badge>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto text-blue-600 mb-3" />
                  <h4 className="font-semibold text-lg mb-2">
                    {language === 'te' 
                      ? 'నమస్కారం! నేను మీ AI వ్యవసాయ సహాయకుడిని'
                      : language === 'hi'
                      ? 'नमस्ते! मैं आपका AI कृषि सहायक हूँ'
                      : 'Namaste! I\'m your AI Farming Assistant'}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === 'te'
                      ? 'పంటలు, తెగుళ్లు, ఎరువులు మరియు మరిన్నింటి గురించి అడగండి'
                      : language === 'hi'
                      ? 'फसलों, कीटों, उर्वरकों और अधिक के बारे में पूछें'
                      : 'Ask me about crops, pests, fertilizers, and more!'}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <HelpCircle className="h-4 w-4" />
                    <span>
                      {language === 'te'
                        ? 'క్రింద ఉన్న సూచిత ప్రశ్నలలో ఒకదాన్ని ఎంచుకోండి లేదా మీ స్వంత ప్రశ్నను టైప్ చేయండి'
                        : language === 'hi'
                        ? 'नीचे दिए गए सुझाए गए प्रश्नों में से एक चुनें या अपना प्रश्न टाइप करें'
                        : 'Select a suggested question below or type your own'}
                    </span>
                  </div>
                </div>
              )}

              {/* Message Bubbles */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {messages.length === 0 && suggestedQuestions.length > 0 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-muted-foreground mb-2">
                {language === 'te' ? 'సూచిత ప్రశ్నలు:' : language === 'hi' ? 'सुझाए गए प्रश्न:' : 'Suggested Questions:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.slice(0, 4).map((question, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100 transition-colors text-xs"
                    onClick={() => handleSendMessage(question)}
                  >
                    <HelpCircle className="h-3 w-3 mr-1" />
                    {question.length > 35 ? question.substring(0, 35) + '...' : question}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  language === 'te'
                    ? 'మీ ప్రశ్నను టైప్ చేయండి...'
                    : language === 'hi'
                    ? 'अपना प्रश्न टाइप करें...'
                    : 'Type your question...'
                }
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default AIChatbot;
