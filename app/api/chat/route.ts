import { NextResponse } from 'next/server';

import { generateGeminiReply, type GeminiChatMessage } from '@/lib/gemini';

type ChatRequestBody = {
  history?: Array<{
    role?: string;
    text?: string;
  }>;
  message?: string;
};

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  try {
    const body = (await request.json()) as ChatRequestBody;
    const message = body.message?.trim();

    if (!message) {
      console.warn(`[api/chat][${requestId}] Missing message in request body.`);
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const history: GeminiChatMessage[] = (body.history ?? [])
      .map<GeminiChatMessage>((item) => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        text: item.text?.trim() ?? '',
      }))
      .filter((item) => item.text.length > 0);

    console.info(
      `[api/chat][${requestId}] Calling Gemini | historyTurns=${history.length} | messageLength=${message.length}`,
    );

    const reply = await generateGeminiReply({
      history,
      message,
      requestId,
    });

    const durationMs = Date.now() - startedAt;
    console.info(
      `[api/chat][${requestId}] Gemini success | replyLength=${reply.length} | durationMs=${durationMs}`,
    );

    return NextResponse.json({ reply });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    console.error(`[api/chat][${requestId}] Gemini chat route error | durationMs=${durationMs}`, error);
    return NextResponse.json(
      { error: 'Failed to generate response from Gemini.' },
      { status: 500 },
    );
  }
}
