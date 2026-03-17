import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, MessageSquare, X, Volume2, VolumeX, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchFarmerAssistant } from "@/api";
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SuggestedQuestion {
  question: string;
  category: string;
}

const AIFarmerAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const suggestedQuestions: SuggestedQuestion[] = [
    { question: "When is the best time to plant rice?", category: "Planting" },
    { question: "How do I control pests naturally?", category: "Pest Control" },
    { question: "What is crop rotation?", category: "Best Practices" },
    { question: "How much fertilizer should I use?", category: "Fertilizer" },
    { question: "What government schemes are available?", category: "Schemes" },
    { question: "How can I improve soil health?", category: "Soil Health" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  useEffect(() => {
    // Add welcome message when chat opens
    if (isOpen && messages.length === 0) {
      addWelcomeMessage();
    }
  }, [isOpen]);

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "🙏 Namaste! I'm your AI Farming Assistant.\n\nI can help you with:\n• Crop recommendations\n• Pest and disease management\n• Water and fertilizer guidance\n• Market prices\n• Government schemes\n\nWhat would you like to know?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async (question?: string) => {
    const messageText = question || input.trim();
    
    if (!messageText.trim()) return;

    // Stop any ongoing speech
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("[AI Assistant] Sending query:", messageText, "Language:", language);
      
      // Send language parameter to backend
      const response = await fetchFarmerAssistant(messageText, language);

      console.log("[AI Assistant] Response received:", response);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response || "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.confidence < 0.5) {
        toast({
          title: "Low Confidence Response",
          description: "The assistant wasn't very confident in this answer. Please verify with an expert.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("[AI Assistant] Error:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please check your internet connection and try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Failed to connect to AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  // Text-to-speech function
  const speakMessage = (content: string) => {
    if (!speechSynthesis) {
      toast({
        title: "Voice Not Available",
        description: "Text-to-speech is not supported in your browser",
        variant: "default",
      });
      return;
    }

    // Stop current speech if any
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean content for speech (remove markdown, emojis)
    const cleanContent = content
      .replace(/[*#`]/g, '')
      .replace(/🌱|🌾|💧|💰|🐛|🔄|🌍|🦠|🏛️/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanContent);
    
    // Set language based on app language
    const langMap: Record<string, string> = {
      en: 'en-IN',
      te: 'te-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      ml: 'ml-IN'
    };
    
    utterance.lang = langMap[language] || 'en-IN';
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content.split("\n").map((line, index) => (
      <p key={index} className="min-h-[1rem]">
        {line.split("**").map((part, i) => 
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        )}
      </p>
    ));
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
        size="icon"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-20 right-4 w-[90vw] sm:w-[380px] h-[550px] shadow-2xl z-50 flex flex-col border-2">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">AI Farming Assistant</CardTitle>
                <Globe className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  🌾 Expert Advice
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {language.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {messages.length} messages
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[380px] p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user"
                      ? "bg-blue-500"
                      : "bg-primary/20"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-muted"
                  }`}
                >
                  <div className={`text-sm ${
                    message.role === "user" ? "" : "text-foreground"
                  }`}>
                    {formatContent(message.content)}
                  </div>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <div className={`text-xs ${
                      message.role === "user" 
                        ? "text-blue-100" 
                        : "text-muted-foreground"
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                    {message.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-1 hover:bg-primary/10"
                        onClick={() => speakMessage(message.content)}
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 border-t pt-3">
          <p className="text-xs text-muted-foreground mb-2 font-medium">
            💡 Quick Start Questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 3).map((q, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 transition-colors text-xs py-1"
                onClick={() => handleSendMessage(q.question)}
              >
                {q.category}: {q.question.split(" ").slice(0, 4).join(" ")}...
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t p-3 bg-background">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about farming..."
            disabled={isLoading}
            className="flex-1 min-w-0"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          AI-powered farming advice • Responses may vary
        </p>
      </div>
    </Card>
  );
};

export default AIFarmerAssistant;
