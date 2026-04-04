import 'dotenv/config';
import express from 'express';
import Groq from 'groq-sdk';
import Chat from '../models/Chat.js';
import protect from '../middleware/auth.js';

const router = express.Router();
const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const PERSONAS = {
  default:  `You are QuickAI, a smart and helpful AI assistant. Be concise, accurate, and friendly. Format responses using markdown when appropriate.`,
  coder:    `You are an expert software engineer. Help with code, debugging, and architecture. Always provide working code examples with markdown code blocks. Be precise and technical.`,
  tutor:    `You are a patient and encouraging tutor. Explain concepts clearly using examples, analogies, and step-by-step breakdowns. Adapt to the student's level.`,
  writer:   `You are a creative writing assistant. Help with storytelling, editing, tone, and structure. Be expressive, imaginative, and give constructive feedback.`,
  analyst:  `You are a data analyst and business strategist. Provide structured, data-driven insights using bullet points, frameworks, and clear logic. Be concise and actionable.`
};

const getSystemPrompt = (persona) =>
  (PERSONAS[persona] || PERSONAS.default) + ` Today's date is ${new Date().toLocaleDateString()}.`;

// GET /api/chat
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .select('title persona totalTokens createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json(chats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/chat/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/chat/new
router.post('/new', protect, async (req, res) => {
  try {
    const chat = await Chat.create({ userId: req.user._id, messages: [] });
    res.status(201).json(chat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/chat/:id/rename
router.patch('/:id/rename', protect, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Title required' });
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title: title.trim() },
      { new: true }
    );
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json({ title: chat.title });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/chat/:id/stream  — streaming with SSE
router.post('/:id/stream', protect, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    const { message, image, persona = 'default' } = req.body;
    if (!message?.trim()) { send({ error: 'Message is empty' }); return res.end(); }

    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) { send({ error: 'Chat not found' }); return res.end(); }

    // Auto-title from first message
    if (chat.messages.length === 0) {
      chat.title = message.slice(0, 60) + (message.length > 60 ? '...' : '');
    }
    chat.persona = persona;
    chat.messages.push({ role: 'user', content: message.trim(), image: image || null });

    // Build messages for Groq - use vision model if image present
    const model = image ? 'llama-3.2-11b-vision-preview' : 'llama-3.3-70b-versatile';

    const contextMessages = chat.messages.map((m) => {
      if (m.image && m.role === 'user') {
        return {
          role: 'user',
          content: [
            { type: 'text', text: m.content },
            { type: 'image_url', image_url: { url: m.image } }
          ]
        };
      }
      return { role: m.role, content: m.content };
    });

    const stream = await getGroq().chat.completions.create({
      model,
      messages: [{ role: 'system', content: getSystemPrompt(persona) }, ...contextMessages],
      max_tokens: 1024,
      temperature: 0.7,
      stream: true,
      stream_options: { include_usage: true }
    });

    let fullContent = '';
    let totalTokens = 0;

    req.on('close', () => { try { stream.controller.abort(); } catch {} });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) { fullContent += delta; send({ delta }); }
      if (chunk.usage) totalTokens = chunk.usage.total_tokens;
    }

    chat.messages.push({ role: 'assistant', content: fullContent, tokens: totalTokens });
    chat.totalTokens = (chat.totalTokens || 0) + totalTokens;
    await chat.save();

    send({ done: true, totalTokens, title: chat.title });
    res.end();

  } catch (err) {
    console.error('Stream error:', err);
    send({ error: err.message });
    res.end();
  }
});

// DELETE /api/chat/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
