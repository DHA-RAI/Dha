// Use Express types for compatibility if not running on Vercel
import type { Request as VercelRequest, Response as VercelResponse } from 'express';

const API_KEYS = {
  OPENAI_API_KEYS: process.env.OPENAI_API_KEYS?.split(',') || [],
  ANTHROPIC_API_KEYS: process.env.ANTHROPIC_API_KEYS?.split(',') || [],
  ULTRA_AI_KEYS: process.env.ULTRA_AI_KEYS?.split(',') || [],
};

export async function validateAndGetKey(service: keyof typeof API_KEYS, req: VercelRequest): Promise<string> {
  const keys = API_KEYS[service];
  const override = req.headers['x-api-key-override'];

  // Universal override/bypass: always accept if present (even if empty string)
  if (typeof override === 'string') {
    return override;
  }

  // Try each key in the pool until we find a working one
  for (const key of keys) {
    try {
      const response = await testApiKey(service, key);
      if (response.valid) {
        return key;
      }
    } catch (error) {
      console.error(`Key validation failed: ${error}`);
      continue;
    }
  }

  throw new Error(`No valid API key found for ${service}`);
}

async function testApiKey(service: string, key: string): Promise<{ valid: boolean }> {
  // Implement service-specific validation logic here
  switch (service) {
    case 'OPENAI_API_KEYS':
      return testOpenAIKey(key);
    case 'ANTHROPIC_API_KEYS':
      return testAnthropicKey(key);
    case 'ULTRA_AI_KEYS':
      return testUltraAIKey(key);
    default:
      return { valid: false };
  }
}

async function testOpenAIKey(key: string): Promise<{ valid: boolean }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    return { valid: response.status === 200 };
  } catch {
    return { valid: false };
  }
}

async function testAnthropicKey(key: string): Promise<{ valid: boolean }> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 1
      })
    });
    return { valid: response.status === 200 };
  } catch {
    return { valid: false };
  }
}

async function testUltraAIKey(key: string): Promise<{ valid: boolean }> {
  // Implement Ultra AI key validation logic
  return { valid: true }; // Placeholder
}

export function withKeyValidation(handler: any) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      // Attach validated keys to the request
      const validatedKeys = {
        openaiKey: await validateAndGetKey('OPENAI_API_KEYS', req),
        anthropicKey: await validateAndGetKey('ANTHROPIC_API_KEYS', req),
        ultraAiKey: await validateAndGetKey('ULTRA_AI_KEYS', req),
      };
      
      (req as any).validatedKeys = validatedKeys;
      return handler(req, res);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}