import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { generatePosterNodes } from './llm.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'lowcode-backend',
  });
});

app.get('/api/ai/health', (_req, res) => {
  res.json({
    available: true,
    provider: process.env.LLM_API_KEY ? 'deepseek' : 'mock',
  });
});

app.get('/api/ai/generate-poster/stream', async (req, res) => {
  const prompt = String(req.query.prompt || '').trim();
  const size = String(req.query.size || '1080x1920');
  const style = String(req.query.style || 'festival');

  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required.' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
  };

  const sendContentDelta = async (text, interval = 18) => {
    for (const char of Array.from(text)) {
      sendEvent('content_delta', { delta: char });
      if (interval > 0) {
        await delay(interval);
      }
    }
  };

  const toolCallId = `tool_${Date.now()}`;

  try {
    sendEvent('tool_call', {
      id: toolCallId,
      name: 'generate_poster',
      status: 'running',
    });

    await sendContentDelta('正在理解你的海报需求...\n');

    const result = await generatePosterNodes({ prompt, size, style });
    const orderedNodes = [...result.nodes].sort((left, right) => {
      if (left.id === 'root_page') return -1;
      if (right.id === 'root_page') return 1;
      return 0;
    });

    await sendContentDelta(
      `海报结构已生成，正在逐步渲染到画布。共 ${orderedNodes.length} 个节点，来源：${result.provider}。\n`,
      16
    );

    for (const node of orderedNodes) {
      sendEvent('component_patch', {
        op: 'upsert',
        node,
      });

      const progressMessage =
        node.id === 'root_page'
          ? '已创建画布底板。\n'
          : `已放置 ${node.type} 组件。\n`;
      await sendContentDelta(progressMessage, 10);
      await delay(30);
    }

    sendEvent('component_snapshot', {
      components: orderedNodes,
    });

    sendEvent('tool_result', {
      toolCallId,
      result: {
        provider: result.provider,
        nodeCount: orderedNodes.length,
      },
    });

    sendEvent('done', { ok: true });
    res.end();
  } catch (error) {
    console.error('[Backend] generate-poster stream failed:', error);
    sendEvent('tool_result', {
      toolCallId,
      result: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    sendEvent('error', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    res.end();
  }
});

app.post('/api/ai/generate-poster', async (req, res) => {
  try {
    const { prompt = '', size = '1080x1920', style = 'festival' } = req.body || {};

    if (!String(prompt).trim()) {
      res.status(400).json({
        error: 'Prompt is required.',
      });
      return;
    }

    const result = await generatePosterNodes({ prompt, size, style });

    res.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error('[Backend] generate-poster failed:', error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(port, () => {
  console.log(`[Backend] listening on http://localhost:${port}`);
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
