import React, { useEffect, useRef } from 'react';

interface SoundwaveVisualizerProps {
  isListening: boolean;
  waveColor: string;
}

export const SoundwaveVisualizer: React.FC<SoundwaveVisualizerProps> = ({
  isListening,
  waveColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const barsCount = 32;
      const barWidth = width / barsCount;

      for (let i = 0; i < barsCount; i++) {
        // Generate simulated dynamic frequencies with sinusoidal wave modulation
        const progress = i / barsCount;
        const sinFactor = Math.sin(progress * Math.PI * 3 + phase);
        const cosFactor = Math.cos(progress * Math.PI * 2 - phase * 0.8);
        const amplitude = isListening ? Math.abs(sinFactor * cosFactor) * (height * 0.42) + 4 : 3;

        const x = i * barWidth + barWidth * 0.2;
        const y = centerY - amplitude;
        const bHeight = amplitude * 2;
        const radius = Math.min(barWidth * 0.3, 3);

        ctx.fillStyle = waveColor;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth * 0.6, bHeight, radius);
        } else {
          ctx.rect(x, y, barWidth * 0.6, bHeight);
        }
        ctx.fill();
      }

      phase += isListening ? 0.15 : 0.02;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, waveColor]);

  return (
    <div className="w-full h-10 flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={320}
        height={40}
        className="w-full h-full max-w-sm"
      />
    </div>
  );
};
