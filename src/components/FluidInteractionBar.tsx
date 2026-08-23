import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, X, Keyboard, Sparkles, Loader2 } from 'lucide-react';
import { ThemeColors } from '../theme';
import { SoundwaveVisualizer } from './SoundwaveVisualizer';
import { isNativeAndroid, NativeDevice } from '../services/native';

interface FluidInteractionBarProps {
  theme: ThemeColors;
  isProcessingAI: boolean;
  onSendCommand: (text: string) => Promise<void>;
  onLiveTranscriptUpdate?: (transcript: string) => void;
  onListeningStateChange?: (isListening: boolean) => void;
}

export const FluidInteractionBar: React.FC<FluidInteractionBarProps> = ({
  theme,
  isProcessingAI,
  onSendCommand,
  onLiveTranscriptUpdate,
  onListeningStateChange,
}) => {
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (isNativeAndroid()) { setMicSupported(true); return; }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'tr-TR';

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
        onListeningStateChange?.(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        onLiveTranscriptUpdate?.(currentTranscript);

        if (event.results[0].isFinal) {
          handleFinalSpeech(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicError('Mikrofon izni verilmedi. Lütfen tarayıcıdan mikrofon iznini onaylayın.');
        }
        setIsListening(false);
        onListeningStateChange?.(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        onListeningStateChange?.(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech Recognition init error:', err);
      setMicSupported(false);
    }
  }, []);

  const handleFinalSpeech = async (speechText: string) => {
    if (speechText.trim()) {
      await onSendCommand(speechText.trim());
    }
  };

  const toggleListening = async () => {
    if (isNativeAndroid()) {
      try {
        setMicError(null); setIsListening(true); onListeningStateChange?.(true);
        const permission = await NativeDevice.requestMicrophonePermission();
        if (!permission.granted) throw new Error('Mikrofon izni verilmedi.');
        const result = await NativeDevice.startSpeechRecognition({ language: 'tr-TR', prompt: 'NotyAI komutunuzu dinliyor', maxResults: 3 });
        if (!result.cancelled && result.text.trim()) { onLiveTranscriptUpdate?.(result.text); await handleFinalSpeech(result.text); }
      } catch (error: any) { setMicError(error.message || 'Sesli komut başlatılamadı.'); }
      finally { setIsListening(false); onListeningStateChange?.(false); }
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      onListeningStateChange?.(false);
    } else {
      try {
        setMicError(null);
        recognitionRef.current?.start();
      } catch (err) {
        // If already started or failed
        try {
          recognitionRef.current?.stop();
          setTimeout(() => recognitionRef.current?.start(), 200);
        } catch {
          setIsListening(false);
        }
      }
    }
  };

  const handleTextSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputText.trim()) {
      const text = inputText.trim();
      setInputText('');
      setIsTypingMode(false);
      await onSendCommand(text);
    }
  };

  const quickPills = [
    'Yarın 15:00 Kadıköy Noterliği',
    'Cuma 10:00 Yönetim Toplantısı',
    'Bugün 18:30 Spor Salonu',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6 pt-1">
      {/* Quick Suggestion Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider shrink-0 mr-1" style={{ color: theme.textSubtle }}>
          Hızlı Komutlar:
        </span>
        {quickPills.map((pill, i) => (
          <button
            key={i}
            id={`quick-pill-${i}`}
            onClick={() => onSendCommand(pill)}
            disabled={isProcessingAI}
            className="text-xs font-semibold px-3 py-1 rounded-full shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{
              backgroundColor: theme.panel,
              color: theme.textMuted,
              border: `1px solid ${theme.border}`,
            }}
          >
            + {pill}
          </button>
        ))}
      </div>

      {micError && (
        <div className="mb-2 text-xs p-2 rounded-xl text-amber-300 bg-amber-950/40 border border-amber-500/30 text-center">
          {micError}
        </div>
      )}

      {/* Main Fluid Interaction Bar Container */}
      <div
        className="relative flex items-center justify-between p-2 sm:p-2.5 rounded-full transition-all duration-300 backdrop-blur-xl shadow-2xl"
        style={{
          backgroundColor: theme.panel,
          border: `2px solid ${isListening ? theme.accent : theme.border}`,
          boxShadow: isListening ? `0 0 25px ${theme.accent}40` : '0 10px 30px rgba(0,0,0,0.25)',
        }}
      >
        {isTypingMode ? (
          /* Typing Mode */
          <form onSubmit={handleTextSubmit} className="flex-1 min-w-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
            <input
              id="event-nlp-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Örn: Yarın 15:00 Kadıköy Noterliği sözleşme randevusu..."
              autoFocus
              className="flex-1 min-w-0 bg-transparent text-sm sm:text-base outline-none font-medium placeholder:font-normal"
              style={{
                color: theme.textPrimary,
              }}
            />

            <button
              type="submit"
              id="send-event-btn"
              disabled={isProcessingAI || !inputText.trim()}
              aria-label="Komutu Gönder"
              className="p-2.5 rounded-full font-bold transition-all hover:scale-105 disabled:opacity-40"
              style={{
                backgroundColor: theme.accent,
                color: theme.bg,
              }}
            >
              {isProcessingAI ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>

            <button
              type="button"
              id="close-typing-btn"
              onClick={() => setIsTypingMode(false)}
              aria-label="Yazma Modunu Kapat"
              className="p-2 rounded-full transition-colors opacity-70 hover:opacity-100"
              style={{ color: theme.textMuted }}
            >
              <X size={18} />
            </button>
          </form>
        ) : (
          /* Voice & Touch Interactive Zero-UI Mode */
          <div className="w-full flex items-center justify-between px-2 sm:px-4 py-1">
            {/* Keyboard Switch Button */}
            <button
              id="open-keyboard-btn"
              onClick={() => setIsTypingMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors hover:opacity-80"
              style={{
                backgroundColor: theme.card,
                color: theme.textMuted,
                border: `1px solid ${theme.border}`,
              }}
            >
              <Keyboard size={15} />
              <span className="hidden sm:inline">Yazarak Ekle</span>
            </button>

            {/* Center Dynamic Status / Soundwave */}
            <div className="flex-1 mx-3 sm:mx-6 flex items-center justify-center overflow-hidden">
              {isListening ? (
                <div className="w-full flex items-center gap-2">
                  <SoundwaveVisualizer isListening={true} waveColor={theme.accent} />
                </div>
              ) : isProcessingAI ? (
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold animate-pulse" style={{ color: theme.accent }}>
                  <Sparkles size={16} className="animate-spin" />
                  <span>Gemini NLP İşliyor...</span>
                </div>
              ) : (
                <div
                  onClick={() => setIsTypingMode(true)}
                  className="text-center cursor-pointer select-none text-xs sm:text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ color: theme.textSubtle }}
                >
                  <span className="hidden md:inline">Mikrofona basın: <b>Konuşun</b> • Dokunun: <b>Yazın</b></span>
                  <span className="md:hidden">Konuşun veya Yazın</span>
                </div>
              )}
            </div>

            {/* Mic Toggle Button */}
            <button
              id="mic-toggle-btn"
              onClick={toggleListening}
              disabled={isProcessingAI || !micSupported}
              aria-label={isListening ? "Mikrofonu Kapat" : "Sesli Komut Ver"}
              className={`relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${
                isListening ? 'scale-110 shadow-lg' : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: isListening ? theme.accent : theme.card,
                color: isListening ? theme.bg : theme.accent,
                border: `2px solid ${theme.accent}`,
                boxShadow: isListening ? `0 0 20px ${theme.accent}` : 'none',
              }}
            >
              {isListening ? (
                <MicOff size={20} className="animate-pulse" />
              ) : isProcessingAI ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Mic size={20} />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
