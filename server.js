const express = require('express');
id,
originalName: f.originalname,
storedName: f.filename,
size: f.size,
mimeType: f.mimetype,
uploadDate: new Date().toISOString()
};
meta.push(entry);
return entry;
});
writeMeta(meta);
res.json({ files: added });
});


// List files
app.get('/api/files', (req, res) => {
const meta = readMeta();
res.json(meta);
});


// Download by id
app.get('/api/files/:id/download', (req, res) => {
const id = req.params.id;
const meta = readMeta();
const entry = meta.find(e => e.id === id);
if (!entry) return res.status(404).json({ error: 'File not found' });
const filePath = path.join(UPLOAD_DIR, entry.storedName);
if (!fs.existsSync(filePath)) return res.status(410).json({ error: 'File missing on server' });
res.download(filePath, entry.originalName);
});


// Delete by id
app.delete('/api/files/:id', (req, res) => {
const id = req.params.id;
let meta = readMeta();
const idx = meta.findIndex(e => e.id === id);
if (idx === -1) return res.status(404).json({ error: 'File not found' });


const [entry] = meta.splice(idx, 1);
const filePath = path.join(UPLOAD_DIR, entry.storedName);
if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
writeMeta(meta);
res.json({ ok: true });
});


// Serve uploaded files folder for direct access if needed (optional)
app.use('/uploads', express.static(UPLOAD_DIR));


app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
