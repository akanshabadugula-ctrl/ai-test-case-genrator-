import { HttpError } from '../../middlewares/errors.js';

interface GroqMessage { role: 'system' | 'user' | 'assistant'; content: string }

export async function completeWithGroq(messages: GroqMessage[], apiKey?: string, model = 'llama-3.3-70b-versatile'): Promise<string> {
  if (!apiKey) throw new HttpError(503, 'AI_NOT_CONFIGURED', 'AI features require GROQ_API_KEY to be configured on the server.');
  let response: Response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 3000 }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    throw new HttpError(503, 'AI_UNAVAILABLE', 'Could not reach the AI provider. Check the server connection and try again.');
  }
  if (!response.ok) {
    if (response.status === 429) throw new HttpError(503, 'AI_RATE_LIMITED', 'The AI provider is busy. Try again in a moment.');
    if (response.status >= 500) throw new HttpError(503, 'AI_UNAVAILABLE', 'The AI provider is temporarily unavailable.');
    throw new HttpError(502, 'AI_REQUEST_FAILED', 'The AI request could not be completed. Check the server AI configuration.');
  }
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new HttpError(502, 'AI_EMPTY_RESPONSE', 'The AI provider returned an empty response.');
  return content;
}
