import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-load Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "NotyAI", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

// Parse natural language event via Gemini 2.5 Flash
app.post("/api/parse-event", async (req, res) => {
  try {
    const { userInput, referenceTime } = req.body;
    if (!userInput || typeof userInput !== "string") {
      return res.status(400).json({ error: "userInput is required" });
    }

    const refDate = referenceTime ? new Date(referenceTime) : new Date();
    const nowIso = refDate.toISOString();

    const systemInstruction = `Sen "NotyAI" isimli sesli ve yazılı akıllı ajanda/takvim asistanının Türkçe doğal dil işleme motorusun.
Görevin: Kullanıcının Türkçe serbest konuşma veya yazı girdisini analiz edip standart bir JSON takvim formatına dönüştürmek.
Şu anki referans zaman: ${nowIso} (Gün-Ay-Yıl Saat:Dakika).

Kurallar:
1. "Yarın", "akşama doğru", "öğleden sonra 3'te", "haftaya cuma 10:00", "pazartesi 09:30" gibi ifadeleri referans tarihe göre kesin ISO-8601 tarihlerine (YYYY-MM-DDTHH:mm:ss) çevir.
2. Saat belirtilmemişse mantıklı bir iş saati belirle (örneğin sabah için 09:00, öğleden sonra için 14:00, akşam için 19:00).
3. Süre belirtilmemişse varsayılan süreyi 1 saat (60 dakika) yap.
4. Hatırlatıcı için "reminderMinutesBefore" değerini aksi belirtilmedikçe 60 dakika yap.
5. Kategori tahmin et ('Hukuk', 'Resmi', 'Toplantı', 'Spor', 'Sağlık', 'Ders', 'Kişisel', 'Ekip').
6. Eğer kullanıcı "işlerimi 1 saat ötele / kaydır / ertele" dediyse "isReschedule": true ve "rescheduleHours": 1 yap.
7. Kullanıcıya kısa ve zarif bir onay/asistan notu ("assistantSummary") üret (Örn: "Yarın saat 15:00'e Kadıköy Noterliği randevunuz eklendi.").

Çıktı SADECE geçerli bir JSON objesi olmalıdır:
{
  "title": "Kadıköy Noterliği",
  "startTime": "2026-08-21T15:00:00",
  "endTime": "2026-08-21T16:00:00",
  "reminderMinutesBefore": 60,
  "category": "Resmi",
  "location": "Kadıköy Noterliği",
  "description": "Sesli komutla eklendi",
  "isReschedule": false,
  "rescheduleHours": 0,
  "assistantSummary": "Yarın 15:00'te Kadıköy Noterliği randevunuz takviminize işlendi."
}`;

    const ai = getAI();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `Kullanıcı Girdisi: "${userInput}"` }],
          },
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const responseText = response.text || "{}";
      const parsedJson = JSON.parse(responseText);
      return res.json({ success: true, event: parsedJson });
    } else {
      // Fallback heuristic NLP parser if Gemini API key not yet set
      const fallbackEvent = createFallbackParsedEvent(userInput, refDate);
      return res.json({ success: true, event: fallbackEvent, fallback: true });
    }
  } catch (error: any) {
    console.error("AI Parse Error:", error);
    // Return heuristic parsed event even on error so user is never blocked
    const fallback = createFallbackParsedEvent(req.body?.userInput || "Yeni Randevu", new Date());
    return res.json({ success: true, event: fallback, fallback: true, error: error.message });
  }
});

// Daily AI Briefing Endpoint
app.post("/api/daily-briefing", async (req, res) => {
  try {
    const { events, dateStr } = req.body;
    const ai = getAI();
    if (!ai) {
      return res.json({
        briefing: `${dateStr} günü için toplam ${events?.length || 0} etkinliğiniz planlandı. Güne odaklanmak için hazırız!`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Tarih: ${dateStr}. Günün planlanmış etkinlikleri: ${JSON.stringify(events)}.
Lütfen kullanıcıya profesyonel, motive edici, net ve 2-3 cümlelik Türkçe bir günün özeti/brifingi üret.`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.3,
      },
    });

    return res.json({ briefing: response.text });
  } catch (err: any) {
    return res.json({
      briefing: "Gününüzün akışı hazırlandı. Planlarınıza zamanında yetişmeniz için bildirimler devrede!",
    });
  }
});

// Helper for local NLP parsing if Gemini API key isn't provided
function createFallbackParsedEvent(input: string, refDate: Date) {
  const lower = input.toLowerCase();
  let start = new Date(refDate);
  start.setHours(start.getHours() + 1, 0, 0, 0);

  if (lower.includes("yarın")) {
    start.setDate(start.getDate() + 1);
  }

  const timeMatch = lower.match(/(\d{1,2})[:.](\d{2})/) || lower.match(/saat\s*(\d{1,2})/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    if (!isNaN(hour)) {
      start.setHours(hour, minute, 0, 0);
    }
  }

  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  let category = "Genel";
  if (lower.includes("hukuk") || lower.includes("dava") || lower.includes("duruşma") || lower.includes("adliye") || lower.includes("noter")) {
    category = "Hukuk";
  } else if (lower.includes("toplantı") || lower.includes("görüşme") || lower.includes("sunum") || lower.includes("proje")) {
    category = "Toplantı";
  } else if (lower.includes("spor") || lower.includes("antrenman") || lower.includes("koşu") || lower.includes("gym")) {
    category = "Spor";
  } else if (lower.includes("doktor") || lower.includes("sağlık") || lower.includes("hastane") || lower.includes("diş")) {
    category = "Sağlık";
  } else if (lower.includes("ders") || lower.includes("sınav") || lower.includes("kurs") || lower.includes("çalışma")) {
    category = "Ders";
  }

  const isReschedule = lower.includes("ötele") || lower.includes("kaydır") || lower.includes("ertele");

  // Clean title
  let cleanedTitle = input
    .replace(/(yarın|bugün|dün|haftaya|pazartesi|salı|çarşamba|perşembe|cuma|cumartesi|pazar)/gi, "")
    .replace(/(saat\s*\d{1,2}([:.]\d{2})?('?(te|ta|de|da))?)/gi, "")
    .replace(/(\d{1,2}[:.]\d{2}('?(te|ta|de|da))?)/gi, "")
    .replace(/^(te|ta|de|da)\s+/gi, "")
    .replace(/(randevum var|toplantım var|etkinliği|planı|ekle|oluştur)/gi, "")
    .trim();

  if (!cleanedTitle || cleanedTitle.length < 2) {
    cleanedTitle = input.trim();
  }

  // Capitalize title
  cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);

  return {
    title: cleanedTitle || "Yeni Etkinlik",
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    reminderMinutesBefore: 60,
    category,
    location: lower.includes("noter") ? "Kadıköy Noterliği" : lower.includes("adliye") ? "Çağlayan Adliyesi" : undefined,
    description: "NotyAI Türkçe Asistanı ile oluşturuldu",
    isReschedule,
    rescheduleHours: isReschedule ? 1 : 0,
    assistantSummary: `"${cleanedTitle}" etkinliğiniz takviminize işlendi.`,
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NotyAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
