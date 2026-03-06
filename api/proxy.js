import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/proxy/openrouter', async (req, res) => {
  try {
    const { messages, model } = req.body;
    const apiKey = process.env.REACT_APP_OPENROUTER_KEY;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key missing' });
    }

    console.log('📡 Proxy forwarding to OpenRouter...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'LumaCare'
      },
      body: JSON.stringify({
        model: model || 'mistralai/mistral-7b-instruct',
        messages,
        temperature: 0.8,
        max_tokens: 250
      })
    });

    const data = await response.json();
    console.log('✅ Proxy success');
    res.json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
  console.log(`🔑 API Key present: ${process.env.REACT_APP_OPENROUTER_KEY ? 'Yes' : 'No'}`);
});
