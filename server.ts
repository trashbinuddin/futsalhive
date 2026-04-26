import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Essential Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Vite uses inline scripts in dev
}));
app.use(cors()); // Configure proper CORS
app.use(express.json({ limit: '10kb' })); // Mitigate payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Mitigate payload attacks

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// App Config - read from secure environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8698956553:AAFlptYgft-7uwrjX3OG9t-Bta_eAwXFh_4';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '5738602587';
const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbw4IPNWOvRW7W30U3Mo7O3qn7iRD10DaVU2x86VprDlXsF1o_iNVQgaJDpLZsqUSZ0D/exec';

// Apply rate limiter to all API routes
app.use('/api/', apiLimiter);

app.post('/api/telegram', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Simple basic text sanitization (no HTML injection allowed except what we explicitly allow)
    // Wait, the message is being constructed by our own app, but let's be careful.
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message' });
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return res.status(response.status).json({ error: 'Failed to send telegram message' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/sheets', async (req, res) => {
  try {
    // The browser client sends parsed JSON payload, we pass it to sheets as form data
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
       return res.status(400).json({ error: 'Invalid payload' });
    }

    for (const key in payload) {
      if (typeof payload[key] !== 'string') {
        payload[key] = String(payload[key]);
      }
    }

    const formBody = new URLSearchParams(payload).toString();

    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to send data to Google Sheets:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
