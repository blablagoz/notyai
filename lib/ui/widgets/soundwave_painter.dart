import 'dart:math';
import 'package:flutter/material.dart';

class SoundwavePainter extends CustomPainter {
  final double soundLevel;
  final Color waveColor;

  SoundwavePainter({required this.soundLevel, required this.waveColor});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = waveColor
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    final centerY = size.height / 2;
    const numBars = 36;
    final spacing = size.width / numBars;

    for (int i = 0; i < numBars; i++) {
      final x = i * spacing + spacing / 2;
      final normalizedLevel = (soundLevel / 10).clamp(0.1, 1.0);
      final heightFactor = sin(i * 0.25) * cos(i * 0.15).abs();
      final barHeight = (size.height * 0.2) + (heightFactor * size.height * 0.7 * normalizedLevel);

      canvas.drawLine(
        Offset(x, centerY - barHeight / 2),
        Offset(x, centerY + barHeight / 2),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant SoundwavePainter oldDelegate) {
    return oldDelegate.soundLevel != soundLevel || oldDelegate.waveColor != waveColor;
  }
}
