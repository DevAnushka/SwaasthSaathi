import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { filterHospitals, SPECIALIZATIONS_LIST } from './lib/hospitalData';
import { analyzePrescriptionImage, translateMedicalText, handleAIChat } from './lib/gemini';
import { fetchRemindersFromNeon, saveReminderToNeon, initializeNeonSchema } from './lib/neon';

type Bindings = {
  GEMINI_API_KEY: string;
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS configuration - allowing all for hackathon/development
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// 1. Health Check
app.get('/health', async (c) => {
  const dbStatus = await initializeNeonSchema(c.env.DATABASE_URL);
  return c.json({ status: 'ok', db: dbStatus });
});

// 2. Hospitals
app.get('/hospitals', (c) => {
  const lat = c.req.query('lat') ? parseFloat(c.req.query('lat')!) : undefined;
  const lng = c.req.query('lng') ? parseFloat(c.req.query('lng')!) : undefined;
  const spec = c.req.query('specialization') || 'All';
  const radius = c.req.query('radius') ? parseFloat(c.req.query('radius')!) : undefined;
  const query = c.req.query('q') || '';

  const hospitals = filterHospitals(lat, lng, spec, radius, query);
  return c.json({ success: true, data: { hospitals, total: hospitals.length, specializations: SPECIALIZATIONS_LIST } });
});

// 3. Scan Prescription
app.post('/scan-prescription', async (c) => {
  try {
    const { imageBase64, mimeType, useDemo } = await c.req.json();
    if (useDemo) {
      return c.json({ success: true, data: analyzePrescriptionImage('', '', '') });
    }
    if (!imageBase64) return c.json({ success: false, error: 'No image' }, 400);

    const result = await analyzePrescriptionImage(c.env.GEMINI_API_KEY, imageBase64, mimeType);
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 4. Translate
app.post('/translate', async (c) => {
  try {
    const { text, sourceLang = 'en', targetLang = 'hi', useDemo } = await c.req.json();
    if (!text) return c.json({ success: false, error: 'No text' }, 400);

    const result = await translateMedicalText(c.env.GEMINI_API_KEY, text, sourceLang, targetLang);
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 5. Reminders
app.get('/reminders', async (c) => {
  try {
    const reminders = await fetchRemindersFromNeon(c.env.DATABASE_URL);
    return c.json({ success: true, data: reminders || [] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post('/reminders', async (c) => {
  try {
    const body = await c.req.json();
    const saved = await saveReminderToNeon(c.env.DATABASE_URL, body);
    return c.json({ success: true, persisted: saved });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 6. AI Chatbot
app.post('/chat', async (c) => {
  try {
    const { message } = await c.req.json();
    if (!message) return c.json({ success: false, error: 'No message' }, 400);
    const reply = await handleAIChat(c.env.GEMINI_API_KEY, message);
    return c.json({ success: true, data: { reply } });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default app;
