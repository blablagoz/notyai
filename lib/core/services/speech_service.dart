import 'package:speech_to_text/speech_to_text.dart';
import 'package:permission_handler/permission_handler.dart';

class SpeechService {
  final SpeechToText _speech = SpeechToText();
  bool _isInitialized = false;

  bool get isListening => _speech.isListening;

  Future<bool> initSpeech() async {
    final status = await Permission.microphone.request();
    if (!status.isGranted) return false;

    _isInitialized = await _speech.initialize(
      onError: (val) => print('Speech Error: $val'),
      onStatus: (val) => print('Speech Status: $val'),
    );
    return _isInitialized;
  }

  Future<void> startListening({
    required Function(String text) onResult,
    required Function(double soundLevel) onSoundLevel,
  }) async {
    if (!_isInitialized) {
      final success = await initSpeech();
      if (!success) return;
    }

    await _speech.listen(
      onResult: (result) => onResult(result.recognizedWords),
      onSoundLevelChange: onSoundLevel,
      localeId: 'tr_TR',
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 4),
      cancelOnError: true,
      partialResults: true,
    );
  }

  Future<void> stopListening() async {
    await _speech.stop();
  }
}
