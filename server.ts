import express from 'express';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import mammoth from 'mammoth';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Wait for OpenAI init
  // Check API key properly
  let openai: OpenAI | null = null;
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    openai = new OpenAI({ apiKey });
  } else {
    console.warn("OPENAI_API_KEY is not set. Generation will fail.");
  }

  app.post('/api/generate-quiz', upload.single('file'), async (req, res) => {
    try {
      const { questionCount, difficulty, language, mode, text: bodyText, topic, aiModel } = req.body;
      let sourceText = '';

      if (mode === 'file') {
        if (!req.file) return res.status(400).json({ error: "Fayl yuklanmadi." });
        if (req.file.mimetype === 'application/pdf') {
          const data = await pdfParse(req.file.buffer);
          sourceText = data.text;
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const data = await mammoth.extractRawText({ buffer: req.file.buffer });
          sourceText = data.value;
        } else {
          return res.status(400).json({ error: "Faqat PDF yoki DOCX fayllari qo'llab-quvvatlanadi." });
        }
      } else if (mode === 'text') {
        sourceText = bodyText || '';
      } else if (mode === 'topic') {
        sourceText = `Mavzu: ${topic}`;
      }

      if (!sourceText.trim() && mode !== 'topic') {
         return res.status(400).json({ error: "Ma'lumot topilmadi." });
      }

      try {
        if (!openai) {
          return res.status(500).json({ error: "OpenAI API sozlanmagan." });
        }

        const languageMap: Record<string, string> = {
          'uzbek': "O'ZBEK TILIDA",
          'russian': "RUS TILIDA (на русском языке)",
          'english': "INGLIZ TILIDA (in English)"
        };

        const difficultyMap: Record<string, string> = {
          'easy': "oson va asosiy tushunchalarga oid",
          'medium': "o'rtacha darajadagi, mantiqiy va tushunarli",
          'hard': "murakkab, chuqur tahliliy va qiyin darajadagi"
        };

        const targetLang = languageMap[language] || "O'ZBEK TILIDA";
        const targetDiff = difficultyMap[difficulty] || "o'rtacha darajadagi";
        const targetCount = questionCount || "10";

        let prompt = '';
        if (mode === 'topic') {
          prompt = `Sen professional o'qituvchi va malakali test tuzuvchisan. Quyidagi mavzu bo'yicha ${targetLang} mantiqiy va sifatli test savollarini O'Z BILIMLARING ASOSIDA tuz.
Mavzu: ${topic}
Qiyinlik darajasi: ${targetDiff}.
Savollar soni: Taxminan ${targetCount} ta savol tuz.`;
        } else {
          prompt = `Sen professional o'qituvchi va malakali test tuzuvchisan. Quyidagi taqdim etilgan matn asosida ${targetLang} mantiqiy va sifatli test savollarini tuz. 
Matndan eng muhim faktlarni ajratib olgin. Variantlar chalg'ituvchi va ishonchli ko'rinishi kerak.
Qiyinlik darajasi: ${targetDiff}.
Savollar soni: SENSING MATN VA FOYDALANUVCHI TALABIGA QARAB TAXMINAN ${targetCount} TA SAVOL TUZ.`;
        }

        prompt += `
DIQQAT: Testda ba'zi savollarning bir nechta to'g'ri javobi bo'lishi mumkin. 

Faqatgina JSON formatda qaytar. JSON strukturasi qat'iyan quyidagicha bo'lishi shart:
{
  "questions": [
    {
      "question": "Savol matni?",
      "options": ["A variant", "B variant", "C variant", "D variant"],
      "correctAnswers": [0, 2],
      "isMultiple": true
    }
  ]
}
correctAnswers - bu to'g'ri javoblar indekslari massivi. Agar faqat bitta to'g'ri javob bo'lsa, massivda bitta element bo'lsin va isMultiple: false bo'lsin. Jami variantlar doim 4 ta bo'lsin. Hech qanday HTML markdown (\`\`\`json) yoki boshqa matn ishlatma, to'g'ridan to'g'ri sof JSON obyekti qaytar.`;

        const response = await openai.chat.completions.create({
           model: aiModel || 'gpt-4o-mini',
           messages: [
             { role: 'system', content: prompt },
             { role: 'user', content: mode === 'topic' ? `Mavzu haqida test tuz: ${topic}` : `MATN:\n${sourceText.substring(0, 90000)}` }
           ],
           response_format: { type: "json_object" },
           temperature: 0.7
        });
        
        let responseText = response.choices[0].message.content || "";
        if (!responseText) {
           return res.status(500).json({ error: "AI test yarata olmadi. Iltimos qayta urinib ko'ring." });
        }
        
        const quizData = JSON.parse(responseText);
        
        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
           return res.status(400).json({ error: "Hujjatdan yetarlicha ma'lumot topilmadi yoki AI noto'g'ri format qaytardi." });
        }

        return res.json(quizData);

      } catch (parseErr: any) {
        console.error("AI Error:", parseErr);
        if (parseErr.message && (parseErr.message.includes('API key') || parseErr.message.includes('401'))) {
          return res.status(400).json({ error: "Sizning xabar yoki sozlamalaringizdagi OpenAI API kaliti yaroqsiz ko'rinmoqda. Iltimos, AI Studio > Settings > Secrets bo'limiga kirib to'g'ri 'OPENAI_API_KEY' kiritilganiga ishonch hosil qiling." });
        }
        return res.status(500).json({ error: parseErr.message || "Test tuzishda xatolik yuz berdi. Matn o'ta murakkab yoki uzun bo'lishi mumkin." });
      }

    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "An error occurred during quiz processing." });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // This is run from `dist/server.js` so `__dirname` is `dist`
    const distPath = path.join(__dirname, '.'); // in production build `dist` is the root where index.html and server.js lives. Oh wait, vite build puts it in `dist`, server.js is in `dist/server.js`.
    // Let's just serve `dist` if we are inside it, or just use `import.meta.url` again.
    // If the server compiles to `dist/server.js`, its `__dirname` is `<proj-root>/dist`.
    const indexHtmlPath = path.join(__dirname, 'index.html');
    app.use(express.static(__dirname));
    app.get('*', (req, res) => {
      res.sendFile(indexHtmlPath);
    });
  }

  // Generic error handler to prevent HTML response on API errors (e.g., Multer limits)
  // Must be defined AFTER all routes to work correctly
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Error Handler:", err.message);
    if (req.path.startsWith('/api/')) {
       res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
       return;
    }
    next(err);
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
