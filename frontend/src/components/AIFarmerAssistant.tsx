import { useCallback, useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, MessageSquare, X, Globe, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchFarmerAssistant, transcribeVoice } from "@/api";
import { useLanguage } from "@/context/LanguageContext";
import { stopSpeech } from "@/utils/voiceAssistant";
import { VoiceButton } from "@/components/VoiceButton";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  language: string;
}

interface SuggestedQuestion {
  question: string;
  category: string;
}

const AIFarmerAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const recordingRef = useRef<{ stream: MediaStream; context: AudioContext; source: MediaStreamAudioSourceNode; processor: ScriptProcessorNode; mute: GainNode; chunks: Float32Array[]; sampleRate: number } | null>(null);
  const recordingLimitRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
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
    stopSpeech();
  }, [language]);

  useEffect(() => () => {
    const recording = recordingRef.current;
    if (recording) {
      recording.processor.disconnect(); recording.source.disconnect();
      recording.mute.disconnect();
      recording.stream.getTracks().forEach((track) => track.stop());
      void recording.context.close();
    }
  }, []);

  const startRecording = async () => {
    setVoiceError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof AudioContext === "undefined") {
      setVoiceError("Audio recording is unavailable in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      const mute = context.createGain();
      mute.gain.value = 0;
      const chunks: Float32Array[] = [];
      processor.onaudioprocess = (event) => chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
      source.connect(processor);
      processor.connect(mute);
      mute.connect(context.destination);
      recordingRef.current = { stream, context, source, processor, mute, chunks, sampleRate: context.sampleRate };
      setIsRecording(true);
      recordingLimitRef.current = window.setTimeout(() => { void stopRecording(); }, 30000);
    } catch {
      setVoiceError("Microphone permission was denied or the microphone is unavailable.");
    }
  };

  const stopRecording = async () => {
    const recording = recordingRef.current;
    if (!recording) return;
    recordingRef.current = null;
    if (recordingLimitRef.current !== null) window.clearTimeout(recordingLimitRef.current);
    recordingLimitRef.current = null;
    setIsRecording(false);
    recording.processor.disconnect(); recording.source.disconnect();
    recording.mute.disconnect();
    recording.stream.getTracks().forEach((track) => track.stop());
    await recording.context.close();
    const totalSamples = recording.chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    if (!totalSamples) { setVoiceError("No audio was captured. Please try again."); return; }
    const samples = new Float32Array(totalSamples);
    let offset = 0;
    recording.chunks.forEach((chunk) => { samples.set(chunk, offset); offset += chunk.length; });
    const targetRate = 16000;
    const ratio = recording.sampleRate / targetRate;
    const length = Math.ceil(samples.length / ratio);
    const wavBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(wavBuffer);
    const writeString = (position: number, value: string) => { for (let i = 0; i < value.length; i++) view.setUint8(position + i, value.charCodeAt(i)); };
    writeString(0, "RIFF"); view.setUint32(4, 36 + length * 2, true); writeString(8, "WAVE"); writeString(12, "fmt ");
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, targetRate, true);
    view.setUint32(28, targetRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); writeString(36, "data"); view.setUint32(40, length * 2, true);
    for (let i = 0; i < length; i++) {
      const sourceIndex = i * ratio;
      const lowerIndex = Math.floor(sourceIndex);
      const upperIndex = Math.min(samples.length - 1, lowerIndex + 1);
      const fraction = sourceIndex - lowerIndex;
      const sample = Math.max(-1, Math.min(1, samples[lowerIndex] * (1 - fraction) + samples[upperIndex] * fraction));
      view.setInt16(44 + i * 2, sample < 0 ? sample * 32768 : sample * 32767, true);
    }
    setIsTranscribing(true);
    try {
      const result = await transcribeVoice(new Blob([wavBuffer], { type: "audio/wav" }), language);
      if (result.transcript) setInput(result.transcript);
      else setVoiceError("No speech was recognized. Please try again.");
    } catch (error) {
      setVoiceError(error instanceof Error ? error.message : "Transcription failed. Please try again.");
    } finally { setIsTranscribing(false); }
  };

  useEffect(() => {
    const openAssistant = () => setIsOpen(true);
    window.addEventListener("soil2crop:open-ai-assistant", openAssistant);
    return () => window.removeEventListener("soil2crop:open-ai-assistant", openAssistant);
  }, []);

  const addWelcomeMessage = useCallback(() => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "🙏 Namaste! I'm your AI Farming Assistant.\n\nI can help you with:\n• Crop recommendations\n• Pest and disease management\n• Water and fertilizer guidance\n• Market prices\n• Government schemes\n\nWhat would you like to know?",
      timestamp: new Date(),
      language,
    };
    setMessages([welcomeMessage]);
  }, [language]);

  useEffect(() => {
    // Add welcome message when chat opens
    if (isOpen && messages.length === 0) {
      addWelcomeMessage();
    }
  }, [isOpen, messages.length, addWelcomeMessage]);

  const handleSendMessage = async (question?: string) => {
    const messageText = question || input.trim();
    
    if (!messageText.trim()) return;

    // Stop any ongoing speech
    stopSpeech();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
      language,
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
        content: response.data?.response || response.response || "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
        language,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const confidence = response.data?.confidence ?? response.confidence;
      if (typeof confidence === "number" && confidence < 0.5) {
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
        language,
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
        aria-label="Open AI Farming Assistant"
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-20 z-50 hidden h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90 sm:inline-flex"
        size="icon"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-50 flex h-[min(550px,calc(100dvh-9rem-env(safe-area-inset-bottom)))] w-[min(380px,calc(100vw-2rem))] flex-col border-2 shadow-2xl">
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
            className="h-11 w-11"
            aria-label="Close AI Farming Assistant"
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
                    {message.role === "assistant" && message.language === language && (
                      <VoiceButton
                        language={language}
                        message={message.content.replace(/[*#`]/g, "").replace(/\n+/g, " ").trim()}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        useGnani
                      />
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
            type="button"
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            disabled={isLoading || isTranscribing}
            onClick={isRecording ? stopRecording : startRecording}
            aria-label={isRecording ? "Stop recording" : "Start voice recording"}
            title={isRecording ? "Stop recording" : "Start voice recording"}
            className="shrink-0"
          >
            {isTranscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            size="icon"
            aria-label="Send"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {(isRecording || isTranscribing || voiceError) && (
          <p role={voiceError ? "alert" : "status"} className={`mt-2 text-center text-xs ${voiceError ? "text-destructive" : "text-muted-foreground"}`}>
            {voiceError || (isRecording ? "Recording… click stop when finished (30 seconds maximum)." : "Transcribing audio…")}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2 text-center">
          AI-powered farming advice • Responses may vary
        </p>
      </div>
    </Card>
  );
};

export default AIFarmerAssistant;
