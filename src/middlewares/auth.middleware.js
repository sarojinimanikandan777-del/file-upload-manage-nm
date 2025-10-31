const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';


function auth(req, res, next) {
const header = req.headers.authorization;
if (!header) return res.status(401).json({ error: 'Not authenticated' });
const token = header.split(' ')[1];
try {
const payload = jwt.verify(token, JWT_SECRET);
req.user = payload;
next();
} catch (e) { res.status(401).json({ error: 'Invalid token' }); }
}


function requireRole(role) {
return (req, res, next) => {
if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
next();
};
}


module.exports = { auth, requireRole };
