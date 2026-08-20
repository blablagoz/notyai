import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/parsed_event_model.dart';

class GeminiAIService {
  // Google AI Studio'dan alacağınız ücretsiz API Anahtarı
  final String _apiKey;

  GeminiAIService({String apiKey = "YOUR_GEMINI_API_KEY"}) : _apiKey = apiKey;

  Future<ParsedEventModel?> parseNaturalLanguageInput(String userInput) async {
    final now = DateTime.now();
    final nowIso = now.toIso8601String();

    final systemPrompt = '''
Sen "NotyAI" isimli sesli/yazılı kişisel ajanda asistanının doğal dil işleme motorusun.
Görevin: Kullanıcının Türkçe serbest konuşma veya yazı girdisini analiz edip standart bir JSON takvim formatına dönüştürmek.

Şu anki gerçek zaman referansı: $nowIso (Yıl-Ay-Gün Saat:Dakika:Saniye).

Kurallar:
1. "Yarın", "akşama doğru", "haftaya cuma", "saat 3'te" gibi ifadeleri referans tarihe göre kesin ISO-8601 tarihlerine (YYYY-MM-DDTHH:mm:ss) çevir.
2. Süre belirtilmemişse varsayılan süreyi 1 saat (60 dakika) yap.
3. Hatırlatıcı belirtilmemişse "reminder_minutes_before" değerini 60 yap.
4. Kategori tahmin et (örn: 'Hukuk', 'Resmi', 'Toplantı', 'Spor', 'Sağlık', 'Ders', 'Kişisel').
5. Eğer kullanıcı "işlerimi 1 saat kaydır/ötele" dediyse "is_reschedule": true yap.

Çıktı SADECE ve SADECE saf bir JSON objesi olmalıdır. Markdown veya açıklama yazma.

Örnek Çıktı Şeması:
{
  "title": "Kadıköy Noterliği",
  "start_time": "2026-08-21T15:00:00",
  "end_time": "2026-08-21T16:00:00",
  "reminder_minutes_before": 30,
  "category": "Resmi",
  "location": "Kadıköy Noterliği",
  "description": "Sesli komutla eklendi",
  "is_reschedule": false
}
''';

    final url = Uri.parse(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$_apiKey',
    );

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'contents': [
            {
              'parts': [
                {'text': '$systemPrompt\n\nKullanıcı Girdisi: "$userInput"'}
              ]
            }
          ],
          'generationConfig': {
            'response_mime_type': 'application/json',
            'temperature': 0.1,
          }
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final rawText = data['candidates'][0]['content']['parts'][0]['text'];
        final Map<String, dynamic> jsonMap = jsonDecode(rawText);
        return ParsedEventModel.fromJson(jsonMap);
      } else {
        print('Gemini API Error: ${response.statusCode} - ${response.body}');
        return null;
      }
    } catch (e) {
      print('AI Parse Exception: $e');
      return null;
    }
  }
}
