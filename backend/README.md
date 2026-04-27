# Backend

Minimal poster AI backend service for the low-code editor.

## Run

1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` if needed
4. `npm run dev`

Default server:

- `http://localhost:3000/api/health`
- `http://localhost:3000/api/ai/health`
- `POST http://localhost:3000/api/ai/generate-poster`

## Request

```json
{
  "prompt": "做一个新年元旦海报，主标题是新年快乐",
  "size": "1080x1920",
  "style": "festival"
}
```

## Response

```json
{
  "ok": true,
  "provider": "mock",
  "nodes": []
}
```

If `LLM_API_KEY` is not configured, the service returns mock poster nodes so the frontend can still be tested.
