import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/providers/voice_provider.dart';
import '../../core/providers/calendar_provider.dart';
import 'soundwave_painter.dart';

class FluidInteractionBar extends StatefulWidget {
  const FluidInteractionBar({super.key});

  @override
  State<FluidInteractionBar> createState() => _FluidInteractionBarState();
}

class _FluidInteractionBarState extends State<FluidInteractionBar> {
  final TextEditingController _textController = TextEditingController();
  bool _isTypingMode = false;

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<ThemeProvider>(context);
    final voice = Provider.of<VoiceProvider>(context);
    final calendar = Provider.of<CalendarProvider>(context);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        color: theme.panel,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(
          color: voice.isListening ? theme.accent : theme.border,
          width: voice.isListening ? 2 : 1,
        ),
        boxShadow: [
          if (voice.isListening)
            BoxShadow(
              color: theme.accent.withOpacity(0.25),
              blurRadius: 20,
              spreadRadius: 2,
            ),
        ],
      ),
      child: _isTypingMode
          ? Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    autofocus: true,
                    style: TextStyle(color: theme.textPrimary, fontSize: 16),
                    decoration: InputDecoration(
                      hintText: "Örn: Yarın 15:00 Kadıköy Noterliği...",
                      hintStyle: TextStyle(color: theme.textMuted, fontSize: 15),
                      border: InputBorder.none,
                    ),
                    onSubmitted: (val) async {
                      if (val.trim().isNotEmpty) {
                        setState(() => _isTypingMode = false);
                        final parsed = await voice.parseTextCommand(val);
                        _textController.clear();
                        if (parsed != null) {
                          await calendar.addParsedEvent(parsed);
                        }
                      }
                    },
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.send_rounded, color: theme.accent),
                  onPressed: () async {
                    final val = _textController.text;
                    if (val.trim().isNotEmpty) {
                      setState(() => _isTypingMode = false);
                      final parsed = await voice.parseTextCommand(val);
                      _textController.clear();
                      if (parsed != null) {
                        await calendar.addParsedEvent(parsed);
                      }
                    }
                  },
                ),
                IconButton(
                  icon: Icon(Icons.close_rounded, color: theme.textMuted),
                  onPressed: () => setState(() => _isTypingMode = false),
                ),
              ],
            )
          : GestureDetector(
              onTap: () {
                setState(() => _isTypingMode = true);
              },
              onLongPressStart: (_) async {
                await voice.startListening();
              },
              onLongPressEnd: (_) async {
                final parsed = await voice.stopListeningAndParse();
                if (parsed != null) {
                  await calendar.addParsedEvent(parsed);
                }
              },
              child: SizedBox(
                height: 50,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (voice.isListening)
                      Expanded(
                        child: CustomPaint(
                          size: const Size(double.infinity, 40),
                          painter: SoundwavePainter(
                            soundLevel: voice.soundLevel,
                            waveColor: theme.accent,
                          ),
                        ),
                      )
                    else ...[
                      Icon(Icons.keyboard_outlined, color: theme.textMuted, size: 22),
                      Text(
                        "Basılı tutun: Konuşun • Dokunun: Yazın",
                        style: TextStyle(color: theme.textMuted, fontSize: 14, fontWeight: FontWeight.w500),
                      ),
                      Icon(Icons.mic_none_rounded, color: theme.accent, size: 22),
                    ],
                  ],
                ),
              ),
            ),
    );
  }
}
