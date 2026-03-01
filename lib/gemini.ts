import { GoogleGenAI } from '@google/genai';

export type GeminiChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

const DEFAULT_MODEL = 'gemini-2.5-flash';

let client: GoogleGenAI | null = null;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable.');
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }

  return client;
}

function toGeminiRole(role: GeminiChatMessage['role']) {
  return role === 'assistant' ? 'model' : 'user';
}

export async function generateGeminiReply(params: {
  message: string;
  history?: GeminiChatMessage[];
  requestId?: string;
}) {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const history = params.history ?? [];
  const requestId = params.requestId ?? 'no-request-id';

  const contents = [...history, { role: 'user' as const, text: params.message }]
    .map((item) => ({
      role: toGeminiRole(item.role),
      parts: [{ text: item.text.trim() }],
    }))
    .filter((item) => item.parts[0].text.length > 0);

  const startedAt = Date.now();
  console.info(
    `[gemini][${requestId}] generateContent start | model=${model} | contents=${contents.length}`,
  );

  let response;
  try {
    response = await getGeminiClient().models.generateContent({ model, contents });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    console.error(`[gemini][${requestId}] generateContent failed | durationMs=${durationMs}`, error);
    throw error;
  }

  const durationMs = Date.now() - startedAt;
  console.info(`[gemini][${requestId}] generateContent done | durationMs=${durationMs}`);

  const text = response.text?.trim();
  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  return text;
}
