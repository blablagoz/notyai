import 'package:flutter/material.dart';
import '../services/speech_service.dart';
import '../services/gemini_ai_service.dart';
import '../models/parsed_event_model.dart';

class VoiceProvider extends ChangeNotifier {
  final SpeechService _speechService = SpeechService();
  final GeminiAIService _aiService = GeminiAIService();

  bool _isListening = false;
  bool _isProcessingAI = false;
  String _liveTranscript = '';
  double _soundLevel = 0.0;
  ParsedEventModel? _lastParsedEvent;

  bool get isListening => _isListening;
  bool get isProcessingAI => _isProcessingAI;
  String get liveTranscript => _liveTranscript;
  double get soundLevel => _soundLevel;
  ParsedEventModel? get lastParsedEvent => _lastParsedEvent;

  Future<void> startListening() async {
    _liveTranscript = '';
    _isListening = true;
    _lastParsedEvent = null;
    notifyListeners();

    await _speechService.startListening(
      onResult: (text) {
        _liveTranscript = text;
        notifyListeners();
      },
      onSoundLevel: (level) {
        _soundLevel = level;
        notifyListeners();
      },
    );
  }

  Future<ParsedEventModel?> stopListeningAndParse() async {
    _isListening = false;
    notifyListeners();
    await _speechService.stopListening();

    if (_liveTranscript.trim().isEmpty) return null;

    return parseTextCommand(_liveTranscript);
  }

  Future<ParsedEventModel?> parseTextCommand(String text) async {
    _isProcessingAI = true;
    _liveTranscript = text;
    notifyListeners();

    _lastParsedEvent = await _aiService.parseNaturalLanguageInput(text);
    _isProcessingAI = false;
    notifyListeners();

    return _lastParsedEvent;
  }

  void clearParsedEvent() {
    _lastParsedEvent = null;
    _liveTranscript = '';
    notifyListeners();
  }
}
