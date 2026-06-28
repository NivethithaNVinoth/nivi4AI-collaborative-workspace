// Thin wrapper around the Anthropic SDK with a graceful MOCK fallback.
// LIVE mode (ANTHROPIC_API_KEY set) -> real Claude. MOCK mode -> deterministic
// templated output so the platform is fully demoable with no key.
import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
export const MODE = apiKey ? 'LIVE' : 'MOCK';
export const MODEL = process.env.CLAUDE_MODEL?.trim() || 'claude-sonnet-4-6';

const client = apiKey ? new Anthropic({ apiKey }) : null;

export async function createMessage(params) {
  if (!client) throw new Error('No API key (MOCK mode). createMessage should not be called.');
  return client.messages.create({ max_tokens: 2048, ...params });
}

export function isLive() { return MODE === 'LIVE'; }
