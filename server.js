import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3000);
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_INSTRUCTION = `أنت "مرشد أثرنا الذكي"، مرشد سياحي رقمي متخصص في البتراء ومملكة الأنباط.
- أجب بالعربية الفصحى المبسطة، بنبرة ودية ومهنية.
- اجعل الإجابة موجزة وواضحة، عادةً 3–6 أسطر.
- فرّق بوضوح بين المعلومات التاريخية الموثقة والأساطير أو الروايات الشعبية.
- إذا لم تكن متأكداً من معلومة، قل ذلك بوضوح ولا تخترع تفاصيل.
- ركّز على البتراء والتراث الأردني وتجربة الزائر.
- لا تدّعِ أن بيانات الازدحام أو الحجز أو التأثيرات في ATHRUNA حقيقية؛ هذه النسخة واجهة عرض/نموذج أولي.`;

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string')
    .slice(-12)
    .map((m) => ({
      role: m.role,
      parts: [{ text: m.text.slice(0, 5000) }]
    }));
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, cloudAI: Boolean(process.env.GEMINI_API_KEY), model: MODEL });
});

app.post('/api/chat', async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      ok: false,
      code: 'NO_API_KEY',
      message: 'لا يوجد GEMINI_API_KEY في ملف البيئة. استخدم المرشد المحلي أو أضف المفتاح إلى .env.'
    });
  }

  const contents = normalizeMessages(req.body?.messages);
  if (!contents.length || contents.at(-1)?.role !== 'user') {
    return res.status(400).json({ ok: false, message: 'صيغة المحادثة غير صالحة.' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`;
  const payload = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents,
    generationConfig: {
      temperature: 0.45,
      maxOutputTokens: 500
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || `Gemini HTTP ${response.status}`;
      return res.status(response.status).json({ ok: false, message });
    }

    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map((part) => part?.text || '')
      .join('')
      .trim();

    if (!text) {
      return res.status(502).json({ ok: false, message: 'وصل رد فارغ من Gemini.' });
    }

    return res.json({ ok: true, text, model: MODEL });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error?.message || 'فشل الاتصال بالخدمة.' });
  }
});

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ATHRUNA running on http://localhost:${PORT}`);
});
