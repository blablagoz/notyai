import React from 'react';
import { Sparkles, Mic } from 'lucide-react';
import { ThemeColors } from '../theme';

interface LiveTranscriptOverlayProps {
  isListening: boolean;
  isProcessingAI: boolean;
  transcript: string;
  assistantSummary?: string;
  theme: ThemeColors;
}

export const LiveTranscriptOverlay: React.FC<LiveTranscriptOverlayProps> = ({
  isListening,
  isProcessingAI,
  transcript,
  assistantSummary,
  theme,
}) => {
  if (!isListening && !isProcessingAI && !assistantSummary) {
    return null;
  }

  return (
    <div className="fixed top-[calc(5rem+env(safe-area-inset-top,0px))] left-[max(1rem,env(safe-area-inset-left,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] sm:left-auto sm:right-[max(1.5rem,env(safe-area-inset-right,0px))] sm:w-96 z-40 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
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
                AI İŞLENİYOR (GEMINI 2.5 FLASH)...
              </span>
            </>
          ) : isListening ? (
            <>
              <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: theme.accent }} />
              <Mic size={15} style={{ color: theme.accent }} />
              <span className="text-xs font-bold tracking-wide" style={{ color: theme.accent }}>
                DİNLENİYOR (TÜRKÇE DOĞAL DİL NLP)...
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
