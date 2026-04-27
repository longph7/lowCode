import { buildMockPosterNodes, normalizePosterNodes } from './poster-schema.js';

const SYSTEM_PROMPT = `
You generate poster editor data for a low-code editor.
Return only JSON.
The JSON must be an array of ComponentNode objects.
Each node must have:
- id: string
- type: one of Page, Title, Image
- props: object
- position: { x:number, y:number, width:number, height:number }
- parentId: optional string
Always include a root page node with id "root_page" and type "Page".
Do not use markdown fences.
`.trim();

export async function generatePosterNodes({ prompt, size, style }) {
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    return {
      nodes: buildMockPosterNodes(prompt),
      provider: 'mock'
    };
  }

  const baseUrl = (process.env.LLM_BASE_URL || 'https://api.deepseek.com/v1').replace(/\/$/, '');
  const model = process.env.LLM_MODEL || 'deepseek-chat';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            task: 'Generate poster nodes',
            prompt,
            size,
            style
          })
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('LLM response did not contain message content.');
  }

  const parsed = JSON.parse(content);
  const nodes = normalizePosterNodes(parsed.nodes || parsed);

  return {
    nodes,
      provider: 'deepseek'
  };
}
