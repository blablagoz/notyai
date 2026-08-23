import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Mic, X } from 'lucide-react';
import { ThemeColors } from '../theme';

interface LiveTranscriptOverlayProps {
  isListening: boolean;
  isProcessingAI: boolean;
  transcript: string;
  assistantSummary?: string;
  theme: ThemeColors;
  onDismiss: () => void;
}

export const LiveTranscriptOverlay: React.FC<LiveTranscriptOverlayProps> = ({
  isListening,
  isProcessingAI,
  transcript,
  assistantSummary,
  theme,
  onDismiss,
}) => {
  const pointerStart = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);

  useEffect(() => setDragX(0), [assistantSummary, isListening, isProcessingAI]);

  const finishSwipe = () => {
    if (Math.abs(dragX) >= 70) onDismiss();
    setDragX(0);
    pointerStart.current = null;
  };

  if (!isListening && !isProcessingAI && !assistantSummary) {
    return null;
  }

  return (
    <div
      className="fixed top-[calc(5rem+env(safe-area-inset-top,0px))] left-[max(1rem,env(safe-area-inset-left,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] sm:left-auto sm:right-[max(1.5rem,env(safe-area-inset-right,0px))] sm:w-96 z-40 animate-in fade-in slide-in-from-top-4 duration-300"
      onPointerDown={(event) => { pointerStart.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={(event) => { if (pointerStart.current !== null) setDragX(event.clientX - pointerStart.current); }}
      onPointerUp={finishSwipe}
      onPointerCancel={finishSwipe}
      style={{ transform: `translateX(${dragX}px)`, opacity: Math.max(0.35, 1 - Math.abs(dragX) / 220), touchAction: 'pan-y', transition: pointerStart.current === null ? 'transform 180ms ease, opacity 180ms ease' : 'none' }}
    >
      <div
        className="p-4 sm:p-5 rounded-2xl shadow-2xl backdrop-blur-md"
        style={{
          backgroundColor: `${theme.panel}F5`,
          border: `2px solid ${theme.accent}`,
          boxShadow: `0 10px 30px ${theme.accent}30`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          {isProcessingAI ? (
            <>
              <Sparkles size={16} className="animate-spin" style={{ color: theme.accent }} />
              <span className="text-xs font-bold tracking-wide" style={{ color: theme.accent }}>
                KOMUT İŞLENİYOR...
              </span>
            </>
          ) : isListening ? (
            <>
              <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: theme.accent }} />
              <Mic size={15} style={{ color: theme.accent }} />
              <span className="text-xs font-bold tracking-wide" style={{ color: theme.accent }}>
                DİNLENİYOR (TÜRKÇE)...
              </span>
            </>
          ) : (
            <>
              <Sparkles size={15} style={{ color: theme.accent }} />
              <span className="text-xs font-bold tracking-wide" style={{ color: theme.accent }}>
                NOTYAI ASİSTAN NOTU
              </span>
            </>
          )}
          <button onClick={onDismiss} className="ml-auto p-1 rounded-lg" aria-label="Bildirimi kapat" style={{ color: theme.textMuted }}><X size={15}/></button>
        </div>

        {transcript && (
          <p
            className="text-sm sm:text-base font-bold italic mb-1"
            style={{ color: theme.textPrimary }}
          >
            "{transcript}"
          </p>
        )}

        {assistantSummary && (
          <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: theme.textMuted }}>
            {assistantSummary}
          </p>
        )}
      </div>
    </div>
  );
};
