import express from 'express';
const app = express(); app.use(express.json({limit:'512kb'}));
app.get('/api/health', (_req,res) => res.json({ ok: true, project: 'repo-galaxy' }));
app.listen(5202, '127.0.0.1', () => console.log('[repo-galaxy] api ready on 5202'));
