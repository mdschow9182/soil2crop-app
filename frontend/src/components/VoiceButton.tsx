import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { speakMessage, stopSpeaking, isSpeechSupported } from '@/utils/voiceAssistant';

interface VoiceButtonProps {
  message: string;
  language: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  className?: string;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
}

export const VoiceButton = ({
  message,
  language,
  size = 'md',
  variant = 'ghost',
  className = '',
  onSpeakStart,
  onSpeakEnd,
}: VoiceButtonProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const supported = isSpeechSupported();

  const handleSpeak = () => {
    if (!supported || !message) return;

    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      if (onSpeakEnd) onSpeakEnd();
      return;
    }

    if (onSpeakStart) onSpeakStart();

    speakMessage(
      message,
      language,
      () => {
        setIsSpeaking(false);
        if (onSpeakEnd) onSpeakEnd();
      },
      () => {
        setIsSpeaking(false);
      }
    );

    setIsSpeaking(true);
  };

  if (!supported) {
    return null; // Don't show button if speech not supported
  }

  const sizeClasses = {
    sm: 'w-8 h-8 p-0',
    md: 'w-10 h-10 p-0',
    lg: 'w-12 h-12 p-0',
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleSpeak}
      className={`${sizeClasses[size]} ${className}`}
      aria-label={isSpeaking ? 'Stop speaking' : 'Listen to message'}
      title={isSpeaking ? 'Stop' : 'Listen'}
    >
      {isSpeaking ? (
        <VolumeX className="w-5 h-5" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </Button>
  );
};
