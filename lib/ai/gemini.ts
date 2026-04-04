interface GeminiInlineData {
  mimeType: string;
  base64Data: string;
}

interface GenerateGeminiJsonOptions {
  prompt: string;
  inlineData?: GeminiInlineData;
  model?: string;
  timeoutMs?: number;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

function extractJsonPayload(raw: string): string {
  const trimmed = raw.trim();

  if (trimmed.startsWith("```")) {
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch?.[1]) return fenceMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const firstBracket = trimmed.indexOf("[");

  const starts: number[] = [firstBrace, firstBracket].filter((index) => index >= 0);

  if (starts.length > 0) {
    const firstStart = Math.min(...starts);
    const startsWithArray = trimmed[firstStart] === "[";
    const lastEnd = startsWithArray ? trimmed.lastIndexOf("]") : trimmed.lastIndexOf("}");

    if (lastEnd > firstStart) {
      return trimmed.slice(firstStart, lastEnd + 1);
    }
  }

  return trimmed;
}

export async function generateGeminiJson<T>(options: GenerateGeminiJsonOptions): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API key. Set GEMINI_API_KEY in your environment.");
  }

  const model = options.model ?? process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const timeoutMs = options.timeoutMs ?? 45000;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const parts: Array<Record<string, unknown>> = [{ text: options.prompt }];

    if (options.inlineData) {
      parts.push({
        inline_data: {
          mime_type: options.inlineData.mimeType,
          data: options.inlineData.base64Data,
        },
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts,
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.5,
          },
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText.slice(0, 300)}`);
    }

    const payload = (await response.json()) as GeminiResponse;
    const rawText = payload.candidates?.[0]?.content?.parts?.find((part) => Boolean(part.text))?.text;

    if (!rawText) {
      throw new Error("Gemini response did not include text content.");
    }

    const jsonPayload = extractJsonPayload(rawText);
    return JSON.parse(jsonPayload) as T;
  } finally {
    clearTimeout(timeout);
  }
}
