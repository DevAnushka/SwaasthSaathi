import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExtractedMedication {
  id: string;
  name: string;
  dosage: string;
  form: string;
  frequency: string;
  timing: string;
  mealRelation: 'Before Food' | 'After Food' | 'With Food' | 'Anytime';
  durationDays: number;
  instructions: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface PrescriptionAnalysisResult {
  doctorName?: string;
  patientName?: string;
  date?: string;
  diagnosis?: string;
  medications: ExtractedMedication[];
  precautions: string[];
  warnings: string[];
  summary: string;
  isSimulated?: boolean;
}

export interface MedicalTranslationResult {
  sourceText: string;
  sourceLang: 'en' | 'hi';
  targetLang: 'en' | 'hi';
  translatedText: string;
  phoneticPronunciation?: string;
  simpleExplanation: string;
  keyMedicalTerms: Array<{
    term: string;
    translation: string;
    meaning: string;
  }>;
  isSimulated?: boolean;
}

function getGeminiClient(apiKey: string): GoogleGenerativeAI | null {
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey.trim());
}

export async function analyzePrescriptionImage(
  apiKey: string,
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<PrescriptionAnalysisResult> {
  const client = getGeminiClient(apiKey);
  if (!client) return getFallbackPrescriptionAnalysis();

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
You are a world-class clinical pharmacist and AI medical OCR specialist.
Analyze this medical prescription image thoroughly and extract all information into a strict JSON object.

Output ONLY valid JSON with this exact structure:
{
  "doctorName": "Dr. Name if visible, or null",
  "patientName": "Patient Name if visible, or null",
  "date": "Date if visible, or null",
  "diagnosis": "Clinical diagnosis or condition mentioned",
  "medications": [
    {
      "id": "med-1",
      "name": "Generic or Brand Medicine Name",
      "dosage": "Strength/Dose",
      "form": "Tablet / Capsule / Syrup / Drops / Inhaler",
      "frequency": "e.g. 1-0-1",
      "timing": "Morning / Afternoon / Evening / Night",
      "mealRelation": "Before Food / After Food / With Food / Anytime",
      "durationDays": 5,
      "instructions": "Specific guidance",
      "timeSlot": "morning"
    }
  ],
  "precautions": ["General lifestyle advice"],
  "warnings": ["Potential drug interactions"],
  "summary": "Brief 2-sentence clinical summary"
}
`;

    const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const response = await model.generateContent([
      prompt,
      { inlineData: { data: cleanBase64, mimeType } }
    ]);
    
    const text = response.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return { ...JSON.parse(jsonMatch[0]), isSimulated: false };
    }
    throw new Error('Invalid JSON');
  } catch (error) {
    console.error('Gemini vision analysis failed', error);
    const fallback = getFallbackPrescriptionAnalysis();
    fallback.warnings.push('Note: Analysis generated via fallback due to API error.');
    return fallback;
  }
}

export async function translateMedicalText(
  apiKey: string,
  text: string,
  sourceLang: 'en' | 'hi',
  targetLang: 'en' | 'hi'
): Promise<MedicalTranslationResult> {
  const client = getGeminiClient(apiKey);
  if (!client) return getFallbackTranslation(text, sourceLang, targetLang);

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
You are an expert bilingual medical doctor and translator fluent in English and Hindi.
Translate the following medical statement from ${sourceLang === 'en' ? 'English' : 'Hindi'} to ${targetLang === 'en' ? 'English' : 'Hindi'}.

Input Medical Statement:
"${text}"

Provide response in strict JSON:
{
  "sourceText": "${text.replace(/"/g, '\\"')}",
  "sourceLang": "${sourceLang}",
  "targetLang": "${targetLang}",
  "translatedText": "Accurate medical translation",
  "phoneticPronunciation": "Romanized English phonetic pronunciation for Hindi text",
  "simpleExplanation": "1-sentence simple layman's explanation",
  "keyMedicalTerms": [
    {
      "term": "term",
      "translation": "translation",
      "meaning": "meaning"
    }
  ]
}
`;

    const response = await model.generateContent(prompt);
    const jsonMatch = response.response.text().match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return { ...JSON.parse(jsonMatch[0]), isSimulated: false };
    }
    throw new Error('Invalid JSON');
  } catch (err) {
    console.error('Translation failed', err);
    return getFallbackTranslation(text, sourceLang, targetLang);
  }
}

export async function handleAIChat(apiKey: string, message: string): Promise<string> {
  const client = getGeminiClient(apiKey);
  if (!client) return "I am currently running in offline mode. Please configure the Gemini API key for the AI Chatbot to function.";
  
  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
You are CareConnect AI, a helpful, minimalist medical assistant.
The user is using the CareConnect app. You can answer general health queries or help them navigate.
If they ask for hospitals, tell them to use the "Hospitals" tab.
If they want to scan a prescription, tell them to use the "Scanner" tab.
If they need reminders, point them to the "Reminders" tab.
Keep your answer very concise, friendly, and minimalist (like Apple). No markdown formatting if possible, just clean text.

User: ${message}
`;
    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (err) {
    console.error('Chat failed', err);
    return "I'm having trouble connecting to the AI brain right now. Please try again later.";
  }
}

export function getFallbackPrescriptionAnalysis(): PrescriptionAnalysisResult {
  return {
    doctorName: "Dr. Rajesh Sharma",
    medications: [
      { id: "med-aug-1", name: "Augmentin", dosage: "625 mg", form: "Tablet", frequency: "1-0-1", timing: "Morning & Night", mealRelation: "After Food", durationDays: 5, instructions: "Complete course", timeSlot: "morning" }
    ],
    precautions: ["Drink warm water"],
    warnings: ["Do not combine cold remedies"],
    summary: "Antibiotic regimen for respiratory infection.",
    isSimulated: true
  };
}

export function getFallbackTranslation(text: string, sourceLang: string, targetLang: string): MedicalTranslationResult {
  return {
    sourceText: text,
    sourceLang: sourceLang as any,
    targetLang: targetLang as any,
    translatedText: targetLang === 'hi' ? "मुझे सुबह से सीने में दर्द है।" : "I have chest pain since morning.",
    phoneticPronunciation: "Mujhe subah se seene mein dard hai.",
    simpleExplanation: "Indicates discomfort in chest.",
    keyMedicalTerms: [{ term: "Chest pain", translation: "सीने में दर्द", meaning: "Discomfort in thoracic area" }],
    isSimulated: true
  };
}
