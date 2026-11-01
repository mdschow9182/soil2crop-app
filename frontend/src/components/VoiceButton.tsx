import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { speakMessage, stopSpeech, isSpeechSupported } from '@/utils/voiceAssistant';
import { speakWithGnani } from '@/api';
import { useLanguage } from '@/context/LanguageContext';

interface VoiceButtonProps {
  message: string;
  language: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  className?: string;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  useGnani?: boolean;
}

export const VoiceButton = ({
  message,
  language,
  size = 'md',
  variant = 'ghost',
  className = '',
  onSpeakStart,
  onSpeakEnd,
  useGnani = false,
}: VoiceButtonProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const mounted = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const { t } = useLanguage();
  const supported = isSpeechSupported();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopSpeech();
      audioRef.current?.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  // A language or displayed sentence change invalidates any speech from the old render.
  useEffect(() => {
    stopSpeech();
    audioRef.current?.pause();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setIsSpeaking(false);
    setVoiceStatus('');
  }, [language, message]);

  const handleSpeak = () => {
    if (!useGnani && !supported) {
      setVoiceStatus(t.voiceUnsupported);
      return;
    }
    if (!message?.trim()) {
      setVoiceStatus(t.voiceUnavailable);
      return;
    }

    if (isSpeaking) {
      stopSpeech();
      audioRef.current?.pause();
      setIsSpeaking(false);
      if (onSpeakEnd) onSpeakEnd();
      return;
    }

    setIsSpeaking(true);
    setVoiceStatus('');
    if (useGnani) {
      void speakWithGnani(message, language).then((audio) => {
        if (!mounted.current) return;
        const url = URL.createObjectURL(audio);
        audioUrlRef.current = url;
        const player = new Audio(url);
        audioRef.current = player;
        player.onended = () => { if (mounted.current) setIsSpeaking(false); onSpeakEnd?.(); };
        player.onerror = () => {
          console.error('[VoiceButton] Gnani audio playback failed', { mediaErrorCode: player.error?.code ?? null });
          if (mounted.current) { setIsSpeaking(false); setVoiceStatus(t.voiceUnavailable); }
        };
        onSpeakStart?.();
        return player.play();
      }).catch((error: unknown) => {
        console.error('[VoiceButton] Gnani speech request or playback failed', {
          name: error instanceof Error ? error.name : 'UnknownError',
          message: error instanceof Error ? error.message : 'Unknown playback error',
        });
        if (mounted.current) { setIsSpeaking(false); setVoiceStatus(t.voiceUnavailable); }
      });
      return;
    }
    void speakMessage(
      message,
      language,
      () => {
        if (!mounted.current) return;
        setIsSpeaking(false);
        if (onSpeakEnd) onSpeakEnd();
      },
      () => {
        if (!mounted.current) return;
        setIsSpeaking(false);
        onSpeakEnd?.();
        setVoiceStatus(t.voiceUnavailable);
      },
      () => { if (mounted.current) onSpeakStart?.(); },
    ).then((selection) => {
      if (!mounted.current) return;
      if (selection.reason === 'cancelled') {
        setIsSpeaking(false);
        onSpeakEnd?.();
      } else if (selection.status === 'unsupported' || selection.status === 'no_voice' || selection.status === 'error' || selection.status === 'failure') {
        setIsSpeaking(false);
        setVoiceStatus(t.voiceUnavailable);
      } else {
        setVoiceStatus(selection.isFallback ? t.voiceFallbackSimple : '');
      }
    }).catch(() => {
      if (!mounted.current) return;
      setIsSpeaking(false);
      setVoiceStatus(t.voiceUnavailable);
    });
  };

  if (!supported && !useGnani) {
    return <span role="status" className="text-xs text-muted-foreground">{t.voiceUnsupported}</span>;
  }

  const sizeClasses = {
    sm: 'h-11 px-3',
    md: 'h-11 px-4',
    lg: 'h-12 px-4',
  };

  return (
    <span className="inline-flex items-center gap-2">
    <Button
      variant={variant}
      size="sm"
      onClick={handleSpeak}
      className={`inline-flex w-auto items-center gap-1.5 ${sizeClasses[size]} ${className}`}
      aria-label={isSpeaking ? t.voiceStop : t.voiceListen}
      title={isSpeaking ? t.voiceStop : t.voiceListen}
    >
      {isSpeaking ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      <span className="text-xs">{isSpeaking ? t.voiceStop : t.voiceListen}</span>
    </Button>
    {voiceStatus && <span role="status" className="text-xs text-muted-foreground">{voiceStatus}</span>}
    </span>
  );
};
