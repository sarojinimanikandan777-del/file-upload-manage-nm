const FileMeta = require('../models/FileMeta');
}
res.json({ files: created });
} catch (err) { next(err); }
};


exports.list = async (req, res, next) => {
try {
const { q, page = 1, limit = 10 } = req.query;
const filter = { owner: req.user.userId };
if (q) filter.filename = { $regex: q, $options: 'i' };
const skip = (page - 1) * limit;
const total = await FileMeta.countDocuments(filter);
const files = await FileMeta.find(filter).sort({ uploadDate: -1 }).skip(skip).limit(parseInt(limit));
res.json({ total, page: parseInt(page), limit: parseInt(limit), files });
} catch (err) { next(err); }
};


exports.download = async (req, res, next) => {
try {
const id = req.params.id;
const meta = await FileMeta.findById(id);
if (!meta) return res.status(404).json({ error: 'File not found' });
// authorize: allow owner or if public
if (meta.owner.toString() !== req.user.userId && !meta.public) return res.status(403).json({ error: 'Forbidden' });


const gfs = getGFS();
const readstream = gfs.createReadStream({ _id: meta.gridFsId });
res.set('Content-Type', meta.mimeType || 'application/octet-stream');
res.set('Content-Disposition', `attachment; filename="${meta.filename}"`);
readstream.pipe(res);
} catch (err) { next(err); }
};


exports.delete = async (req, res, next) => {
try {
const id = req.params.id;
const meta = await FileMeta.findById(id);
if (!meta) return res.status(404).json({ error: 'File not found' });
if (meta.owner.toString() !== req.user.userId && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });


const gfs = getGFS();
gfs.remove({ _id: meta.gridFsId, root: 'uploads' }, async (err) => {
if (err) return next(err);
await meta.remove();
res.json({ ok: true });
});
} catch (err) { next(err); }
};


exports.rename = async (req, res, next) => {
try {
const id = req.params.id;
const { newName } = req.body;
const meta = await FileMeta.findById(id);
if (!meta) return res.status(404).json({ error: 'File not found' });
if (meta.owner.toString() !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
meta.filename = newName;
await meta.save();
res.json(meta);
} catch (err) { next(err); }
};


exports.share = async (req, res, next) => {
try {
// create a short token and set public = true
const id = req.params.id;
const meta = await FileMeta.findById(id);
if (!
