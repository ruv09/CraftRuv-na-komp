import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import pino from 'pino';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createServer } from 'http';
const logger = pino({ transport: { target: 'pino-pretty' } });
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
const PHRASES = [];
const FAVORITES = [];
const WARM_MESSAGES = [];
function seedPhrases() {
    if (PHRASES.length)
        return;
    const ru = {
        morning: [
            'Доброе утро. Твоя ценность не зависит от достижений.',
            'Ты уже сделал главное — проснулся. Этого достаточно.',
            'Сегодня можно идти мягко. Ты не обязан спешить.'
        ],
        day: [
            'Сделай вдох. Ты имеешь право на паузу.',
            'Если тяжело — это нормально. Ты не один.',
            'Ты достаточно хорош просто тем, что есть.'
        ],
        evening: [
            'Сегодня ты сделал достаточно. Отдых — тоже достижение.',
            'Спасибо себе за этот день. Ты справился.',
            'Ночь — чтобы мягко отпустить. Спокойной тебе тишины.'
        ]
    };
    const en = {
        morning: [
            'Good morning. Your worth is not measured by output.',
            'You did the hardest part — you woke up. That is enough.',
            'Move gently today. You do not have to rush.'
        ],
        day: [
            'Take a breath. You are allowed to pause.',
            'If it feels heavy, that is okay. You are not alone.',
            'You are enough — exactly as you are.'
        ],
        evening: [
            'You did enough today. Rest is progress too.',
            'Thank yourself for this day. You made it through.',
            'Night invites softness. May you rest with ease.'
        ]
    };
    ['ru', 'en'].forEach((lang) => {
        ['morning', 'day', 'evening'].forEach((part) => {
            const arr = (lang === 'ru' ? ru : en)[part];
            arr.forEach((text) => {
                PHRASES.push({ id: uuidv4(), lang, part, text });
            });
        });
    });
}
seedPhrases();
// Simple device identification
const registerBody = z.object({
    deviceId: z.string().min(1).optional(),
    locale: z.enum(['ru', 'en']).default('ru'),
    timezone: z.string().default('UTC'),
});
app.post('/api/auth/device', (req, res) => {
    const parsed = registerBody.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error.flatten());
    const { deviceId, locale, timezone } = parsed.data;
    const id = deviceId ?? uuidv4();
    return res.json({ deviceId: id, locale, timezone });
});
// Phrases
const phrasesQuery = z.object({
    lang: z.enum(['ru', 'en']).default('ru'),
    part: z.enum(['morning', 'day', 'evening']).optional(),
    limit: z.coerce.number().min(1).max(50).default(10),
});
app.get('/api/phrases', (req, res) => {
    const parsed = phrasesQuery.safeParse(req.query);
    if (!parsed.success)
        return res.status(400).json(parsed.error.flatten());
    const { lang, part, limit } = parsed.data;
    let list = PHRASES.filter((p) => p.lang === lang);
    if (part)
        list = list.filter((p) => p.part === part);
    // random sample
    list = [...list].sort(() => Math.random() - 0.5).slice(0, limit);
    res.json(list);
});
app.get('/api/phrases/:id', (req, res) => {
    const ph = PHRASES.find((p) => p.id === req.params.id);
    if (!ph)
        return res.status(404).json({ message: 'Not found' });
    res.json(ph);
});
// Favorites
const favoriteBody = z.object({ deviceId: z.string().min(1), phraseId: z.string().min(1) });
app.post('/api/favorites', (req, res) => {
    const parsed = favoriteBody.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error.flatten());
    const { deviceId, phraseId } = parsed.data;
    const exists = FAVORITES.find((f) => f.deviceId === deviceId && f.phraseId === phraseId);
    if (exists)
        return res.status(200).json(exists);
    const fav = { id: uuidv4(), deviceId, phraseId, createdAt: new Date().toISOString() };
    FAVORITES.push(fav);
    res.status(201).json(fav);
});
app.get('/api/favorites', (req, res) => {
    const deviceId = req.query.deviceId;
    if (!deviceId)
        return res.status(400).json({ message: 'deviceId required' });
    const list = FAVORITES.filter((f) => f.deviceId === deviceId).map((f) => ({
        ...f,
        phrase: PHRASES.find((p) => p.id === f.phraseId) || null,
    }));
    res.json(list);
});
// Send warmth to a friend
const warmBody = z.object({
    text: z.string().min(1).max(500),
    fromName: z.string().max(64).optional(),
    toAlias: z.string().max(64).optional(),
});
app.post('/api/warm', (req, res) => {
    const parsed = warmBody.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error.flatten());
    const msg = { id: uuidv4(), createdAt: new Date().toISOString(), ...parsed.data };
    WARM_MESSAGES.push(msg);
    res.status(201).json(msg);
});
app.get('/api/warm', (_req, res) => {
    // public feed (latest 50)
    const list = [...WARM_MESSAGES].reverse().slice(0, 50);
    res.json(list);
});
// Health
app.get('/health', (_req, res) => res.json({ ok: true }));
const PORT = Number(process.env.PORT) || 3000;
const server = createServer(app);
server.listen(PORT, () => {
    logger.info(`Warmly API listening on http://localhost:${PORT}`);
});
